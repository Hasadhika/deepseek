import { assets } from '@/assets/assets';
import { useAppContext } from '@/context/AppContext';
import Image from 'next/image';
import React, { useState } from 'react';
import toast from 'react-hot-toast';
import axios from 'axios';

const PromtBox = ({ setIsLoading, isLoading }) => {
    const [promt, setPromt] = useState("");
    const { user, chats, setChats, selectedChat, setSelectedChat } = useAppContext();

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendPromt(e);
        }
    };

    const sendPromt = async (e) => {
        const promtCopy = promt;
        try {
            e.preventDefault();
            if (!user) return toast.error("Please login to send a message");
            if (isLoading) return toast.error("Wait for the previous message to finish sending");

            setIsLoading(true);
            setPromt("");

            const userPromt = {
                role: "user",
                content: promt,
                timeStamp: Date.now(),
            };

            setChats((prevChats) =>
                prevChats.map((chat) =>
                    chat._id === selectedChat._id
                        ? { ...chat, messages: [...chat.messages, userPromt] }
                        : chat
                )
            );

            setSelectedChat((prev) => ({
                ...prev,
                messages: [...prev.messages, userPromt],
            }));

            const { data } = await axios.post('/api/clerk/chat/ai', {
                chatId: selectedChat._id,
                promt
            });

            if (data.success) {
                setChats((prevChats) =>
                    prevChats.map((chat) =>
                        chat._id === selectedChat._id
                            ? { ...chat, messages: [...chat.messages, data.data] }
                            : chat
                    )
                );

                const message = data.data.content;
                const messageTokens = message.split(' ').length;
                let assistantMessage = {
                    role: 'assistant',
                    content: message,
                    timeStamp: Date.now(),
                };

                setSelectedChat((prev) => ({
                    ...prev,
                    messages: [...prev.messages, assistantMessage],
                }));

                for (let i = 0; i < messageTokens; i++) {
                    setTimeout(() => {
                        assistantMessage.content = message.split(' ').slice(0, i + 1).join(' ');
                        setSelectedChat((prev) => {
                            const updatedMessages = [
                                ...prev.messages.slice(0, -1),
                                assistantMessage,
                            ];
                            return {
                                ...prev,
                                messages: updatedMessages,
                            };
                        });
                    }, i * 100);
                }
            } else {
                toast.error("Failed to send message");
                setPromt(promtCopy);
            }
        } catch (error) {
            toast.error("Failed to send message");
            setPromt(promtCopy);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form
            onSubmit={sendPromt}
            className={`w-full ${false ? "maxw-3xl" : "max-w-2xl"} bg-[#404045] p-4 rounded-3xl mt-4 transition-all`}>
            <textarea
                onKeyDown={handleKeyDown}
                className='outline-none bg-transparent break-words overflow-hidden w-full'
                rows={1}
                placeholder='Message DeepSeek'
                required
                onChange={(e) => setPromt(e.target.value)}
                value={promt}
            />
            <div className='flex items-center justify-between text-sm'>
                <div className='flex items-center gap-2'>
                    <p className='flex items-center gap-2 text-xs border border-gray-300/40 px-2 py-1 rounded-full cursor-pointer hover:bg-gray-500/20 transition'>
                        <Image className='h-5' src={assets.deepthink_icon} alt='' />
                        DeepThink(R1)
                    </p>
                    <p className='flex items-center gap-2 text-xs border border-gray-300/40 px-2 py-1 rounded-full cursor-pointer hover:bg-gray-500/20 transition'>
                        <Image className='h-5' src={assets.search_icon} alt='' />
                        Search
                    </p>
                </div>
                <div className='flex items-center gap-2'>
                    <Image className='w-4 cursor-pointer' src={assets.pin_icon} alt='' />
                    <button
                        type='submit'
                        className={`${promt ? "bg-primary" : "bg-[#71717a]"} rounded-full p-2 cursor-pointer`}>
                        <Image
                            className='w-3.5 aspect-square'
                            src={promt ? assets.arrow_icon : assets.arrow_icon_dull}
                            alt=''
                        />
                    </button>
                </div>
            </div>
        </form>
    );
};

export default PromtBox;
