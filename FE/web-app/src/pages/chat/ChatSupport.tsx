import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  TextField,
  InputAdornment,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Badge,
  Typography,
  IconButton,
  Button,
  Divider,
  Card,
  Chip,
  Tooltip,
  Checkbox,
  FormControlLabel,
} from '@mui/material';
import {
  Search as SearchIcon,
  Send as SendIcon,
  AttachFile as AttachFileIcon,
  ChatBubble as ChatIcon,
  Notifications as NotificationsIcon,
  MoreVert as MoreVertIcon,
  Info as InfoIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  ShoppingCart as ShoppingCartIcon,
  Message as MessageIcon,
  DeleteOutline as DeleteOutlineIcon,
  Check as CheckIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { HubConnection } from '@microsoft/signalr';
import * as signalR from "@microsoft/signalr";
import { ConversationDTO, ConversationListItemDTO, MessageListItemDTO } from '../../types/chat';
import { showErrorToast, showInfoToast, showSuccessToast } from '../../utils';
import { deleteConversations, getConversation, listAllConversation } from '../../api/chat';
import { useAppContext } from '../../stores';

const ChatSupport: React.FC = () => {
    const context = useAppContext();

    const connectionRef = useRef<HubConnection | null>(null);
    const [selectedConversation, setSelectedConversation] = useState<ConversationDTO | null>(null);

    const [page , setPage] = useState<number>(1);
    const [totalPage , setTotalPage] = useState<number>(1);

    const [conversations, setConversations] = useState<ConversationListItemDTO[]>([]);
    const [filteredConversations, setFilteredConversations] = useState<ConversationListItemDTO[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [deleteMode, setDeleteMode] = useState(false);
    const [selectedForDelete, setSelectedForDelete] = useState<Set<string>>(new Set());
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        startConnnection();
        loadConversations(page);
        
        return () => {
            // Cleanup connection on unmount
            if (connectionRef.current) {
                connectionRef.current.stop();
                connectionRef.current = null;
            }
        };
    }, []);

    useEffect(() => {
        if (selectedConversation && selectedConversation.messages.length > 0) {
            scrollToBottom();
        }
    }, [selectedConversation?.messages]);

    useEffect(() => {
        setFilteredConversations(conversations.filter((conv) =>
            conv.customerName.toLowerCase().includes(searchQuery.toLowerCase())
        ));
    }, [conversations, searchQuery]);

    const loadConversations = async (pageIndex: number) => {
        if (pageIndex < 1 || pageIndex > totalPage) {
            return;
        }
        const res = await listAllConversation(pageIndex);
        if (res.isSuccess) {
            setConversations(res.data!.items);
            setTotalPage(res.data!.totalPages);
            setPage(pageIndex);
        } else {
            showErrorToast(res.message || "Tải danh sách hội thoại thất bại");
        }
    }
 
    const handleSelectConversation = async (conversation: ConversationListItemDTO) => {
        var res = await getConversation(conversation.id);
        if (res.isSuccess) {
            res.data!.isCustomerOnline = conversation.isCustomerOnline;
            setSelectedConversation(res.data!);
        } else {
            showErrorToast(res.message || "Tải dữ liệu hội thoại thất bại");
        }
    };

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (inputValue.trim() && selectedConversation) {
            connectionRef.current?.invoke('OnAdminSendMessage', inputValue.trim(), selectedConversation.id);
            setInputValue('');
        }
    };

    const formatTime = (date: Date) => {
        date = new Date(date);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return 'Vừa xong';
        if (minutes < 60) return `${minutes} phút trước`;
        if (hours < 24) return `${hours} giờ trước`;
        if (days < 7) return `${days} ngày trước`;
        return date.toLocaleDateString('vi-VN');
    };

    const formatMessageTime = (date: Date) => {
        const d = new Date();
        return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    };

    const handleToggleDeleteMode = () => {
        setDeleteMode(!deleteMode);
        setSelectedForDelete(new Set());
    };

    const handleToggleSelectConversation = (conversationId: string) => {
        const newSelected = new Set(selectedForDelete);
        if (newSelected.has(conversationId)) {
            newSelected.delete(conversationId);
        } else {
            newSelected.add(conversationId);
        }
        setSelectedForDelete(newSelected);
    };

    const handleSelectAnonymous = (checked: boolean) => {
        if (checked) {
            const anonymousIds = conversations
                .filter(conv => conv.isAnonymousConversation)
                .map(conv => conv.id);
            setSelectedForDelete(new Set(anonymousIds));
        } else {
            setSelectedForDelete(new Set());
        }
    };

    const handleConfirmDelete = () => {
        context?.showConfirmDialog({
            message: `Xác nhận muốn xóa ${selectedForDelete.size} hội thoại?`,
            onConfirm: async () => {
                const res = await deleteConversations(Array.from(selectedForDelete));
                if (res.isSuccess) {
                    showSuccessToast("Đã xóa thành công " + res.data?.length + " hội thoại");
                    setDeleteMode(false);
                    setSelectedForDelete(new Set());
                    loadConversations(page);
                } else {
                    showErrorToast(res.message || "Xóa hội thoại thất bại");
                }
            },
            onReject: () => {}
        });
    };

    const startConnnection = async () => {
        // Prevent creating multiple connections
        if (connectionRef.current) {
            return;
        }
        
        connectionRef.current = new signalR.HubConnectionBuilder()
            .withUrl(process.env.REACT_APP_API_BASE_DOMAIN + "/hubs/chat", { withCredentials: true })
            .withAutomaticReconnect()
            .configureLogging(signalR.LogLevel.Information)
            .build();

        connectionRef.current.on("OnClientOnline", (isOnline: boolean, conversationId: string) => {
            setConversations(conversations => conversations.map(e => {
                if (e.id != conversationId) return e;
                return {
                    ...e,
                    isCustomerOnline: isOnline
                };
            }));
            setSelectedConversation(prev => {
                if (prev?.id != conversationId) return prev;
                return {
                    ...prev,
                    isCustomerOnline: isOnline
                };
            });
        });

        connectionRef.current.on("OnReceivedMessage", (message: MessageListItemDTO, conId: string) => {
            console.log(message);
            const idx = conversations.findIndex(e => e.id == conId);
            if (idx == -1) {
                loadConversations(page);
            } else {
                setConversations(conversations => {
                    const updated = [...conversations];
                    updated[idx].lastMessage = message;
                    // Sort if new messaage is not in first conversation
                    if (idx != 0) {
                        updated.sort((a, b) => {
                            return new Date(b.lastMessage!.timestamp).getTime() - new Date(a.lastMessage!.timestamp).getTime();
                        });
                    }
                    return updated;
                });
            }

            setSelectedConversation(prev => {
                if (prev && prev.id == conId) {
                    return { ...prev, messages: [...prev.messages, message] };
                }
                return prev;
            });
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

        await connectionRef.current.start().then(() => showSuccessToast("Đã kết nối"));
        console.log("SignalR connected");
    }

    return (
        <Box sx={{ height: 'calc(100vh - 60px)', display: 'flex', flexDirection: 'column', bgcolor: '#f5f7fa' }}>
            {/* Body */}
            <Box sx={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
                {/* Sidebar - Conversation List */}
                <Paper sx={{ width: 320, display: 'flex', flexDirection: 'column', borderRadius: 0 }} elevation={0}>
                    <Box sx={{ p: 2, bgcolor: '#f9fafb' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                            <Typography variant="subtitle2" color="text.secondary" fontWeight={600}>
                                Hội thoại ({conversations.length})
                            </Typography>
                            {!deleteMode ? (
                                <Tooltip title="Xóa hội thoại">
                                    <IconButton size="small" onClick={handleToggleDeleteMode} color="error">
                                        <DeleteOutlineIcon fontSize="small" />
                                    </IconButton>
                                </Tooltip>
                            ) : (
                                <Box sx={{ display: 'flex', gap: 0.5 }}>
                                    <Tooltip title="Xác nhận xóa">
                                        <IconButton 
                                            size="small" 
                                            onClick={handleConfirmDelete}
                                            color="success"
                                            disabled={selectedForDelete.size === 0}
                                        >
                                            <CheckIcon fontSize="small" />
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Hủy">
                                        <IconButton size="small" onClick={handleToggleDeleteMode}>
                                            <CloseIcon fontSize="small" />
                                        </IconButton>
                                    </Tooltip>
                                </Box>
                            )}
                        </Box>
                        {deleteMode && (
                            <Box sx={{ mb: 1.5 }}>
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            size="small"
                                            checked={conversations.filter(c => c.isAnonymousConversation).every(c => selectedForDelete.has(c.id))}
                                            onChange={(e) => handleSelectAnonymous(e.target.checked)}
                                        />
                                    }
                                    label={<Typography variant="caption">Lựa chọn các đoạn hội thoại ẩn danh</Typography>}
                                />
                            </Box>
                        )}
                        <TextField
                            fullWidth
                            size="small"
                            placeholder="Tìm kiếm khách hàng..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon fontSize="small" />
                                    </InputAdornment>
                                ),
                            }}
                        />
                    </Box>

                    <List sx={{ flex: 1, overflow: 'auto', p: 0 }}>
                        {filteredConversations.map((conversation) => (
                            <ListItem
                                key={conversation.id}
                                onClick={() => deleteMode ? handleToggleSelectConversation(conversation.id) : handleSelectConversation(conversation)}
                                sx={{
                                    cursor: 'pointer',
                                    borderBottom: '1px solid',
                                    borderColor: 'divider',
                                    bgcolor: selectedConversation?.id === conversation.id ? '#eff6ff' : 'transparent',
                                    borderLeft: selectedConversation?.id === conversation.id ? '3px solid' : 'none',
                                    borderLeftColor: selectedConversation?.id === conversation.id ? 'primary.main' : 'transparent',
                                    '&:hover': {
                                        bgcolor: 'action.hover',
                                    },
                                }}
                            >
                                {deleteMode && (
                                    <Checkbox
                                        checked={selectedForDelete.has(conversation.id)}
                                        onChange={() => handleToggleSelectConversation(conversation.id)}
                                        onClick={(e) => e.stopPropagation()}
                                        sx={{ mr: 1 }}
                                    />
                                )}
                                <ListItemAvatar>
                                    <Badge
                                        overlap="circular"
                                        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                                        variant="dot"
                                        sx={{
                                            '& .MuiBadge-badge': {
                                                backgroundColor: conversation.isCustomerOnline ? '#10b981' : '#9ca3af',
                                                width: 12,
                                                height: 12,
                                                borderRadius: '50%',
                                                border: '2px solid white',
                                            },
                                        }}
                                    >
                                        <Avatar
                                            sx={{
                                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                                fontWeight: 600,
                                            }}
                                        >
                                            {conversation.customerName.charAt(0)}
                                        </Avatar>
                                    </Badge>
                                </ListItemAvatar>
                                <ListItemText
                                    primary={
                                        <Box component="span" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                                            <Typography component="span" variant="subtitle2" fontWeight={600}>
                                                {conversation.customerName}
                                            </Typography>
                                            <Typography component="span" variant="caption" color="text.secondary">
                                                {formatTime(conversation.lastMessage!.timestamp)}
                                            </Typography>
                                        </Box>
                                    }
                                    secondary={
                                        <Box component="span" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <Typography
                                                component="span"
                                                variant="body2"
                                                color="text.secondary"
                                                sx={{
                                                    fontWeight: 'normal',
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    whiteSpace: 'nowrap',
                                                    flex: 1,
                                                }}
                                            >
                                                {conversation.lastMessage?.type == 'Admin' && `Bạn:`}{conversation.lastMessage?.content}
                                            </Typography>
                                        </Box>
                                    }
                                />
                            </ListItem>
                        ))}
                    </List>
                </Paper>

                <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', bgcolor: '#f9fafb' }}>
                    {selectedConversation ? (
                        <>
                            <Paper sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderRadius: 0 }} elevation={0}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                    <Avatar
                                        sx={{
                                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                            fontWeight: 600,
                                        }}
                                    >
                                        {selectedConversation.customerName.charAt(0)}
                                    </Avatar>
                                    <Box>
                                        <Typography variant="subtitle1" fontWeight={600}>
                                            {selectedConversation.customerName}
                                        </Typography>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                            <Box
                                                sx={{
                                                    width: 8,
                                                    height: 8,
                                                    borderRadius: '50%',
                                                    bgcolor: selectedConversation.isCustomerOnline ? '#10b981' : '#9ca3af',
                                                }}
                                            />
                                            <Typography variant="caption" color="text.secondary">
                                                {selectedConversation.isCustomerOnline ? 'Đang hoạt động' : 'Không hoạt động'}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Box>
                                <Box>
                                    <Tooltip title="Thông tin khách hàng">
                                        <IconButton size="small">
                                            <InfoIcon />
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Tùy chọn">
                                        <IconButton size="small">
                                            <MoreVertIcon />
                                        </IconButton>
                                    </Tooltip>
                                </Box>
                            </Paper>

                            {/* Messages */}
                            <Box sx={{ flex: 1, overflow: 'auto', p: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
                                {selectedConversation.messages.map((message) => (
                                    <Box
                                        key={message.id}
                                        sx={{
                                            display: 'flex',
                                            justifyContent: message.type !== 'User' ? 'flex-end' : 'flex-start',
                                        }}
                                    >
                                        <Paper
                                            sx={{
                                                maxWidth: '60%',
                                                p: 1.5,
                                                bgcolor: message.type !== 'User'
                                                    ? 'primary.main' 
                                                    : 'background.paper',
                                                color: message.type !== 'User' ? 'white' : 'text.primary',
                                                borderRadius: 2.5,
                                                borderBottomLeftRadius: message.type === 'User' ? 0.5 : 2.5,
                                                borderBottomRightRadius: message.type !== 'User' ? 0.5 : 2.5,
                                            }}
                                            elevation={message.type !== 'User' ? 0 : 1}
                                        >
                                            <Typography variant="body2">
                                                {message.content}
                                            </Typography>
                                            <Typography
                                                variant="caption"
                                                sx={{
                                                    display: 'block',
                                                    mt: 0.5,
                                                    opacity: 0.7,
                                                }}
                                            >
                                                {formatMessageTime(message.timestamp)}
                                            </Typography>
                                        </Paper>
                                    </Box>
                                ))}
                                <div ref={messagesEndRef} />
                            </Box>

                            {/* Input Area */}
                            <Paper sx={{ p: 2, borderRadius: 0 }} elevation={1}>
                                <Box component="form" onSubmit={handleSendMessage} sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
                                    <Tooltip title="Đính kèm file">
                                        <IconButton size="small" sx={{ bgcolor: 'action.hover' }}>
                                            <AttachFileIcon />
                                        </IconButton>
                                    </Tooltip>
                                    <TextField
                                        fullWidth
                                        size="small"
                                        placeholder="Nhập tin nhắn..."
                                        value={inputValue}
                                        onChange={(e) => setInputValue(e.target.value)}
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                borderRadius: 3,
                                            },
                                        }}
                                    />
                                    <IconButton
                                        type="submit"
                                        disabled={!inputValue.trim()}
                                        sx={{
                                            bgcolor: 'primary.main',
                                            color: 'white',
                                            '&:hover': {
                                                bgcolor: 'primary.dark',
                                            },
                                            '&.Mui-disabled': {
                                                bgcolor: 'action.disabledBackground',
                                            },
                                        }}
                                    >
                                        <SendIcon />
                                    </IconButton>
                                </Box>
                            </Paper>
                        </>
                    ) : (
                        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'text.secondary' }}>
                            <ChatIcon sx={{ fontSize: 80, mb: 2, opacity: 0.5 }} />
                            <Typography variant="h6" fontWeight={600} color="text.secondary" gutterBottom>
                                Chọn một cuộc hội thoại
                            </Typography>
                            <Typography variant="body2">
                                Chọn một khách hàng từ danh sách bên trái để bắt đầu chat
                            </Typography>
                        </Box>
                    )}
                </Box>

            </Box>
        </Box>
    );
};

export default ChatSupport;
