import { useEffect, useRef, useState } from "react";

function formatTime(dateString) {
  const date = new Date(dateString);
  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function ChatWindow({
  conversation,
  currentUserId,
  messages,
  isOnline,
  isPartnerTyping,
  partnerLastReadAt,
  onSendMessage,
  onTyping,
  onStopTyping,
}) {
  const [draft, setDraft] = useState("");
  const bottomRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const isTypingRef = useRef(false);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isPartnerTyping]);

  if (!conversation) {
    return (
      <div className="chat-window chat-window--empty">
        <svg width="48" height="48" fill="none" stroke="var(--text-secondary)" strokeWidth="1.5" viewBox="0 0 24 24" style={{ opacity: 0.5, marginBottom: "16px" }}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.678 20.089L12 21.75l3.322-1.661c1.04-.52 1.738-1.54 1.848-2.697L17.5 14H6.5l.33 5.053c.11 1.158.808 2.177 1.848 2.697zM20.25 9.75c0 4.418-4.03 8-9 8s-9-3.582-9-8 4.03-8 9-8 9 3.582 9 8z" />
        </svg>
        <p>Select a collaborator to start messaging.</p>
      </div>
    );
  }

  const partner = conversation.participants.find(
    (participant) => participant.userId !== currentUserId
  )?.user;

  function handleChange(e) {
    setDraft(e.target.value);

    if (!isTypingRef.current) {
      isTypingRef.current = true;
      onTyping();
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      isTypingRef.current = false;
      onStopTyping();
    }, 1500);
  }

  function handleSubmit(e) {
    e.preventDefault();
    const text = draft.trim();
    if (!text) return;
    onSendMessage(text);
    setDraft("");
    onStopTyping();
  }

  const lastOwnMessage = [...messages]
    .reverse()
    .find((message) => message.senderId === currentUserId);

  const lastOwnMessageSeen =
    lastOwnMessage &&
    partnerLastReadAt &&
    new Date(lastOwnMessage.createdAt) <= new Date(partnerLastReadAt);

  return (
    <div className="chat-window">
      <div className="chat-window__header">
        <div className="conversation-item__avatar">
          {partner?.name?.charAt(0).toUpperCase() || "?"}
          {isOnline && <span className="online-dot" />}
        </div>

        <div>
          <h3>{partner?.name || "Unknown"}</h3>
          <span className="chat-window__status" style={{ color: isPartnerTyping ? "var(--primary)" : "var(--text-secondary)" }}>
            {isPartnerTyping ? "typing..." : isOnline ? "Online" : "Offline"}
          </span>
        </div>
      </div>

      <div className="chat-window__messages">
        {messages.length === 0 && (
          <p className="chat-window__empty">No messages yet. Send a greeting message!</p>
        )}

        {messages.map((message) => {
          const isOwn = message.senderId === currentUserId;
          return (
            <div
              key={message.id}
              className={`message-bubble ${isOwn ? "message-bubble--own" : "message-bubble--other"}`}
            >
              <p>{message.text}</p>
              <span className="message-bubble__time">
                {formatTime(message.createdAt)}
              </span>
            </div>
          );
        })}

        {lastOwnMessage && (
          <div className="message-seen-status">
            {lastOwnMessageSeen ? "Seen" : "Delivered"}
          </div>
        )}

        {isPartnerTyping && (
          <div className="typing-indicator">
            <span />
            <span />
            <span />
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      <form className="chat-window__input" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Type a message..."
          value={draft}
          onChange={handleChange}
        />
        <button type="submit" disabled={!draft.trim()} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <span>Send</span>
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </button>
      </form>
    </div>
  );
}
