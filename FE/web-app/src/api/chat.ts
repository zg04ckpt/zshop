import { Paginated } from "../types/api";
import { ConversationDTO, ConversationListItemDTO, StartAnonymousConversationRequestDTO } from "../types/chat"
import { del, get, post } from "./config/axios"
import { endpoints } from "./config/endpoints"

export const startConversation = async () => {
    return await post<ConversationDTO>(endpoints.chat.startConversation, {});
}
export const startAnonymousConversation = async (request: StartAnonymousConversationRequestDTO) => {
    return await post<ConversationDTO>(endpoints.chat.startAnonymousConversation, request);
}

export const listAllConversation = async (index: Number) => {
    return await get<Paginated<ConversationListItemDTO>>(endpoints.chat.listAllConversation(index));
}

export const getConversation = async (id: string) => {
    return await get<ConversationDTO>(endpoints.chat.getConversation(id));
}

export const getExistingConversation = async () => {
    return await get<ConversationDTO>(endpoints.chat.existingConversation);
}

export const deleteConversations = async (ids: string[]) => {
    return await post<string[]>(
        endpoints.chat.deleteConversations, 
        { conversationIds: ids }
    );
}