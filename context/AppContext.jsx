"use client";
import { useAuth, useUser } from '@clerk/nextjs';
import axios from 'axios';
import { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';

export const AppContext = createContext();
export const useAppContext = () => {
    return useContext(AppContext);
};

export const AppContextProvider = ({ children }) => {
    const { user } = useUser();
    const { getToken } = useAuth();

    const [chats, setChats] = useState([]);
    const [selectedChat, setSelectedChat] = useState(null);

    const createNewChat = async () => {
        try {
            if (!user) return null;

            const token = await getToken();
            await axios.post(
                '/api/clerk/chat/create',
                {},
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            fetchUserChats();
        } catch (error) {
            toast.error('Failed to create new chat');
        }
    };

    const fetchUserChats = async () => {
        try {
            const token = await getToken();
            const { data } = await axios.post(
                '/api/clerk/chat/get',
                {},
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (data.success) {
                setChats(data.data);

                if (data.data.length === 0) {
                    await createNewChat();
                    return;
                }

                // Sort chats by updatedAt
                data.data.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

                // Set the first chat as selected
                setSelectedChat(data.data[0]);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message || 'Failed to fetch chats');
        }
    };

    useEffect(() => {
        if (user) {
            fetchUserChats();
        }
    }, [user]);

    const values = {
        user,
        chats,
        setChats,
        selectedChat,
        setSelectedChat,
        fetchUserChats,
        createNewChat,
    };

    return <AppContext.Provider value={values}>{children}</AppContext.Provider>;
};
