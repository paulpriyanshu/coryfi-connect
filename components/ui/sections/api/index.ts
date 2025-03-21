// Import necessary modules and utilities
import axios from "axios";
// import { LocalStorage } from "../utils";

// Create an Axios instance for API requests
const apiClient = axios.create({
  baseURL: "http://localhost:8080",
  withCredentials: true,
  timeout: 120000,
});

// Add an interceptor to set authorization header with user token before requests
apiClient.interceptors.request.use(
  function (config) {
    // Retrieve user token from local storage
    // const token = LocalStorage.get("token");
    // Set authorization header with bearer token
    // config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  function (error) {
    return Promise.reject(error);
  }
);

// API functions for different actions
const loginUser = (data: { username: string; password: string }) => {
  return apiClient.post("/users/login", data);
};

const registerUser = (data: {
  email: string;
  password: string;
  username: string;
}) => {
  return apiClient.post("/users/register", data);
};

const logoutUser = () => {
  return apiClient.post("/users/logout");
};

const getAvailableUsers = (id:any) => {
  return axios.get(`https://chat.coryfi.com/api/v1/chat-app/chats/users/${id}`);
};

const getUserChats = (id:any) => {
  return axios.get(`https://chat.coryfi.com/api/v1/chat-app/chats/${id}`);
};

const createUserChat = (receiverId: string,id:string) => {
  
  return axios.post(`https://chat.coryfi.com/api/v1/chat-app/chats/c/${receiverId}/${id}`);
};

const createGroupChat = (data: { name: string; participants: string[] }) => {
  return apiClient.post(`/chat-app/chats/group`, data);
};

const getGroupInfo = (chatId: string) => {
  return apiClient.get(`/chat-app/chats/group/${chatId}`);
};

const updateGroupName = (chatId: string, name: string) => {
  return apiClient.patch(`/chat-app/chats/group/${chatId}`, { name });
};

const deleteGroup = (chatId: string) => {
  return apiClient.delete(`/chat-app/chats/group/${chatId}`);
};

const deleteOneOnOneChat = (chatId: string) => {
  return apiClient.delete(`/chat-app/chats/remove/${chatId}`);
};

const addParticipantToGroup = (chatId: string, participantId: string) => {
  return apiClient.post(`/chat-app/chats/group/${chatId}/${participantId}`);
};

const removeParticipantFromGroup = (chatId: string, participantId: string) => {
  return apiClient.delete(`/chat-app/chats/group/${chatId}/${participantId}`);
};

const getChatMessages = (chatId: string,userId:any) => {
  return axios.get(`https://chat.coryfi.com/api/v1/chat-app/messages/${chatId}/${userId}`);
};

const sendMessage = (chatId: string, content: string, attachments: File[],userId:string) => {
  const formData = new FormData();
  if (content) {
    formData.append("content", content);
  }
  attachments?.map((file) => {
    formData.append("attachments", file);
  });
  console.log("form",formData)
  return axios.post(`https://chat.coryfi.com/api/v1/chat-app/messages/${chatId}/${userId}`, formData);
};

const deleteMessage = (chatId: string, messageId: string) => {
  return apiClient.delete(`/chat-app/messages/${chatId}/${messageId}`);
};

// Export all the API functions
export {
  addParticipantToGroup,
  createGroupChat,
  createUserChat,
  deleteGroup,
  deleteOneOnOneChat,
  getAvailableUsers,
  getChatMessages,
  getGroupInfo,
  getUserChats,
  loginUser,
  logoutUser,
  registerUser,
  removeParticipantFromGroup,
  sendMessage,
  updateGroupName,
  deleteMessage,
};
