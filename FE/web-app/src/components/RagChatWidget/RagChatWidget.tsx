import React, { useState, useRef, useEffect } from 'react';
import './RagChatWidget.css';
import axios from 'axios';
import { Link } from 'react-router-dom';

interface SuggestedBook {
    id: string;
    name: string;
    imageUrl: string;
    price: number;
}

interface ChatMessage {
    id: number;
    sender: 'User' | 'AI';
    text: string;
    suggestedBooks?: SuggestedBook[];
}

const RagChatWidget: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const toggleChat = () => {
        if (!isOpen && messages.length === 0) {
            setMessages([
                { id: Date.now(), sender: 'AI', text: 'Chào bạn! Mình là Trợ lý AI của ZShop. Bạn đang tìm cuốn sách như thế nào?' }
            ]);
        }
        setIsOpen(!isOpen);
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        if (isOpen) {
            scrollToBottom();
        }
    }, [messages, isLoading, isOpen]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputValue.trim() || isLoading) return;

        const userMsgText = inputValue.trim();
        const newMsg: ChatMessage = { id: Date.now(), sender: 'User', text: userMsgText };
        setMessages(prev => [...prev, newMsg]);
        setInputValue('');
        setIsLoading(true);

        try {
            const apiUrl = (process.env.REACT_APP_API_BASE_DOMAIN || "http://localhost:5032") + "/api/chatbot/chat";
            const response = await axios.post(apiUrl, { userMessage: userMsgText });
            
            const aiData = response.data;
            const aiMsg: ChatMessage = {
                id: Date.now(),
                sender: 'AI',
                text: aiData.aiMessage || 'Xin lỗi, AI đang gặp lỗi kết nối.',
                suggestedBooks: aiData.suggestedBooks
            };
            setMessages(prev => [...prev, aiMsg]);
        } catch (error) {
            setMessages(prev => [...prev, { id: Date.now(), sender: 'AI', text: 'Xin lỗi, không thể kết nối tới máy chủ AI lúc này.' }]);
        } finally {
            setIsLoading(false);
        }
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
    };

    return (
        <>
            {isOpen && (
                <div className="rag-chat-dialog">
                    <div className="rag-chat-header">
                        <div className="rag-chat-header-content">
                            <div className="rag-chat-avatar">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
                                </svg>
                            </div>
                            <div className="rag-chat-header-info">
                                <h3>AI Tư vấn ZShop</h3>
                                <p className="rag-chat-status">
                                    <span className="rag-status-dot"></span> Online
                                </p>
                            </div>
                        </div>
                        <button className="rag-chat-close-btn" onClick={toggleChat}>
                            ✖
                        </button>
                    </div>

                    <div className="rag-chat-body">
                        {messages.map(m => (
                            <div key={m.id} className={`rag-chat-message ${m.sender === 'User' ? 'user' : 'ai'}`}>
                                <div className="rag-message-bubble">
                                    <p>{m.text}</p>
                                    
                                    {m.suggestedBooks && m.suggestedBooks.length > 0 && (
                                        <div className="rag-suggested-books">
                                            {m.suggestedBooks.map(book => (
                                                <Link to={`/book?id=${book.id}`} key={book.id} className="rag-book-card">
                                                    <img src={book.imageUrl} alt={book.name} />
                                                    <div className="rag-book-info">
                                                        <span className="rag-book-name" title={book.name}>{book.name}</span>
                                                        <span className="rag-book-price">{formatPrice(book.price)}</span>
                                                    </div>
                                                </Link>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="rag-chat-message ai">
                                <div className="rag-message-bubble loading-bubble">
                                    <span>.</span><span>.</span><span>.</span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    <div className="rag-chat-footer">
                        <form onSubmit={handleSendMessage}>
                            <input
                                type="text"
                                placeholder="Nhập yêu cầu tìm sách..."
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                className="rag-chat-input"
                            />
                            <button
                                type="submit"
                                className="rag-chat-send-btn"
                                disabled={!inputValue.trim() || isLoading}
                            >
                                Gửi
                            </button>
                        </form>
                    </div>
                </div>
            )}

            <button
                className={`rag-chat-button ${isOpen ? 'open' : ''}`}
                onClick={toggleChat}
                title="AI Tư vấn Sách"
            >
                {isOpen ? (
                    <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
                        <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                    </svg>
                ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
                    </svg>
                )}
            </button>
        </>
    );
};

export default RagChatWidget;
