import { useEffect, useRef, useState } from "react";
import "./Chat.css";

import { useAuth } from "../../context/AuthContext";
import { useSocket } from "../../context/SocketContext";

import ConversationList from "../../components/Chat/ConversationList";
import ChatWindow from "../../components/Chat/ChatWindow";

import {
  getConversations,
  createConversation,
  getMessages,
  sendMessage,
  markConversationSeen,
  getTeammates,
} from "../../services/chatService";

export default function Chat() {
  const { user } = useAuth();
  const { socket, connected, isUserOnline } = useSocket();

  const [conversations, setConversations] = useState([]);
  const [teammates, setTeammates] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  const [typingConversationId, setTypingConversationId] = useState(null);
  const [partnerLastReadAt, setPartnerLastReadAt] = useState(null);

  const selectedConversationRef = useRef(null);

  useEffect(() => {
    selectedConversationRef.current = selectedConversation;
  }, [selectedConversation]);

  useEffect(() => {
    loadInitialData();
  }, []);

  async function loadInitialData() {
    try {
      setLoading(true);

      const [conversationsData, teammatesData] = await Promise.all([
        getConversations(),
        getTeammates(),
      ]);

      setConversations(conversationsData);
      setTeammates(teammatesData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  // Join the selected conversation's room, and re-join automatically
  // after a socket reconnect.
  useEffect(() => {
    if (!socket || !connected || !selectedConversation) return;

    socket.emit("join_conversation", selectedConversation.id);

    return () => {
      socket.emit("leave_conversation", selectedConversation.id);
    };
  }, [socket, connected, selectedConversation]);

  // Global socket listeners (message, typing, seen).
  useEffect(() => {
    if (!socket) return;

    function handleReceiveMessage(message) {
      const current = selectedConversationRef.current;

      if (current && message.conversationId === current.id) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === message.id)) {
            return prev;
          }
          const optimisticIndex = prev.findIndex(
            (m) => m.isOptimistic && m.text === message.text && m.senderId === message.senderId
          );
          if (optimisticIndex !== -1) {
            const updated = [...prev];
            updated[optimisticIndex] = message;
            return updated;
          }
          return [...prev, message];
        });

        if (message.senderId !== user.id) {
          markConversationSeen(current.id).catch(() => {});
        }
      }

      setConversations((prev) =>
        prev
          .map((conversation) =>
            conversation.id === message.conversationId
              ? {
                  ...conversation,
                  messages: [message],
                  unreadCount:
                    current?.id === message.conversationId ||
                    message.senderId === user.id
                      ? conversation.unreadCount
                      : (conversation.unreadCount || 0) + 1,
                }
              : conversation
          )
          .sort(
            (a, b) =>
              new Date(b.messages?.[0]?.createdAt || b.updatedAt) -
              new Date(a.messages?.[0]?.createdAt || a.updatedAt)
          )
      );
    }

    function handleTyping({ conversationId }) {
      const current = selectedConversationRef.current;

      if (current && conversationId === current.id) {
        setTypingConversationId(conversationId);
      }
    }

    function handleStopTyping({ conversationId }) {
      const current = selectedConversationRef.current;

      if (current && conversationId === current.id) {
        setTypingConversationId((prev) =>
          prev === conversationId ? null : prev
        );
      }
    }

    function handleSeen({ conversationId, userId, seenAt }) {
      const current = selectedConversationRef.current;

      if (
        current &&
        conversationId === current.id &&
        userId !== user.id
      ) {
        setPartnerLastReadAt(seenAt);
      }
    }

    socket.on("receive_message", handleReceiveMessage);
    socket.on("typing", handleTyping);
    socket.on("stop_typing", handleStopTyping);
    socket.on("seen", handleSeen);

    return () => {
      socket.off("receive_message", handleReceiveMessage);
      socket.off("typing", handleTyping);
      socket.off("stop_typing", handleStopTyping);
      socket.off("seen", handleSeen);
    };
  }, [socket, user.id]);

  async function selectConversation(conversation) {
    setSelectedConversation(conversation);
    setMessages([]);
    setTypingConversationId(null);
    setPartnerLastReadAt(null);

    try {
      const data = await getMessages(conversation.id);

      setMessages(data);

      const other = conversation.participants.find(
        (participant) => participant.userId !== user.id
      );

      setPartnerLastReadAt(other?.lastReadAt || null);

      await markConversationSeen(conversation.id);

      setConversations((prev) =>
        prev.map((c) =>
          c.id === conversation.id ? { ...c, unreadCount: 0 } : c
        )
      );
    } catch (err) {
      console.error(err);
    }
  }

  async function startChatWithTeammate(teammate) {
    try {
      const conversation = await createConversation(teammate.id);

      setConversations((prev) => {
        const exists = prev.some((c) => c.id === conversation.id);

        return exists ? prev : [conversation, ...prev];
      });

      selectConversation(conversation);
    } catch (err) {
      console.error(err);
    }
  }

  async function handleSendMessage(text) {
    if (!selectedConversation) return;

    const tempId = `temp-${Date.now()}`;
    const optimisticMessage = {
      id: tempId,
      conversationId: selectedConversation.id,
      senderId: user.id,
      text,
      createdAt: new Date().toISOString(),
      sender: {
        id: user.id,
        name: user.name,
      },
      isOptimistic: true,
    };

    setMessages((prev) => [...prev, optimisticMessage]);

    try {
      const message = await sendMessage(selectedConversation.id, text);

      setMessages((prev) =>
        prev.map((m) => (m.id === tempId ? message : m))
      );

      setConversations((prev) =>
        prev.map((conversation) =>
          conversation.id === selectedConversation.id
            ? { ...conversation, messages: [message] }
            : conversation
        )
      );
    } catch (err) {
      console.error(err);
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
    }
  }

  function handleTyping() {
    if (socket && selectedConversation) {
      socket.emit("typing", selectedConversation.id);
    }
  }

  function handleStopTyping() {
    if (socket && selectedConversation) {
      socket.emit("stop_typing", selectedConversation.id);
    }
  }

  if (loading) {
    return (
      <div className="chat-page">
        <h2>Loading chats...</h2>
      </div>
    );
  }

  const partner = selectedConversation?.participants.find(
    (participant) => participant.userId !== user.id
  )?.user;

  return (
    <div className="chat-page">
      <ConversationList
        conversations={conversations}
        teammates={teammates}
        selectedConversationId={selectedConversation?.id}
        currentUserId={user.id}
        isUserOnline={isUserOnline}
        onSelectConversation={selectConversation}
        onStartChat={startChatWithTeammate}
      />

      <ChatWindow
        conversation={selectedConversation}
        currentUserId={user.id}
        messages={messages}
        isOnline={isUserOnline(partner?.id)}
        isPartnerTyping={
          typingConversationId === selectedConversation?.id
        }
        partnerLastReadAt={partnerLastReadAt}
        onSendMessage={handleSendMessage}
        onTyping={handleTyping}
        onStopTyping={handleStopTyping}
      />
    </div>
  );
}
