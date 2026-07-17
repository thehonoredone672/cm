import api from "../api/axios";

/*
|--------------------------------------------------------------------------
| Teammates (users chat is available with)
|--------------------------------------------------------------------------
*/

export const getTeammates = async () => {
  const response = await api.get("/chat/teammates");

  return response.data.data;
};

/*
|--------------------------------------------------------------------------
| Conversations
|--------------------------------------------------------------------------
*/

export const getConversations = async () => {
  const response = await api.get("/chat/conversation");

  return response.data.data;
};

export const createConversation = async (userId) => {
  const response = await api.post("/chat/conversation", {
    userId,
  });

  return response.data.data;
};

export const markConversationSeen = async (conversationId) => {
  const response = await api.patch(
    `/chat/conversation/${conversationId}/seen`
  );

  return response.data.data;
};

/*
|--------------------------------------------------------------------------
| Messages
|--------------------------------------------------------------------------
*/

export const getMessages = async (conversationId) => {
  const response = await api.get(`/chat/message/${conversationId}`);

  return response.data.data;
};

export const sendMessage = async (conversationId, text, fileUrl = null, fileType = null, codeLanguage = null) => {
  const response = await api.post(`/chat/message/${conversationId}`, {
    text,
    fileUrl,
    fileType,
    codeLanguage,
  });

  return response.data.data;
};

export const pinConversation = async (conversationId, isPinned) => {
  const response = await api.patch(`/chat/conversation/${conversationId}/pin`, { isPinned });
  return response.data.data;
};

export const editMessage = async (conversationId, messageId, text) => {
  const response = await api.put(`/chat/message/${conversationId}/${messageId}`, { text });
  return response.data.data;
};

export const deleteMessage = async (conversationId, messageId) => {
  const response = await api.delete(`/chat/message/${conversationId}/${messageId}`);
  return response.data;
};

export const pinMessage = async (conversationId, messageId, isPinned) => {
  const response = await api.patch(`/chat/message/${conversationId}/${messageId}/pin`, { isPinned });
  return response.data.data;
};

export const addReaction = async (conversationId, messageId, emoji) => {
  const response = await api.post(`/chat/message/${conversationId}/${messageId}/reactions`, { emoji });
  return response.data.data;
};

export const removeReaction = async (conversationId, messageId, emoji) => {
  const response = await api.delete(`/chat/message/${conversationId}/${messageId}/reactions`, { data: { emoji } });
  return response.data;
};
