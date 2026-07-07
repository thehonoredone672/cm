import { useState } from "react";

function formatPreviewTime(dateString) {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function ConversationList({
  conversations,
  teammates,
  selectedConversationId,
  currentUserId,
  isUserOnline,
  onSelectConversation,
  onStartChat,
}) {
  const [search, setSearch] = useState("");

  const conversationPartnerIds = new Set(
    conversations.map((conversation) => {
      const other = conversation.participants.find(
        (participant) => participant.userId !== currentUserId
      );
      return other?.userId;
    })
  );

  const availableTeammates = teammates.filter(
    (teammate) => !conversationPartnerIds.has(teammate.id)
  );

  const filteredConversations = conversations.filter((conversation) => {
    const other = conversation.participants.find(
      (participant) => participant.userId !== currentUserId
    )?.user;
    return other?.name?.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="conversation-list">
      <div className="conversation-list__header">
        <h2 style={{ fontSize: "18px", fontWeight: 700, marginBottom: "12px" }}>Chats</h2>
        <div style={{ position: "relative" }}>
          <input
            type="text"
            placeholder="Search chats..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: "100%",
              padding: "10px 14px 10px 38px",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-sm)",
              background: "var(--background)",
              color: "var(--text-primary)",
              fontSize: "13px",
              outline: "none"
            }}
          />
          <svg 
            width="16" 
            height="16" 
            fill="none" 
            stroke="var(--text-secondary)" 
            strokeWidth="2" 
            viewBox="0 0 24 24"
            style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      <div className="conversation-list__items">
        {filteredConversations.length === 0 && (
          <p className="conversation-list__empty">
            {search ? "No matching chats found." : "No conversations yet."}
          </p>
        )}

        {filteredConversations.map((conversation) => {
          const other = conversation.participants.find(
            (participant) => participant.userId !== currentUserId
          )?.user;

          const lastMessage = conversation.messages?.[0];
          const active = conversation.id === selectedConversationId;

          return (
            <button
              key={conversation.id}
              className={`conversation-item ${active ? "conversation-item--active" : ""}`}
              onClick={() => onSelectConversation(conversation)}
            >
              <div className="conversation-item__avatar">
                {other?.name?.charAt(0).toUpperCase() || "?"}
                {isUserOnline(other?.id) && <span className="online-dot" />}
              </div>

              <div className="conversation-item__body">
                <div className="conversation-item__top">
                  <span className="conversation-item__name">
                    {other?.name || "Unknown"}
                  </span>
                  <span className="conversation-item__time">
                    {formatPreviewTime(lastMessage?.createdAt)}
                  </span>
                </div>

                <div className="conversation-item__bottom">
                  <span className="conversation-item__preview">
                    {lastMessage ? lastMessage.text : "Say hello 👋"}
                  </span>
                  {conversation.unreadCount > 0 && (
                    <span className="unread-badge">{conversation.unreadCount}</span>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {availableTeammates.length > 0 && (
        <div className="conversation-list__teammates">
          <h3>Collaborators</h3>
          {availableTeammates.map((teammate) => (
            <button
              key={teammate.id}
              className="teammate-item"
              onClick={() => onStartChat(teammate)}
            >
              <div className="conversation-item__avatar" style={{ width: "32px", height: "32px", minWidth: "32px", fontSize: "13px" }}>
                {teammate.name.charAt(0).toUpperCase()}
                {isUserOnline(teammate.id) && <span className="online-dot" />}
              </div>
              <span>{teammate.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
