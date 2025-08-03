"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useAuth, useUser } from "@clerk/nextjs";
import axios from "axios";
import toast from "react-hot-toast";

export const AppContext = createContext();
export const useAppContext = () => useContext(AppContext);

export const AppContextProvider = ({ children }) => {
  const { user } = useUser();
  const { getToken } = useAuth();
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);

  const createNewChat = async () => {
    try {
      const token = await getToken();
      await axios.post(
        "/api/clerk/chat/create",
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      await fetchUserChats();
    } catch (error) {
      toast.error("Failed to create new chat");
    }
  };

  const fetchUserChats = async () => {
    try {
      const token = await getToken();
      const { data } = await axios.post(
        "/api/clerk/chat/get",
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (data.success) {
        const sortedChats = data.data.sort(
          (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
        );
        setChats(sortedChats);
        setSelectedChat(sortedChats[0] || null);

        if (sortedChats.length === 0) {
          await createNewChat();
        }
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error?.message || "Failed to fetch chats");
    }
  };

  useEffect(() => {
    if (user) {
      fetchUserChats();
    }
  }, [user]);

  return (
    <AppContextProvider
      value={{
        user,
        chats,
        setChats,
        selectedChat,
        setSelectedChat,
        fetchUserChats,
        createNewChat,
      }}
    >
      {children}
    </AppContextProvider>
  );
};

export default AppContextProvider;
