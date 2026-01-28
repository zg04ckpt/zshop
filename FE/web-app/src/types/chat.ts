export type MessageType = 'Admin'|'User'|'Auto'

export interface StartAnonymousConversationRequestDTO {
    customerName: string;
}

export interface MessageListItemDTO
{
    id: number;
    type: MessageType;
    isRead: boolean;
    content: string;
    timestamp: Date;
}

export interface ConversationDTO
{
    id: string;
    customerName: string;
    userId: string|null;
    isAdminOnline: boolean;
    isCustomerOnline: boolean;
    messages: MessageListItemDTO[];
}

export interface ConversationListItemDTO
{
    id: string;
    customerName: string;
    isCustomerOnline: boolean;
    lastMessage: MessageListItemDTO|null;
    isAnonymousConversation: boolean
}