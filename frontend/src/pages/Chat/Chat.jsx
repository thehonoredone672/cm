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
  pinConversation,
  editMessage,
  deleteMessage,
  pinMessage,
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
  const [activeFilter, setActiveFilter] = useState("ALL"); // ALL, UNREAD, PINNED, PRIVATE, TEAMS
  
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
  const [showPinnedOnly, setShowPinnedOnly] = useState(false);

  // Message edits & replies
  const [editingMsg, setEditingMsg] = useState(null);
  const [editText, setEditText] = useState("");

  const [isPartnerTyping, setIsPartnerTyping] = useState(false);
  const [partnerReadAt, setPartnerReadAt] = useState(null);
  const [showScrollBtn, setShowScrollBtn] = useState(false);

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
      setConversations(convs);
      setTeammates(tms);
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
    return () => socket.emit("leave_conversation", selectedConv.id);
  }, [socket, connected, selectedConv?.id]);

  useEffect(() => {
    if (!socket) return;

    const onMessage = (msg) => {
      const cur = selectedConvRef.current;
      if (cur?.id === msg.conversationId) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === msg.id)) return prev;
          return [...prev, msg];
        });
        if (msg.senderId !== user.id) {
          markConversationSeen(cur.id).catch(() => {});
        }
      }
      loadChatData();
    };

    const onDeleted = ({ messageId }) => {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === messageId
            ? { ...m, isDeleted: true, text: "This message was deleted." }
            : m
        )
      );
    };

    const onEdited = (msg) => {
      setMessages((prev) => prev.map((m) => (m.id === msg.id ? msg : m)));
    };

    const onPinned = (msg) => {
      setMessages((prev) => prev.map((m) => (m.id === msg.id ? msg : m)));
    };

    const onReactionAdded = ({ messageId, reaction }) => {
      setMessages((prev) =>
        prev.map((m) => {
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
        prev.map((m) => {
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
    socket.on("message_pinned_toggled", onPinned);
    socket.on("reaction_added", onReactionAdded);
    socket.on("reaction_removed", onReactionRemoved);
    socket.on("typing", onTyping);
    socket.on("stop_typing", onStopTyping);
    socket.on("seen", onSeen);

    return () => {
      socket.off("receive_message", onMessage);
      socket.off("message_deleted", onDeleted);
      socket.off("message_edited", onEdited);
      socket.off("message_pinned_toggled", onPinned);
      socket.off("reaction_added", onReactionAdded);
      socket.off("reaction_removed", onReactionRemoved);
      socket.off("typing", onTyping);
      socket.off("stop_typing", onStopTyping);
      socket.off("seen", onSeen);
    };
  }, [socket, user.id]);

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
    setShowPinnedOnly(false);
    try {
      setLoadingMsgs(true);
      const data = await getMessages(conv.id);
      setMessages(data);
      const partner = conv.participants?.find((p) => p.userId !== user.id);
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
    const file = e.target.files[0];
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

  // Pinned Conversation handler
  const handlePinConversation = async (convId, isPinned) => {
    try {
      await pinConversation(convId, isPinned);
      triggerToast(isPinned ? "Conversation pinned to top." : "Conversation unpinned.");
      loadChatData();
    } catch (e) {
      triggerToast("Failed to pin conversation.");
    }
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
      fetchTeamDetails();
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
    } catch (e) {
      triggerToast("Failed to delete message.");
    }
  };

  // Pin Message handler
  const handlePinMsg = async (msgId, currentPin) => {
    try {
      await pinMessage(selectedConv.id, msgId, !currentPin);
      triggerToast(!currentPin ? "Message pinned." : "Message unpinned.");
    } catch (e) {
      triggerToast("Failed to pin message.");
    }
  };

  // Reactions handlers
  const handleToggleReaction = async (msgId, reactionsList, emoji) => {
    const existing = reactionsList?.find(r => r.userId === user.id && r.emoji === emoji);
    try {
      if (existing) {
        await removeReaction(selectedConv.id, msgId, emoji);
      } else {
        await addReaction(selectedConv.id, msgId, emoji);
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
        socket.emit("stop_typing", selectedConv.id);
      }, 1500);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Filtered & Pinned Sorting Conversations List
  const filteredAndSortedConvs = useMemo(() => {
    let list = conversations.filter((c) => {
      const isGroupChat = !!c.teamId;
      const partner = isGroupChat ? null : c.participants?.find((p) => p.userId !== user.id)?.user;
      
      const matchesSearch = isGroupChat 
        ? (c.name || "").toLowerCase().includes(search.toLowerCase())
        : partner?.name.toLowerCase().includes(search.toLowerCase());

      if (!matchesSearch) return false;

      // Filter matches
      if (activeFilter === "UNREAD") return c.unreadCount > 0;
      if (activeFilter === "PINNED") return c.isPinned;
      if (activeFilter === "PRIVATE") return !isGroupChat;
      if (activeFilter === "TEAMS") return isGroupChat;

      return true;
    });

    // Sort pinned conversations first
    list.sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0));
    return list;
  }, [conversations, search, activeFilter, user]);

  const onlineTeammates = useMemo(() => {
    return teammates.filter(t => isUserOnline(t.id));
  }, [teammates, isUserOnline]);

  const isGroup = selectedConv && !!selectedConv.teamId;
  const partnerUser = isGroup
    ? null
    : selectedConv?.participants?.find((p) => p.userId !== user.id)?.user;
  const chatTitle = isGroup ? (selectedConv.name || "Team Workspace Chat") : (partnerUser?.name || "Developer");

  // Display either all messages or pinned messages only
  const filteredMessages = useMemo(() => {
    let list = msgQuery.trim()
      ? messages.filter((m) => m.text?.toLowerCase().includes(msgQuery.toLowerCase()))
      : messages;
    if (showPinnedOnly) {
      list = list.filter(m => m.isPinned);
    }
    return list;
  }, [messages, msgQuery, showPinnedOnly]);

  return (
    <div className="tg-chat">
      <AnimatePresence>
        {toastMessage && (
          <motion.div className="tg-toast" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
            <span>💬 {toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* LEFT SIDEBAR */}
      <aside className="tg-sidebar">
        <div className="tg-sidebar__top">
          <div className="tg-sidebar__title-row">
            <h1 className="tg-sidebar__title">Chat Workspaces</h1>
            <span className={`tg-conn-badge ${connected ? "tg-conn-badge--on" : "tg-conn-badge--off"}`}>
              {connected ? "● Connected" : "● Offline"}
            </span>
          </div>

          <div className="tg-search">
            <input
              placeholder="Search conversations..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Online Teammates row list */}
          {onlineTeammates.length > 0 && (
            <div className="online-users-row">
              {onlineTeammates.map(tm => (
                <div key={tm.id} className="online-avatar-card" onClick={() => startChat(tm)} title={`Open chat with ${tm.name}`}>
                  <Avatar name={tm.name} online={true} size="sm" />
                </div>
              ))}
            </div>
          )}

          {/* Filters category row */}
          <div className="sidebar-filters-row">
            {["ALL", "UNREAD", "PINNED", "PRIVATE", "TEAMS"].map(f => (
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
              {filteredAndSortedConvs.map((conv) => (
                <div key={conv.id} style={{ position: "relative" }}>
                  <button 
                    className={`tg-contact ${selectedConv?.id === conv.id ? "tg-contact--active" : ""}`}
                    onClick={() => selectConv(conv)}
                  >
                    <Avatar 
                      name={isGroup ? (conv.name || "Team") : (conv.participants?.find(p => p.userId !== user.id)?.user?.name || "User")} 
                      online={isGroup ? false : isUserOnline(conv.participants?.find(p => p.userId !== user.id)?.userId)} 
                      isGroup={isGroup} 
                    />
                    <div className="tg-contact__body">
                      <div className="tg-contact__row1">
                        <span className="tg-contact__name">
                          {conv.isPinned ? "📌 " : ""}{isGroup ? (conv.name || "Team Chat") : (conv.participants?.find(p => p.userId !== user.id)?.user?.name || "User")}
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

                  {/* Pin conversation toggle trigger */}
                  <button 
                    className="btn-pin-conversation"
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePinConversation(conv.id, !conv.isPinned);
                    }}
                    title={conv.isPinned ? "Unpin Chat" : "Pin Chat"}
                  >
                    {conv.isPinned ? "📌" : "📍"}
                  </button>
                </div>
              ))}

              {filteredAndSortedConvs.length === 0 && (
                <div className="tg-sidebar__empty">
                  <span>💬 No conversations found</span>
                </div>
              )}
            </>
          )}
        </div>
      </aside>

      {/* MAIN CHAT AREA */}
      <main className={`tg-main ${!selectedConv ? "tg-main--empty" : ""}`}>
        {!selectedConv ? (
          <div className="empty-chat-container">
            <span style={{ fontSize: "48px" }}>💬</span>
            <h3>Select a conversation</h3>
            <p>Select an active DM conversation or team workspace from the left to start sending messages.</p>
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
                  <div className="tg-header__name">{chatTitle}</div>
                  <div className="tg-header__status">
                    {isPartnerTyping ? (
                      <span className="tg-header__status--typing">typing...</span>
                    ) : isGroup ? (
                      "Team Channel Workspace"
                    ) : isUserOnline(partnerUser?.id) ? (
                      <span className="tg-header__status--online">Online</span>
                    ) : (
                      "Offline"
                    )}
                  </div>
                </div>
              </div>

              {/* Message Search & Pin Toggles */}
              <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                <input 
                  type="text" 
                  value={msgQuery} 
                  onChange={(e) => setMsgQuery(e.target.value)} 
                  placeholder="Search messages..." 
                  className="message-search-input"
                />

                <button 
                  className={`btn-pinned-toggle ${showPinnedOnly ? "active" : ""}`}
                  onClick={() => setShowPinnedOnly(!showPinnedOnly)}
                  title="Show Pinned Messages Only"
                >
                  📌 Pinned
                </button>
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
                  <span>No messages found in this search filter.</span>
                </div>
              ) : (
                filteredMessages.map((msg, idx) => {
                  const isOwn = msg.senderId === user.id;
                  const prevMsg = filteredMessages[idx - 1];
                  const showDateDivider = !prevMsg || !sameDay(prevMsg.createdAt, msg.createdAt);
                  const partnerRead = partnerReadAt && new Date(partnerReadAt) >= new Date(msg.createdAt);

                  return (
                    <div key={msg.id}>
                      {showDateDivider && (
                        <div className="tg-date-divider">
                          <span>{fmtDateDivider(msg.createdAt)}</span>
                        </div>
                      )}

                      <div className={`tg-msg ${isOwn ? "tg-msg--own" : "tg-msg--other"}`}>
                        {!isOwn && <span className="tg-msg__name">{msg.sender?.name}</span>}
                        
                        <div className="tg-msg-bubble-container">
                          
                          {/* Pin indicator */}
                          {msg.isPinned && <span className="pinned-msg-indicator" title="Pinned Message">📌</span>}

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
                                    triggerToast("Code copied to clipboard!");
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

                          {/* Hover popover actions overlay */}
                          {!msg.isDeleted && (
                            <div className="message-hover-actions">
                              {isOwn && (
                                <button onClick={() => handleEditMessage(msg.id, msg.text)} title="Edit Message">✏️</button>
                              )}
                              <button onClick={() => handlePinMsg(msg.id, msg.isPinned)} title={msg.isPinned ? "Unpin" : "Pin"}>📌</button>
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

                        {/* Display existing reactions */}
                        {msg.reactions && msg.reactions.length > 0 && (
                          <div className="message-reactions-row">
                            {Array.from(new Set(msg.reactions.map(r => r.emoji))).map(emoji => {
                              const count = msg.reactions.filter(r => r.emoji === emoji).length;
                              const userReacted = msg.reactions.some(r => r.userId === user.id && r.emoji === emoji);
                              
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
                  );
                })
              )}
            </div>

            {/* Input bar */}
            <div className="tg-input-bar">
              {/* Image / Asset attachment input */}
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

              <button className="tg-send-btn" onClick={handleSend} disabled={!text.trim() && !sending}>
                🚀
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
                  <button type="submit" className="btn-primary">Save Changes</button>
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
