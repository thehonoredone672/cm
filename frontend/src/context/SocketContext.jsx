import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

import { io } from "socket.io-client";

import { useAuth } from "./AuthContext";

const SocketContext = createContext();

// Reuse the API's origin (strip the trailing /api) for the socket connection.
const SOCKET_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:5000/api"
).replace(/\/api\/?$/, "");

export function SocketProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [onlineUserIds, setOnlineUserIds] = useState([]);

  useEffect(() => {
    if (!isAuthenticated) {
      if (socket) {
        socket.disconnect();
      }
      setSocket(null);
      setConnected(false);
      setOnlineUserIds([]);
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) return;

    const socketInstance = io(SOCKET_URL, {
      auth: { token },
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
    });

    setSocket(socketInstance);

    socketInstance.on("connect", () => {
      setConnected(true);
    });

    socketInstance.on("disconnect", () => {
      setConnected(false);
    });

    socketInstance.on("online_users", (userIds) => {
      setOnlineUserIds(userIds);
    });

    return () => {
      socketInstance.disconnect();
      setSocket(null);
      setConnected(false);
    };
  }, [isAuthenticated]);

  function isUserOnline(userId) {
    return onlineUserIds.includes(userId);
  }

  return (
    <SocketContext.Provider
      value={{
        socket,
        connected,
        onlineUserIds,
        isUserOnline,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  return useContext(SocketContext);
}
