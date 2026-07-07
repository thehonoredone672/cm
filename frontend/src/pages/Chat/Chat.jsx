import { useCallback, useEffect, useRef, useState } from "react";
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
} from "../../services/chatService";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const COLORS = ["#6366f1","#8b5cf6","#ec4899","#f59e0b","#10b981","#3b82f6","#ef4444","#14b8a6"];
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

// ─── Avatar Component ─────────────────────────────────────────────────────────

function Avatar({ name = "?", size = "md", online = false }) {
  return (
    <div
      className={`tg-avatar${size === "sm" ? " tg-avatar--sm" : ""}`}
      style={{ background: avatarColor(name) }}
    >
      {initials(name)}
      {online && <span className="tg-avatar__dot" />}
    </div>
  );
}

// ─── Sidebar Contact Row ──────────────────────────────────────────────────────

function ContactRow({ conv, currentUserId, selected, isOnline, onClick }) {
  const partner = conv.participants?.find((p) => p.userId !== currentUserId)?.user;
  if (!partner) return null;
  const lastMsg = conv.messages?.[0];
  const preview = lastMsg
    ? (lastMsg.isDeleted
        ? "🚫 Message deleted"
        : (lastMsg.senderId === currentUserId ? "You: " : "") + lastMsg.text)
    : "No messages yet";

  return (
    <button
      className={`tg-contact${selected ? " tg-contact--active" : ""}`}
      onClick={onClick}
    >
      <Avatar name={partner.name} online={isOnline(partner.id)} />
      <div className="tg-contact__body">
        <div className="tg-contact__row1">
          <span className="tg-contact__name">{partner.name}</span>
          <span className="tg-contact__time">
            {lastMsg ? fmtSidebarTime(lastMsg.createdAt) : ""}
          </span>
        </div>
        <div className="tg-contact__row2">
          <span className="tg-contact__preview">{preview}</span>
          {conv.unreadCount > 0 && (
            <span className="tg-badge">{conv.unreadCount > 99 ? "99+" : conv.unreadCount}</span>
          )}
        </div>
      </div>
    </button>
  );
}

// ─── Message Bubble ───────────────────────────────────────────────────────────

function MsgBubble({ msg, isOwn, showName, partnerReadAt }) {
  const wasRead =
    isOwn &&
    partnerReadAt &&
    new Date(partnerReadAt) >= new Date(msg.createdAt);

  return (
    <div className={`tg-msg tg-msg--${isOwn ? "own" : "other"}`}>
      {!isOwn && showName && (
        <div className="tg-msg__name">{msg.sender?.name}</div>
      )}
      <div
        className={`tg-msg__bubble${msg.isDeleted ? " tg-msg__bubble--deleted" : ""}`}
      >
        {msg.isDeleted ? "🚫 This message was deleted" : msg.text}
      </div>
      <div className="tg-msg__meta">
        <span>{fmtTime(msg.createdAt)}</span>
        {msg._optimistic && <span style={{ opacity: 0.5 }}>⌛</span>}
        {isOwn && !msg._optimistic && (
          <span className={wasRead ? "tg-msg__seen" : ""}>
            {wasRead ? "✓✓" : "✓"}
          </span>
        )}
      </div>
    </div>
  );
}

// ─── Main Chat Page ───────────────────────────────────────────────────────────

export default function Chat() {
  const { user } = useAuth();
  const { socket, connected, isUserOnline } = useSocket();

  const [conversations, setConversations] = useState([]);
  const [teammates, setTeammates] = useState([]);
  const [selectedConv, setSelectedConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [search, setSearch] = useState("");

  const [loadingConvs, setLoadingConvs] = useState(true);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [sending, setSending] = useState(false);

  const [text, setText] = useState("");
  const [isPartnerTyping, setIsPartnerTyping] = useState(false);
  const [partnerReadAt, setPartnerReadAt] = useState(null);
  const [showScrollBtn, setShowScrollBtn] = useState(false);

  const selectedConvRef = useRef(null);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const typingTimerRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => { selectedConvRef.current = selectedConv; }, [selectedConv]);

  // ── Load data ──────────────────────────────────────────────────

  useEffect(() => {
    (async () => {
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
    })();
  }, []);

  // ── Socket: join conversation room ─────────────────────────────

  useEffect(() => {
    if (!socket || !connected || !selectedConv) return;
    socket.emit("join_conversation", selectedConv.id);
    return () => socket.emit("leave_conversation", selectedConv.id);
  }, [socket, connected, selectedConv?.id]);

  // ── Socket: event listeners ────────────────────────────────────

  useEffect(() => {
    if (!socket) return;

    const onMessage = (msg) => {
      const cur = selectedConvRef.current;

      // If this conversation is open, update the messages list
      if (cur?.id === msg.conversationId) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === msg.id)) return prev;
          // Replace optimistic message if it matches
          const optIdx = prev.findIndex(
            (m) => m._optimistic && m.text === msg.text && m.senderId === msg.senderId
          );
          if (optIdx !== -1) {
            const next = [...prev];
            next[optIdx] = msg;
            return next;
          }
          return [...prev, msg];
        });
        // Auto-mark as read if this chat is open and message is from partner
        if (msg.senderId !== user.id) {
          markConversationSeen(cur.id).catch(() => {});
        }
      }

      // Always update the sidebar conversation list
      setConversations((prev) =>
        prev
          .map((c) =>
            c.id === msg.conversationId
              ? {
                  ...c,
                  messages: [msg],
                  unreadCount:
                    cur?.id === msg.conversationId || msg.senderId === user.id
                      ? 0
                      : (c.unreadCount || 0) + 1,
                }
              : c
          )
          .sort(
            (a, b) =>
              new Date(b.messages?.[0]?.createdAt || b.updatedAt) -
              new Date(a.messages?.[0]?.createdAt || a.updatedAt)
          )
      );
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

    const onTyping = ({ conversationId }) => {
      if (selectedConvRef.current?.id === conversationId) setIsPartnerTyping(true);
    };

    const onStopTyping = ({ conversationId }) => {
      if (selectedConvRef.current?.id === conversationId) setIsPartnerTyping(false);
    };

    const onSeen = ({ conversationId, userId, seenAt }) => {
      if (
        selectedConvRef.current?.id === conversationId &&
        userId !== user.id
      ) {
        setPartnerReadAt(seenAt);
      }
    };

    socket.on("receive_message", onMessage);
    socket.on("message_deleted", onDeleted);
    socket.on("typing", onTyping);
    socket.on("stop_typing", onStopTyping);
    socket.on("seen", onSeen);

    return () => {
      socket.off("receive_message", onMessage);
      socket.off("message_deleted", onDeleted);
      socket.off("typing", onTyping);
      socket.off("stop_typing", onStopTyping);
      socket.off("seen", onSeen);
    };
  }, [socket, user.id]);

  // ── Auto-scroll when new messages arrive ───────────────────────

  useEffect(() => {
    const el = messagesContainerRef.current;
    if (!el) return;
    const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 120;
    if (nearBottom) scrollToBottom("smooth");
  }, [messages, isPartnerTyping]);

  const scrollToBottom = (behavior = "smooth") => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  const onScroll = useCallback(() => {
    const el = messagesContainerRef.current;
    if (!el) return;
    setShowScrollBtn(el.scrollHeight - el.scrollTop - el.clientHeight > 300);
  }, []);

  // ── Select a conversation ──────────────────────────────────────

  const selectConv = async (conv) => {
    if (selectedConv?.id === conv.id) return;
    setSelectedConv(conv);
    setMessages([]);
    setIsPartnerTyping(false);
    setPartnerReadAt(null);
    try {
      setLoadingMsgs(true);
      const data = await getMessages(conv.id);
      setMessages(data);
      const partner = conv.participants?.find((p) => p.userId !== user.id);
      setPartnerReadAt(partner?.lastReadAt || null);
      await markConversationSeen(conv.id);
      setConversations((prev) =>
        prev.map((c) => (c.id === conv.id ? { ...c, unreadCount: 0 } : c))
      );
    } catch (err) {
      console.error("[Chat] loadMessages:", err);
    } finally {
      setLoadingMsgs(false);
      setTimeout(() => scrollToBottom("auto"), 80);
    }
  };

  // ── Start new chat with teammate ───────────────────────────────

  const startChat = async (teammate) => {
    try {
      const conv = await createConversation(teammate.id);
      setConversations((prev) =>
        prev.some((c) => c.id === conv.id) ? prev : [conv, ...prev]
      );
      selectConv(conv);
    } catch (err) {
      console.error("[Chat] startChat:", err);
    }
  };

  // ── Send message ───────────────────────────────────────────────

  const handleSend = async () => {
    const trimmed = text.trim();
    if (!trimmed || !selectedConv || sending) return;

    setText("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
    setSending(true);
    if (socket && selectedConv) socket.emit("stop_typing", selectedConv.id);

    const tempId = `_opt_${Date.now()}`;
    const optimistic = {
      id: tempId,
      _optimistic: true,
      conversationId: selectedConv.id,
      senderId: user.id,
      text: trimmed,
      createdAt: new Date().toISOString(),
      sender: { id: user.id, name: user.name },
      isDeleted: false,
    };
    setMessages((prev) => [...prev, optimistic]);

    try {
      const msg = await apiSendMessage(selectedConv.id, trimmed);
      setMessages((prev) => prev.map((m) => (m.id === tempId ? msg : m)));
      setConversations((prev) =>
        prev.map((c) =>
          c.id === selectedConv.id ? { ...c, messages: [msg] } : c
        )
      );
    } catch (err) {
      console.error("[Chat] send failed:", err);
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
    } finally {
      setSending(false);
    }
  };

  const handleTextChange = (e) => {
    setText(e.target.value);
    // Auto-grow textarea
    e.target.style.height = "auto";
    e.target.style.height = Math.min(e.target.scrollHeight, 140) + "px";
    // Typing indicator
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

  // ── Derived data ───────────────────────────────────────────────

  const filteredConvs = search.trim()
    ? conversations.filter((c) => {
        const partner = c.participants?.find((p) => p.userId !== user.id)?.user;
        return partner?.name.toLowerCase().includes(search.toLowerCase());
      })
    : conversations;

  const unconnectedTeammates = teammates.filter(
    (tm) =>
      !conversations.some((c) =>
        c.participants?.some((p) => p.userId === tm.id)
      )
  );

  const partner = selectedConv?.participants?.find(
    (p) => p.userId !== user.id
  )?.user;

  // ── Render ─────────────────────────────────────────────────────

  return (
    <div className="tg-chat">

      {/* ─── Left Sidebar ─────────────────────────────────── */}
      <aside className="tg-sidebar">
        <div className="tg-sidebar__top">
          <div className="tg-sidebar__title-row">
            <h1 className="tg-sidebar__title">Messages</h1>
            {connected ? (
              <span className="tg-conn-badge tg-conn-badge--on">● Live</span>
            ) : (
              <span className="tg-conn-badge tg-conn-badge--off">● Offline</span>
            )}
          </div>
          <div className="tg-search">
            <svg className="tg-search__icon" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
            <input
              placeholder="Search teammates…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="tg-sidebar__list">
          {loadingConvs ? (
            [1, 2, 3, 4].map((i) => (
              <div key={i} className="tg-skeleton" style={{ margin: "6px 12px", height: 62, borderRadius: 12 }} />
            ))
          ) : (
            <>
              {filteredConvs.length > 0 && (
                <>
                  <div className="tg-section-label">Conversations</div>
                  {filteredConvs.map((conv) => (
                    <ContactRow
                      key={conv.id}
                      conv={conv}
                      currentUserId={user.id}
                      selected={selectedConv?.id === conv.id}
                      isOnline={isUserOnline}
                      onClick={() => selectConv(conv)}
                    />
                  ))}
                </>
              )}

              {!search && unconnectedTeammates.length > 0 && (
                <>
                  <div className="tg-section-label">New Chat</div>
                  {unconnectedTeammates.map((tm) => (
                    <button
                      key={tm.id}
                      className="tg-contact"
                      onClick={() => startChat(tm)}
                    >
                      <Avatar name={tm.name} online={isUserOnline(tm.id)} />
                      <div className="tg-contact__body">
                        <div className="tg-contact__row1">
                          <span className="tg-contact__name">{tm.name}</span>
                        </div>
                        <div className="tg-contact__row2">
                          <span className="tg-contact__preview" style={{ color: "var(--primary)" }}>
                            Start conversation →
                          </span>
                        </div>
                      </div>
                    </button>
                  ))}
                </>
              )}

              {filteredConvs.length === 0 && unconnectedTeammates.length === 0 && (
                <div className="tg-sidebar__empty">
                  <div style={{ fontSize: 32, marginBottom: 8 }}>💬</div>
                  <div>No teammates yet.</div>
                  <div style={{ fontSize: 12, marginTop: 4 }}>Accept invites to start chatting.</div>
                </div>
              )}
            </>
          )}
        </div>
      </aside>

      {/* ─── Right: Message Area ───────────────────────────── */}
      <main className={`tg-main${!selectedConv ? " tg-main--empty" : ""}`}>
        {!selectedConv ? (
          <>
            <div className="tg-main--empty-icon">
              <svg width="48" height="48" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </div>
            <h3 style={{ margin: "0 0 8px", color: "var(--text-primary)" }}>
              Select a conversation
            </h3>
            <p style={{ margin: 0, fontSize: 14, color: "var(--text-secondary)" }}>
              Choose a teammate from the left to start messaging
            </p>
          </>
        ) : (
          <>
            {/* Header */}
            <div className="tg-header">
              <Avatar
                name={partner?.name || "?"}
                online={isUserOnline(partner?.id)}
              />
              <div className="tg-header__info">
                <div className="tg-header__name">{partner?.name || "Unknown"}</div>
                <div
                  className={`tg-header__status${
                    isPartnerTyping
                      ? " tg-header__status--typing"
                      : isUserOnline(partner?.id)
                      ? " tg-header__status--online"
                      : ""
                  }`}
                >
                  {isPartnerTyping
                    ? "typing…"
                    : isUserOnline(partner?.id)
                    ? "online"
                    : "last seen recently"}
                </div>
              </div>
              <div className="tg-header__actions">
                <span className={`tg-conn-badge${connected ? " tg-conn-badge--on" : " tg-conn-badge--off"}`}>
                  {connected ? "● Connected" : "● Reconnecting"}
                </span>
              </div>
            </div>

            {/* Messages */}
            <div
              className="tg-messages"
              ref={messagesContainerRef}
              onScroll={onScroll}
            >
              {loadingMsgs ? (
                [1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="tg-skeleton"
                    style={{
                      width: i % 2 === 0 ? "50%" : "38%",
                      height: 44,
                      borderRadius: 18,
                      alignSelf: i % 2 === 0 ? "flex-end" : "flex-start",
                      margin: "3px 0",
                    }}
                  />
                ))
              ) : messages.length === 0 ? (
                <div className="tg-messages__empty">
                  <div style={{ fontSize: 36 }}>👋</div>
                  <div>Say hello to {partner?.name}!</div>
                </div>
              ) : (
                <>
                  {messages.map((msg, idx) => {
                    const isOwn = msg.senderId === user.id;
                    const prev = messages[idx - 1];
                    const showDate = !prev || !sameDay(prev.createdAt, msg.createdAt);
                    const showName =
                      !isOwn &&
                      (!prev || prev.senderId !== msg.senderId || showDate);

                    return (
                      <div key={msg.id}>
                        {showDate && (
                          <div className="tg-date-divider">
                            <span>{fmtDateDivider(msg.createdAt)}</span>
                          </div>
                        )}
                        <MsgBubble
                          msg={msg}
                          isOwn={isOwn}
                          showName={showName}
                          partnerReadAt={partnerReadAt}
                        />
                      </div>
                    );
                  })}

                  {isPartnerTyping && (
                    <div className="tg-typing">
                      <div className="tg-typing__dot" />
                      <div className="tg-typing__dot" />
                      <div className="tg-typing__dot" />
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </>
              )}

              {showScrollBtn && (
                <button
                  className="tg-scroll-btn"
                  onClick={() => scrollToBottom("smooth")}
                  aria-label="Scroll to bottom"
                >
                  ↓
                </button>
              )}
            </div>

            {/* Input bar */}
            <div className="tg-input-bar">
              <div className="tg-input-bar__area">
                <textarea
                  ref={textareaRef}
                  className="tg-input-bar__textarea"
                  placeholder="Write a message… (Enter to send, Shift+Enter for new line)"
                  rows={1}
                  value={text}
                  onChange={handleTextChange}
                  onKeyDown={handleKeyDown}
                />
              </div>
              <button
                className="tg-send-btn"
                onClick={handleSend}
                disabled={!text.trim() || sending}
                aria-label="Send message"
              >
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z" />
                </svg>
              </button>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
