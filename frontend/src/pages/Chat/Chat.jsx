import { useCallback, useEffect, useRef, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "./Chat.css";
import { useAuth } from "../../context/AuthContext";
import { useSocket } from "../../context/SocketContext";
import {
  getConversations,
  createConversation,
  getMessages,
  sendMessage as apiSendMessage,
  markConversationSeen,
  getTeammates,
  editMessage,
  deleteMessage,
  addReaction,
  removeReaction
} from "../../services/chatService";

// Helpers
const COLORS = ["#6366f1", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981", "#3b82f6", "#ef4444", "#14b8a6"];
const avatarColor = (str = "") => COLORS[str.charCodeAt(0) % COLORS.length];
const initials = (name = "") =>
  name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);

const fmtTime = (iso) => {
  if (!iso) return "";
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

const fmtSidebarTime = (iso) => {
  if (!iso) return "";
  const d = new Date(iso);
  const now = new Date();
  const diffDays = Math.floor((now - d) / 86400000);
  if (diffDays === 0) return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return d.toLocaleDateString([], { weekday: "short" });
  return d.toLocaleDateString([], { month: "short", day: "numeric" });
};

const fmtDateDivider = (iso) => {
  if (!iso) return "";
  const d = new Date(iso);
  const now = new Date();
  const diff = Math.floor((now - d) / 86400000);
  if (diff === 0) return "Today";
  if (diff === 1) return "Yesterday";
  return d.toLocaleDateString([], { weekday: "long", month: "long", day: "numeric" });
};

const sameDay = (a, b) => {
  const da = new Date(a), db = new Date(b);
  return (
    da.getFullYear() === db.getFullYear() &&
    da.getMonth() === db.getMonth() &&
    da.getDate() === db.getDate()
  );
};

// Reusable Components
function Avatar({ name = "?", size = "md", online = false, isGroup = false }) {
  return (
    <div
      className={`tg-avatar${size === "sm" ? " tg-avatar--sm" : ""}`}
      style={{
        background: isGroup ? "var(--primary)" : avatarColor(name),
        color: isGroup ? "var(--surface)" : "#fff",
        borderRadius: isGroup ? "30%" : "50%",
      }}
    >
      {isGroup ? "👥" : initials(name)}
      {online && !isGroup && <span className="tg-avatar__dot" />}
    </div>
  );
}

export default function Chat() {
  const { user } = useAuth();
  const { socket, connected, isUserOnline } = useSocket();

  const [conversations, setConversations] = useState([]);
  const [teammates, setTeammates] = useState([]);
  const [selectedConv, setSelectedConv] = useState(null);
  const [messages, setMessages] = useState([]);
  
  // Search & Filters state
  const [search, setSearch] = useState("");
  const [msgQuery, setMsgQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("ALL"); // ALL, UNREAD, PRIVATE, TEAMS
  
  // Loading & Action states
  const [loadingConvs, setLoadingConvs] = useState(true);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [sending, setSending] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Input states
  const [text, setText] = useState("");
  const [codeLanguage, setCodeLanguage] = useState(""); // empty means plain text message
  const [isCodeSnippetsMode, setIsCodeSnippetsMode] = useState(false);
  const [emojiOpen, setEmojiOpen] = useState(false);

  // Message edits & replies
  const [editingMsg, setEditingMsg] = useState(null);
  const [editText, setEditText] = useState("");

  const [isPartnerTyping, setIsPartnerTyping] = useState(false);
  const [partnerReadAt, setPartnerReadAt] = useState(null);

  const selectedConvRef = useRef(null);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const typingTimerRef = useRef(null);
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => { selectedConvRef.current = selectedConv; }, [selectedConv]);

  useEffect(() => {
    loadChatData();
  }, []);

  const loadChatData = async () => {
    try {
      setLoadingConvs(true);
      const [convs, tms] = await Promise.all([getConversations(), getTeammates()]);
      setConversations(Array.isArray(convs) ? convs : []);
      setTeammates(Array.isArray(tms) ? tms : []);
    } catch (err) {
      console.error("[Chat] initial load:", err);
    } finally {
      setLoadingConvs(false);
    }
  };

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Socket setup
  useEffect(() => {
    if (!socket || !connected || !selectedConv) return;
    socket.emit("join_conversation", selectedConv.id);
    return () => {
      if (socket && selectedConv) socket.emit("leave_conversation", selectedConv.id);
    };
  }, [socket, connected, selectedConv?.id]);

  useEffect(() => {
    if (!socket) return;

    const onMessage = (msg) => {
      const cur = selectedConvRef.current;
      if (cur?.id === msg.conversationId) {
        setMessages((prev) => {
          const safePrev = Array.isArray(prev) ? prev : [];
          if (safePrev.some((m) => m.id === msg.id)) return safePrev;
          return [...safePrev, msg];
        });
        if (msg.senderId !== user.id) {
          markConversationSeen(cur.id).catch(() => {});
        }
      }
      loadChatData();
    };

    const onDeleted = ({ messageId }) => {
      setMessages((prev) =>
        (Array.isArray(prev) ? prev : []).map((m) =>
          m.id === messageId
            ? { ...m, isDeleted: true, text: "This message was deleted." }
            : m
        )
      );
    };

    const onEdited = (msg) => {
      setMessages((prev) => (Array.isArray(prev) ? prev : []).map((m) => (m.id === msg.id ? msg : m)));
    };

    const onReactionAdded = ({ messageId, reaction }) => {
      setMessages((prev) =>
        (Array.isArray(prev) ? prev : []).map((m) => {
          if (m.id !== messageId) return m;
          const nextReactions = [...(m.reactions || [])];
          if (!nextReactions.some((r) => r.id === reaction.id)) {
            nextReactions.push(reaction);
          }
          return { ...m, reactions: nextReactions };
        })
      );
    };

    const onReactionRemoved = ({ messageId, emoji, userId }) => {
      setMessages((prev) =>
        (Array.isArray(prev) ? prev : []).map((m) => {
          if (m.id !== messageId) return m;
          return {
            ...m,
            reactions: (m.reactions || []).filter(
              (r) => !(r.userId === userId && r.emoji === emoji)
            ),
          };
        })
      );
    };

    const onTyping = ({ conversationId }) => {
      if (selectedConvRef.current?.id === conversationId) setIsPartnerTyping(true);
    };

    const onStopTyping = ({ conversationId }) => {
      if (selectedConvRef.current?.id === conversationId) setIsPartnerTyping(false);
    };

    const onSeen = ({ conversationId, userId, seenAt }) => {
      if (selectedConvRef.current?.id === conversationId && userId !== user.id) {
        setPartnerReadAt(seenAt);
      }
    };

    socket.on("receive_message", onMessage);
    socket.on("message_deleted", onDeleted);
    socket.on("message_edited", onEdited);
    socket.on("reaction_added", onReactionAdded);
    socket.on("reaction_removed", onReactionRemoved);
    socket.on("typing", onTyping);
    socket.on("stop_typing", onStopTyping);
    socket.on("seen", onSeen);

    return () => {
      socket.off("receive_message", onMessage);
      socket.off("message_deleted", onDeleted);
      socket.off("message_edited", onEdited);
      socket.off("reaction_added", onReactionAdded);
      socket.off("reaction_removed", onReactionRemoved);
      socket.off("typing", onTyping);
      socket.off("stop_typing", onStopTyping);
      socket.off("seen", onSeen);
    };
  }, [socket, user?.id]);

  useEffect(() => {
    scrollToBottom("smooth");
  }, [messages, isPartnerTyping]);

  const scrollToBottom = (behavior = "smooth") => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  const selectConv = async (conv) => {
    if (selectedConv?.id === conv.id) return;
    setSelectedConv(conv);
    setMessages([]);
    setIsPartnerTyping(false);
    setPartnerReadAt(null);
    try {
      setLoadingMsgs(true);
      const data = await getMessages(conv.id);
      setMessages(Array.isArray(data) ? data : []);
      const partner = conv.participants?.find((p) => p.userId !== user?.id);
      setPartnerReadAt(partner?.lastReadAt || null);
      await markConversationSeen(conv.id);
      loadChatData();
    } catch (err) {
      console.error("[Chat] loadMessages:", err);
    } finally {
      setLoadingMsgs(false);
      setTimeout(() => scrollToBottom("auto"), 80);
    }
  };

  const startChat = async (teammate) => {
    try {
      const conv = await createConversation(teammate.id);
      loadChatData();
      selectConv(conv);
    } catch (err) {
      console.error("[Chat] startChat:", err);
    }
  };

  const handleSend = async () => {
    const trimmed = text.trim();
    if (!trimmed && !sending) return;

    setText("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
    setSending(true);
    if (socket && selectedConv) socket.emit("stop_typing", selectedConv.id);

    try {
      const lang = isCodeSnippetsMode && codeLanguage ? codeLanguage : null;
      await apiSendMessage(selectedConv.id, trimmed, null, null, lang);
      loadChatData();
    } catch (err) {
      console.error("[Chat] send failed:", err);
    } finally {
      setSending(false);
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !selectedConv) return;

    const fileType = file.type.startsWith("image/") ? "IMAGE" : "FILE";
    const reader = new FileReader();
    reader.onload = async () => {
      setSending(true);
      try {
        await apiSendMessage(selectedConv.id, file.name, reader.result, fileType);
        loadChatData();
      } catch (err) {
        console.error("[Chat] send attachment failed:", err);
      } finally {
        setSending(false);
      }
    };
    reader.readAsDataURL(file);
  };

  // Edit Message handler
  const handleEditMessage = async (msgId, originalText) => {
    setEditingMsg(msgId);
    setEditText(originalText);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editText.trim() || !editingMsg) return;
    try {
      await editMessage(selectedConv.id, editingMsg, editText);
      setEditingMsg(null);
      setEditText("");
      triggerToast("Message updated.");
      // Reload message list
      const data = await getMessages(selectedConv.id);
      setMessages(Array.isArray(data) ? data : []);
    } catch (e) {
      triggerToast("Failed to edit message.");
    }
  };

  // Delete message handler
  const handleDeleteMsg = async (msgId) => {
    if (!window.confirm("Delete this message for everyone?")) return;
    try {
      await deleteMessage(selectedConv.id, msgId);
      triggerToast("Message deleted.");
      setMessages((prev) =>
        (Array.isArray(prev) ? prev : []).map((m) =>
          m.id === msgId
            ? { ...m, isDeleted: true, text: "This message was deleted." }
            : m
        )
      );
    } catch (e) {
      triggerToast("Failed to delete message.");
    }
  };

  // Reactions handlers
  const handleToggleReaction = async (msgId, reactionsList, emoji) => {
    const existing = (reactionsList || []).find(r => r.userId === user?.id && r.emoji === emoji);
    try {
      if (existing) {
        await removeReaction(selectedConv.id, msgId, emoji);
        setMessages((prev) =>
          (Array.isArray(prev) ? prev : []).map((m) => {
            if (m.id !== msgId) return m;
            return {
              ...m,
              reactions: (m.reactions || []).filter(
                (r) => !(r.userId === user?.id && r.emoji === emoji)
              ),
            };
          })
        );
      } else {
        const newReaction = await addReaction(selectedConv.id, msgId, emoji);
        setMessages((prev) =>
          (Array.isArray(prev) ? prev : []).map((m) => {
            if (m.id !== msgId) return m;
            const nextReactions = [...(m.reactions || [])];
            if (!nextReactions.some((r) => r.id === newReaction.id)) {
              nextReactions.push(newReaction);
            }
            return { ...m, reactions: nextReactions };
          })
        );
      }
    } catch (e) {
      triggerToast("Failed to update reaction.");
    }
  };

  const handleTextChange = (e) => {
    setText(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = Math.min(e.target.scrollHeight, 140) + "px";
    if (socket && selectedConv) {
      socket.emit("typing", selectedConv.id);
      clearTimeout(typingTimerRef.current);
      typingTimerRef.current = setTimeout(() => {
        if (socket && selectedConv) socket.emit("stop_typing", selectedConv.id);
      }, 1500);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSelectEmoji = (emoji) => {
    setText((prev) => prev + emoji);
    setEmojiOpen(false);
    textareaRef.current?.focus();
  };

  // Filtered Conversations List
  const filteredAndSortedConvs = useMemo(() => {
    const safeConvs = Array.isArray(conversations) ? conversations : [];
    let list = safeConvs.filter((c) => {
      const isGroupChat = !!c.teamId;
      const partner = isGroupChat ? null : c.participants?.find((p) => p.userId !== user?.id)?.user;
      
      const matchesSearch = isGroupChat 
        ? (c.name || "").toLowerCase().includes(search.toLowerCase())
        : (partner?.name || "").toLowerCase().includes(search.toLowerCase());

      if (!matchesSearch) return false;

      // Filter matches
      if (activeFilter === "UNREAD") return c.unreadCount > 0;
      if (activeFilter === "PRIVATE") return !isGroupChat;
      if (activeFilter === "TEAMS") return isGroupChat;

      return true;
    });

    return list;
  }, [conversations, search, activeFilter, user]);

  const sortedTeammates = useMemo(() => {
    const safeTeammates = Array.isArray(teammates) ? teammates : [];
    return [...safeTeammates].sort((a, b) => {
      const aOnline = isUserOnline(a.id) ? 1 : 0;
      const bOnline = isUserOnline(b.id) ? 1 : 0;
      return bOnline - aOnline;
    });
  }, [teammates, isUserOnline]);

  const isGroup = selectedConv && !!selectedConv.teamId;
  const partnerUser = isGroup
    ? null
    : selectedConv?.participants?.find((p) => p.userId !== user?.id)?.user;
  const chatTitle = isGroup ? (selectedConv.name || "Team Workspace Chat") : (partnerUser?.name || "Developer");

  const filteredMessages = useMemo(() => {
    const safeMsgs = Array.isArray(messages) ? messages : [];
    return msgQuery.trim()
      ? safeMsgs.filter((m) => (m.text || "").toLowerCase().includes(msgQuery.toLowerCase()))
      : safeMsgs;
  }, [messages, msgQuery]);

  return (
    <div className="tg-chat">
      <AnimatePresence>
        {toastMessage && (
          <motion.div className="tg-toast" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
            <span>💬 {toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* COLUMN 1: TEAMMATES PANEL */}
      <aside className="tg-teammates-sidebar">
        <div className="teammates-sidebar-header" title="Teammates Shortcuts">
          👥
        </div>
        <div className="teammates-avatars-list">
          {sortedTeammates.map(tm => {
            const online = isUserOnline(tm.id);
            return (
              <div 
                key={tm.id} 
                className={`teammate-avatar-wrapper ${online ? "online" : ""}`}
                onClick={() => startChat(tm)}
                title={`${tm.name} (${online ? "Online" : "Offline"})`}
              >
                <Avatar name={tm.name} online={online} size="md" />
              </div>
            );
          })}
          {sortedTeammates.length === 0 && (
            <div className="no-teammates-hint" title="No teammates available">
              📭
            </div>
          )}
        </div>
      </aside>

      {/* COLUMN 2: CONVERSATIONS SIDEBAR */}
      <aside className="tg-sidebar">
        <div className="tg-sidebar__top">
          <div className="tg-sidebar__title-row">
            <h1 className="tg-sidebar__title">Chats</h1>
            <span className={`tg-conn-badge ${connected ? "tg-conn-badge--on" : "tg-conn-badge--off"}`}>
              {connected ? "Connected" : "Offline"}
            </span>
          </div>

          <div className="tg-search">
            <input
              placeholder="Search chats..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Filters category row */}
          <div className="sidebar-filters-row">
            {["ALL", "UNREAD", "PRIVATE", "TEAMS"].map(f => (
              <button 
                key={f} 
                className={`filter-badge ${activeFilter === f ? "active" : ""}`}
                onClick={() => setActiveFilter(f)}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="tg-sidebar__list">
          {loadingConvs ? (
            [1, 2, 3].map((i) => (
              <div key={i} className="tg-skeleton" style={{ margin: "12px", height: 60, borderRadius: 8 }} />
            ))
          ) : (
            <>
              {filteredAndSortedConvs.map((conv) => {
                const isConvGroup = !!conv.teamId;
                const partner = isConvGroup ? null : conv.participants?.find(p => p.userId !== user?.id)?.user;
                return (
                  <div key={conv.id} style={{ position: "relative" }}>
                    <button 
                      className={`tg-contact ${selectedConv?.id === conv.id ? "tg-contact--active" : ""}`}
                      onClick={() => selectConv(conv)}
                    >
                      <Avatar 
                        name={isConvGroup ? (conv.name || "Team") : (partner?.name || "User")} 
                        online={isConvGroup ? false : isUserOnline(conv.participants?.find(p => p.userId !== user?.id)?.userId)} 
                        isGroup={isConvGroup} 
                      />
                      <div className="tg-contact__body">
                        <div className="tg-contact__row1">
                          <span className="tg-contact__name">
                            {isConvGroup ? (conv.name || "Team Chat") : (partner?.name || "User")}
                          </span>
                          <span className="tg-contact__time">
                            {conv.messages?.[0] ? fmtSidebarTime(conv.messages[0].createdAt) : ""}
                          </span>
                        </div>
                        <div className="tg-contact__row2">
                          <span className="tg-contact__preview">
                            {conv.messages?.[0]?.isDeleted ? "🚫 Deleted" : conv.messages?.[0]?.text || "No messages"}
                          </span>
                          {conv.unreadCount > 0 && <span className="tg-badge">{conv.unreadCount}</span>}
                        </div>
                      </div>
                    </button>
                  </div>
                );
              })}

              {filteredAndSortedConvs.length === 0 && (
                <div className="tg-sidebar__empty">
                  <span>💬 No conversations</span>
                </div>
              )}
            </>
          )}
        </div>
      </aside>

      {/* COLUMN 3: MAIN CHAT AREA */}
      <main className={`tg-main ${!selectedConv ? "tg-main--empty" : ""}`}>
        {!selectedConv ? (
          <div className="empty-chat-container">
            <span style={{ fontSize: "56px" }}>💬</span>
            <h3>Workspace Messenger</h3>
            <p>Select a direct message conversation or team workspace channel to start collaboration.</p>
          </div>
        ) : (
          <>
            {/* Chat Header */}
            <div className="tg-header">
              <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                <Avatar 
                  name={chatTitle} 
                  online={isGroup ? false : isUserOnline(partnerUser?.id)} 
                  isGroup={isGroup} 
                />
                <div>
                  <div className="tg-header__name">
                    {chatTitle}
                    {isGroup && <span className="team-badge-header">TEAM</span>}
                  </div>
                  <div className="tg-header__status">
                    {isPartnerTyping ? (
                      <span className="tg-header__status--typing">typing...</span>
                    ) : isGroup ? (
                      "Team Collaboration Channel"
                    ) : isUserOnline(partnerUser?.id) ? (
                      <span className="tg-header__status--online">Online</span>
                    ) : (
                      "Offline"
                    )}
                  </div>
                </div>
              </div>

              {/* Message Search Input */}
              <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                <input 
                  type="text" 
                  value={msgQuery} 
                  onChange={(e) => setMsgQuery(e.target.value)} 
                  placeholder="Search messages..." 
                  className="message-search-input"
                />
              </div>
            </div>

            {/* Messages container list */}
            <div className="tg-messages" ref={messagesContainerRef}>
              {loadingMsgs ? (
                [1, 2, 3].map(i => (
                  <div key={i} className="tg-skeleton" style={{ width: "40%", height: "45px", margin: "10px 0", borderRadius: "12px" }} />
                ))
              ) : filteredMessages.length === 0 ? (
                <div className="tg-messages__empty">
                  <span>No messages.</span>
                </div>
              ) : (
                filteredMessages.map((msg, idx) => {
                  const isOwn = msg.senderId === user?.id;
                  const prevMsg = filteredMessages[idx - 1];
                  const showDateDivider = !prevMsg || !sameDay(prevMsg.createdAt, msg.createdAt);
                  const partnerRead = partnerReadAt && new Date(partnerReadAt) >= new Date(msg.createdAt);

                  // Defensive guard against empty/null/whitespace message box rendering
                  const textContent = msg.text || "";
                  const hasContent = textContent.trim().length > 0 || msg.fileUrl || msg.isDeleted;
                  if (!hasContent) return null;

                  return (
                    <div key={msg.id}>
                      {showDateDivider && (
                        <div className="tg-date-divider">
                          <span>{fmtDateDivider(msg.createdAt)}</span>
                        </div>
                      )}

                      <div className={`tg-msg ${isOwn ? "tg-msg--own" : "tg-msg--other"}`}>
                        <div className="tg-msg-content-wrapper">
                          {!isOwn && (
                            <div className="tg-msg-avatar-col" style={{ flexShrink: 0 }}>
                              <Avatar name={msg.sender?.name || "User"} size="sm" />
                            </div>
                          )}

                          <div className="tg-msg-body-col">
                            {!isOwn && <span className="tg-msg__name">{msg.sender?.name}</span>}

                            <div className="tg-msg-bubble-container">
                              <div className={`tg-msg__bubble ${msg.isDeleted ? "tg-msg__bubble--deleted" : ""}`}>
                                {msg.isDeleted ? (
                                  "This message was deleted."
                                ) : msg.codeLanguage ? (
                                  /* Code snippet display */
                                  <div className="code-snippet-bubble">
                                    <div className="code-header">
                                      <span>{msg.codeLanguage} snippet</span>
                                      <button onClick={() => {
                                        navigator.clipboard.writeText(msg.text);
                                        triggerToast("Code copied!");
                                      }}>Copy Code</button>
                                    </div>
                                    <pre><code>{msg.text}</code></pre>
                                  </div>
                                ) : msg.fileUrl ? (
                                  msg.fileType === "IMAGE" ? (
                                    <img src={msg.fileUrl} alt="shared asset" className="chat-image-attachment" />
                                  ) : (
                                    <div className="chat-file-attachment">
                                      <span>📁 {msg.text}</span>
                                      <a href={msg.fileUrl} download>Download</a>
                                    </div>
                                  )
                                ) : (
                                  <span>{msg.text}</span>
                                )}
                              </div>

                              {/* Hover actions popover */}
                              {!msg.isDeleted && (
                                <div className="message-hover-actions">
                                  {isOwn && (
                                    <button onClick={() => handleEditMessage(msg.id, msg.text)} title="Edit Message">✏️</button>
                                  )}
                                  {isOwn && (
                                    <button onClick={() => handleDeleteMsg(msg.id)} title="Delete Message">🗑️</button>
                                  )}

                                  {/* Quick reaction emojis */}
                                  {["👍", "❤️", "😂", "🎉"].map(emoji => (
                                    <button 
                                      key={emoji} 
                                      onClick={() => handleToggleReaction(msg.id, msg.reactions, emoji)}
                                      className="reaction-emoji-btn"
                                    >
                                      {emoji}
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>

                            {/* Display reactions */}
                            {msg.reactions && msg.reactions.length > 0 && (
                              <div className="message-reactions-row">
                                {Array.from(new Set(msg.reactions.map(r => r.emoji))).map(emoji => {
                                  const count = msg.reactions.filter(r => r.emoji === emoji).length;
                                  const userReacted = msg.reactions.some(r => r.userId === user?.id && r.emoji === emoji);

                                  return (
                                    <span 
                                      key={emoji} 
                                      className={`reaction-badge ${userReacted ? "active" : ""}`}
                                      onClick={() => handleToggleReaction(msg.id, msg.reactions, emoji)}
                                    >
                                      {emoji} {count}
                                    </span>
                                  );
                                })}
                              </div>
                            )}

                            <div className="tg-msg__meta">
                              <span>{fmtTime(msg.createdAt)}</span>
                              {isOwn && (
                                <span className={partnerRead ? "tg-msg__seen" : ""}>
                                  {partnerRead ? "✓✓" : "✓"}
                                </span>
                              )}
                              {msg.isEdited && <span className="edited-indicator">(edited)</span>}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input bar */}
            <div className="tg-input-bar">
              <input type="file" ref={fileInputRef} onChange={handleFileChange} style={{ display: "none" }} />
              
              <button 
                type="button" 
                onClick={() => fileInputRef.current?.click()} 
                className="tg-send-btn" 
                style={{ background: "transparent" }}
                title="Attach file"
              >
                📎
              </button>

              <button 
                type="button" 
                className={`tg-send-btn ${isCodeSnippetsMode ? "active" : ""}`}
                style={{ background: "transparent" }}
                onClick={() => setIsCodeSnippetsMode(!isCodeSnippetsMode)}
                title="Toggle Code Snippet Mode"
              >
                💻
              </button>

              <div className="tg-input-bar__area">
                {isCodeSnippetsMode && (
                  <select 
                    value={codeLanguage} 
                    onChange={(e) => setCodeLanguage(e.target.value)}
                    className="code-language-selector"
                  >
                    <option value="">Choose code language...</option>
                    <option value="javascript">JavaScript</option>
                    <option value="python">Python</option>
                    <option value="java">Java</option>
                    <option value="c">C / C++</option>
                    <option value="json">JSON</option>
                    <option value="markdown">Markdown</option>
                  </select>
                )}

                <textarea
                  ref={textareaRef}
                  placeholder={isCodeSnippetsMode ? "Paste your code snippet here..." : "Write a message... (Enter to send)"}
                  value={text}
                  onChange={handleTextChange}
                  onKeyDown={handleKeyDown}
                  className="tg-input-bar__textarea"
                  disabled={sending}
                  rows={1}
                />
              </div>

              {/* Emoji selector */}
              <div style={{ position: "relative" }}>
                <button 
                  className="tg-send-btn" 
                  style={{ background: "transparent" }}
                  onClick={() => setEmojiOpen(!emojiOpen)}
                  title="Emoji popover"
                >
                  😊
                </button>
                {emojiOpen && (
                  <div className="emoji-picker-popover">
                    {["👍", "❤️", "😂", "🎉", "💻", "🔥", "👀", "🚀", "🐛", "💡"].map(emoji => (
                      <button key={emoji} onClick={() => handleSelectEmoji(emoji)}>{emoji}</button>
                    ))}
                  </div>
                )}
              </div>

              <button 
                className="tg-send-btn" 
                onClick={handleSend} 
                disabled={(!text.trim() && !sending) || sending}
              >
                {sending ? "⏳" : "🚀"}
              </button>
            </div>
          </>
        )}
      </main>

      {/* Edit message modal */}
      <AnimatePresence>
        {editingMsg && (
          <div className="create-modal-overlay">
            <motion.div className="create-modal-content" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}>
              <h3>Edit Message</h3>
              <form onSubmit={handleEditSubmit} className="modal-form">
                <textarea rows="3" value={editText} onChange={(e) => setEditText(e.target.value)} required />
                <div className="modal-actions">
                  <button type="submit" className="btn-primary" disabled={sending}>Save Changes</button>
                  <button type="button" className="btn-secondary" onClick={() => setEditingMsg(null)}>Cancel</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
