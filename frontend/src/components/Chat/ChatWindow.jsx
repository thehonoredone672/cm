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

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isPartnerTyping]);

  if (!conversation) {
    return (
      <div className="chat-window chat-window--empty">
        <p>Select a conversation to start chatting.</p>
      </div>
    );
  }

  const partner = conversation.participants.find(
    (participant) => participant.userId !== currentUserId
  )?.user;

  function handleChange(e) {
    setDraft(e.target.value);

    onTyping();

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
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

          <span className="chat-window__status">
            {isPartnerTyping
              ? "typing..."
              : isOnline
              ? "Online"
              : "Offline"}
          </span>
        </div>
      </div>

      <div className="chat-window__messages">

        {messages.length === 0 && (
          <p className="chat-window__empty">
            No messages yet. Say hello!
          </p>
        )}

        {messages.map((message) => {
          const isOwn = message.senderId === currentUserId;

          return (
            <div
              key={message.id}
              className={`message-bubble ${
                isOwn
                  ? "message-bubble--own"
                  : "message-bubble--other"
              }`}
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

      <form
        className="chat-window__input"
        onSubmit={handleSubmit}
      >
        <input
          type="text"
          placeholder="Type a message..."
          value={draft}
          onChange={handleChange}
        />

        <button type="submit" disabled={!draft.trim()}>
          Send
        </button>
      </form>
    </div>
  );
}
