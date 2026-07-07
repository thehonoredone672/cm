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

      <div className="conversation-list__header" style={{ display: "flex", flexDirection: "column", gap: "8px", paddingBottom: "12px" }}>
        <h2 style={{ margin: 0 }}>Chats</h2>
        <input
          type="text"
          placeholder="Search chats..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            width: "100%",
            padding: "8px 12px",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-sm)",
            background: "var(--background)",
            color: "var(--text-primary)",
            fontSize: "14px",
            outline: "none"
          }}
        />
      </div>

      <div className="conversation-list__items">

        {filteredConversations.length === 0 && (
          <p className="conversation-list__empty">
            {search ? "No matching chats found." : "No conversations yet. Start one below."}
          </p>
        )}

        {filteredConversations.map((conversation) => {
          const other = conversation.participants.find(
            (participant) => participant.userId !== currentUserId
          )?.user;

          const lastMessage = conversation.messages?.[0];

          const active =
            conversation.id === selectedConversationId;

          return (
            <button
              key={conversation.id}
              className={`conversation-item ${
                active ? "conversation-item--active" : ""
              }`}
              onClick={() => onSelectConversation(conversation)}
            >
              <div className="conversation-item__avatar">
                {other?.name?.charAt(0).toUpperCase() || "?"}

                {isUserOnline(other?.id) && (
                  <span className="online-dot" />
                )}
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
                    {lastMessage
                      ? lastMessage.text
                      : "Say hello 👋"}
                  </span>

                  {conversation.unreadCount > 0 && (
                    <span className="unread-badge">
                      {conversation.unreadCount}
                    </span>
                  )}
                </div>
              </div>
            </button>
          );
        })}

      </div>

      {availableTeammates.length > 0 && (
        <div className="conversation-list__teammates">
          <h3>Start a new chat</h3>

          {availableTeammates.map((teammate) => (
            <button
              key={teammate.id}
              className="teammate-item"
              onClick={() => onStartChat(teammate)}
            >
              <div className="conversation-item__avatar">
                {teammate.name.charAt(0).toUpperCase()}

                {isUserOnline(teammate.id) && (
                  <span className="online-dot" />
                )}
              </div>

              <span>{teammate.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
