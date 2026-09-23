import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "../conf/conf";

export class ConversationService {
  constructor() {
    this.api = axios.create({
      //baseURL: "http://127.0.0.1:8000",
      baseURL:API_URL,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  async getAuthHeader() {
    const token = await AsyncStorage.getItem("token");

    return {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
  }

  async new_conversation(user1_id, user2_id) {
    try {
      const authHeader = await this.getAuthHeader();

      const response = await this.api.post(
        "/conversation/",
        null,
        {
          params: {
            user1_id,
            user2_id,
          },
          ...authHeader,
        }
      );

      return response.data;
    } catch (error) {
      console.log("createConversation :: error", error);
      throw error;
    }
  }

  async getConversations(user_id) {
    try {
      const authHeader = await this.getAuthHeader();

      const response = await this.api.get(
        `/conversation/user/${user_id}`,
        authHeader
      );

      return response.data;
    } catch (error) {
      console.log("getConversations :: error", error);
      throw error;
    }
  }

  async getConversation(conversation_id, user_id) {
    try {
      const authHeader = await this.getAuthHeader();

      const response = await this.api.get(
        `/conversation/${conversation_id}`,
        {
          params: {
            user_id,
          },
          ...authHeader,
        }
      );

      return response.data;
    } catch (error) {
      console.log("getConversation :: error", error);
      throw error;
    }
  }

  async deleteConversation(conversation_id, user_id) {
    try {
      const authHeader = await this.getAuthHeader();

      const response = await this.api.delete(
        `/conversation/${conversation_id}`,
        {
          params: {
            user_id,
          },
          ...authHeader,
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

export default conversationService;