import axios from "axios";
import {apiUrl} from "../conf/conf"

export class MessageService{
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

    async getMessages(conversation_id){
        try {
            const response = await this.api.get(`/message/${conversation_id}`,this.getAuthHeader());
            return response.data;
        } catch (error) {
            console.log("getMessages :: error", error);
            throw error;
        }
    }

    async createMessage(conversation_id,Message,){
        try {
            const response = await this.api.post(`/message/${conversation_id}`,
                Message,
                this.getAuthHeader()
            )
            return response.data;
        } catch (error) {
            console.log("CreateMessages :: error", error);
            throw error;
        }
    }

    async updateMessage(message_id,Message,){
        try {
            const response = this.api.put(`/message/${message_id}`,
                Message,
                this.getAuthHeader()
            )
            return (await response).data;
        } catch (error) {
            console.log("updateMessage :: error", error);
            throw error
        }
    }

    async deleteMessage(message_id){
        try {
            const response = this.api.delete(`/message/${message_id}`,this.getAuthHeader());
            return response.data;
        } catch (error) {
            console.log("deleteMessage :: error", error);
            throw error;
        }
    }
    
    async markAsSeen(conversation_id) {
    try {
        const response = await this.api.put(
            `/message/${conversation_id}/seen`,
            {},
            this.getAuthHeader()
        );

        return response.data;

    } catch (error) {
        console.log("markAsSeen :: error", error);
        throw error;
    }
}
}

const messageService = new MessageService();

export default messageService;