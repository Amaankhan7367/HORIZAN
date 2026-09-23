import axios from "axios";
import {apiUrl} from "../conf/conf"

export class ConversationService{
    constructor(){
        this.api =axios.create({
            //baseURL: "http://127.0.0.1:8000",
            baseURL:apiUrl,
            headers: {
                "Content-Type": "application/json",
            },
        })
    }

    getAuthHeader() {
        const token = localStorage.getItem("token");

        return {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        };
    }

    async new_conversation (user1_id,user2_id){
        try {
            const response =await this.api.post('/conversation/',
                null,
                {
                    params: {
                        user1_id,
                        user2_id
                    },
                    ...this.getAuthHeader(),
                }
            );
            return response.data;
        } catch (error) {
            console.log("createConversation :: error", error);
            throw error;
        }
        
    }

    async getConversations(user_id){
        try {
            const response =await this.api.get(`/conversation/user/${user_id}`,
                this.getAuthHeader()
            );
            return response.data;
        } catch (error) {
            console.log("getConversations :: error", error);
            throw error;
        }
    }

    async getConversation(conversation_id,user_id){
        try {
            const response = await this.api.get(`/conversation/${conversation_id}`,
                {
                    params: {
                        user_id,
                    },
                    ...this.getAuthHeader(),
                }
            );
            return (await response).data;
        } catch (error) {
            console.log("deleteConversation :: error", error);
            throw error;
        }
    }
    async deleteConversation(conversation_id, user_id) {
        try {
            const response = await this.api.delete(
                `/conversation/${conversation_id}`,
                {
                    params: {
                        user_id,
                    },
                    ...this.getAuthHeader(),
                }
            );

            return response.data;

        } catch (error) {
            console.log("deleteConversation :: error", error);
            throw error;
        }
    }
}

const conversationService = new ConversationService();
export default conversationService