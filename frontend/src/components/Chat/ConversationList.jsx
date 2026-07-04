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

  return (
    <div className="conversation-list">

      <div className="conversation-list__header">
        <h2>Chats</h2>
      </div>

      <div className="conversation-list__items">

        {conversations.length === 0 && (
          <p className="conversation-list__empty">
            No conversations yet. Start one below.
          </p>
        )}

        {conversations.map((conversation) => {
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
