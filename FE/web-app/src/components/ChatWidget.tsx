import React, { useState, useEffect, useRef } from 'react';
import '../styles/components/ChatWidget.css';
import { ConversationDTO, MessageListItemDTO } from '../types/chat';
import { HubConnection } from '@microsoft/signalr';
import * as signalR from "@microsoft/signalr";
import { Loading } from './Loading';
import { LocalUser } from '../types/auth';
import { RootState } from '../stores';
import { useSelector } from 'react-redux';
import { getExistingConversation, startAnonymousConversation, startConversation } from '../api/chat';
import { showErrorToast, showInfoToast } from '../utils';

const ChatWidget: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [lastMessage, setLastMessage] = useState<MessageListItemDTO|null>(null);
    const [conversation, setConversation] = useState<ConversationDTO | null>(null);
    const [inputValue, setInputValue] = useState('');
    const [chatStatus, setChatStatus] = useState<'Loading'|'TypeName'|'Conversation'>('Loading');

    const connectionRef = useRef<HubConnection | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const user: LocalUser|null = useSelector((state: RootState) => state.auth.user);

    const initConversation = async () => {
        // Check for conversation of logined user
        if (user) {
            const res = await startConversation();
            if (res.isSuccess) {
                setConversation(res.data!);
                setChatStatus('Conversation');
            }
            else
            {
                showErrorToast(res.message || "Khởi tạo hội thoại thất bại");
            }
            return;
        } 
        
        // Check for existing anonymous conversation
        const checkExistingRes = await getExistingConversation();
        if (checkExistingRes.isSuccess) {
            setConversation(checkExistingRes.data!);
            setChatStatus('Conversation');
            return;
        }

        // Start new anonymous conversation
        setChatStatus('TypeName');
    }

    useEffect(() => {
        if (chatStatus == 'Conversation') {
            startListenMessage();
        }
    }, [chatStatus]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        if (isOpen) {
            scrollToBottom();
        }
    }, [conversation?.messages, chatStatus, isOpen]);


    const toggleChat = () => {
        if (!isOpen && !connectionRef.current) {
            initConversation();
        }
        setIsOpen(!isOpen);
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputValue.trim()) return;
        
        setIsSending(true);
        if (chatStatus == 'TypeName') {
            setChatStatus('Loading');
            const res = await startAnonymousConversation({
                customerName: inputValue.trim(),
            });
            if (res.isSuccess) {
                setConversation(res.data!);
                setChatStatus('Conversation');
            }
            else
            {
                showErrorToast(res.message || "Khởi tạo hội thoại thất bại");
                setChatStatus('TypeName');
            }
            setIsSending(false);
        } else {
            setConversation(c => {
                if (!c) return c;
                return {
                    ...c,
                    messages: [
                        ...c.messages,
                        {
                            id: -1,
                            content: inputValue.trim(),
                            isRead: true,
                            timestamp: new Date(),
                            type: 'User'
                        }
                    ]
                };
            });
            connectionRef.current?.invoke("OnClientSendMessage", inputValue.trim());
        }
        setInputValue('');
    };

    const formatTime = (date: Date) => {
        const d = new Date(date);
        return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    };

    const startListenMessage = async () => {
        connectionRef.current = new signalR.HubConnectionBuilder()
            .withUrl(process.env.REACT_APP_API_BASE_DOMAIN! + "/hubs/chat", { withCredentials: true })
            .withAutomaticReconnect()
            .configureLogging(signalR.LogLevel.Information)
            .build();

        connectionRef.current.on('OnReceivedMessage', (message: MessageListItemDTO, _: string) => {
            setIsSending(false);
            if (message.type == 'User') {
                setConversation(c => {
                    if (!c) return c;
                    return {
                        ...c,
                        messages: c.messages.map(m => 
                            m.id == -1
                                ? { ...m, id: message.id, timestamp: message.timestamp }
                                : m
                        )
                    };
                });
            } else {
                setConversation(c => {
                    if (!c) return c;
                    return {
                        ...c,
                        messages: [...c.messages, message]
                    };
                });
            }
        });

        connectionRef.current.on('OnAdminOnline', isOnline => {
            setConversation(data => ({
                ...data!,
                isAdminOnline: isOnline
            }))
        });

        connectionRef.current.onclose(err => {
            console.warn("SignalR disconnected", err);
            connectionRef.current = null;
        });

        connectionRef.current.onreconnecting(err => {
            console.warn("SignalR reconnecting...");
        });

        connectionRef.current.onreconnected(id => {
            console.log("SignalR reconnected:", id);
        });

        await connectionRef.current.start();
        console.log("SignalR connected");
    }

    return (
        <>
            {/* Chat Dialog */}
            {isOpen && (
                <div className="chat-dialog">
                    <div className="chat-header">
                        <div className="chat-header-content">
                            <div className="chat-avatar">
                                <svg
                                    viewBox="0 0 24 24"
                                    fill="currentColor"
                                    width="24"
                                    height="24"
                                >
                                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
                                </svg>
                            </div>
                            <div className="chat-header-info">
                                <h3>ZShop Support</h3>
                                <p className="chat-status">
                                    {conversation && conversation.isAdminOnline && <>
                                        <span className="status-dot"></span>
                                        Đang hoạt động
                                    </>}
                                    {conversation && !conversation.isAdminOnline && <>
                                        <span className="status-dot bg-secondary-subtle"></span>
                                        Offline
                                    </>}
                                </p>
                            </div>
                        </div>
                        <button className="chat-close-btn" onClick={toggleChat}>
                            <svg
                                viewBox="0 0 24 24"
                                fill="currentColor"
                                width="20"
                                height="20"
                            >
                                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                            </svg>
                        </button>
                    </div>

                    <div className="chat-body">
                        {chatStatus == 'Loading' && <>
                            <div className='text-center my-auto px-3 mt-5'>Đang khởi tạo kết nối, vui lòng chờ trong giây lát ...</div>
                            <Loading isShow></Loading>
                        </>}
                        {chatStatus == 'TypeName' && <>
                            <div key={1} className={`chat-message admin-message`}>
                                <div className="message-bubble">
                                    <p>Chào mừng bạn đến với ZShop, vui lòng nhập tên của bạn để bắt đầu trò chuyện</p>
                                    <span className="message-time">Tin nhắn tự động - {formatTime(new Date())}</span>
                                </div>
                            </div>
                        </>}
                        {chatStatus == 'Conversation' && conversation && conversation.messages.map(e => <>
                            <div key={e.id}  className={`chat-message ${e.type === 'User' ? 'user-message' : 'admin-message'}`}>
                                <div className="message-bubble">
                                    <p>{e.content}</p>
                                    {e.id != -1 && <>
                                        <span className="message-time">{
                                            e.type == 'User'? 'Đã nhận - ':
                                            e.type == 'Auto'? 'Tin nhắn tự động - ':''
                                            } {formatTime(e.timestamp)}</span>
                                    </>}
                                    {e.id == -1 && <>
                                        <span className="message-time">Đã gửi</span>
                                    </>}
                                </div>
                            </div>
                        </>)}
                        <div ref={messagesEndRef} />
                    </div>

                    <div className="chat-footer">
                        <form onSubmit={handleSendMessage}>
                            <input
                                type="text"
                                placeholder={chatStatus != 'TypeName'? `Nhập tin nhắn...`:`Nhập tên của bạn (VD: Nguyên)`}
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                className="chat-input"
                            />
                            <button
                                type="submit"
                                className="chat-send-btn"
                                disabled={!inputValue.trim() || isSending}
                            >
                                <svg
                                    viewBox="0 0 24 24"
                                    fill="currentColor"
                                    width="20"
                                    height="20"
                                >
                                    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                                </svg>
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Chat Button */}
            <button
                className={`chat-button ${isOpen ? 'chat-button-open' : ''}`}
                onClick={toggleChat}
            >
                {isOpen ? (
                    <svg
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        width="28"
                        height="28"
                    >
                        <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                    </svg>
                ) : (
                    <svg
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        width="28"
                        height="28"
                    >
                        <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 9h12v2H6V9zm8 5H6v-2h8v2zm4-6H6V6h12v2z" />
                    </svg>
                )}
            </button>
        </>
    );
};

export default ChatWidget;
