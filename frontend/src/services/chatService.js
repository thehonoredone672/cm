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

export const sendMessage = async (conversationId, text) => {
  const response = await api.post(`/chat/message/${conversationId}`, {
    text,
  });

  return response.data.data;
};
