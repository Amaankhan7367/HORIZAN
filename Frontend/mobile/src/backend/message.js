import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "../conf/conf";

export class MessageService {
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

  async getMessages(conversation_id) {
    try {
      const authHeader = await this.getAuthHeader();

      const response = await this.api.get(
        `/message/${conversation_id}`,
        authHeader
      );

      return response.data;
    } catch (error) {
      console.log("getMessages :: error", error);
      throw error;
    }
  }

  async createMessage(conversation_id, Message) {
    try {
      const authHeader = await this.getAuthHeader();

      const response = await this.api.post(
        `/message/${conversation_id}`,
        Message,
        authHeader
      );

      return response.data;
    } catch (error) {
      console.log("createMessage :: error", error);
      throw error;
    }
  }

  async updateMessage(message_id, Message) {
    try {
      const authHeader = await this.getAuthHeader();

      const response = await this.api.put(
        `/message/${message_id}`,
        Message,
        authHeader
      );

      return response.data;
    } catch (error) {
      console.log("updateMessage :: error", error);
      throw error;
    }
  }

  async deleteMessage(message_id) {
    try {
      const authHeader = await this.getAuthHeader();

      const response = await this.api.delete(
        `/message/${message_id}`,
        authHeader
      );

      return response.data;
    } catch (error) {
      console.log("deleteMessage :: error", error);
      throw error;
    }
  }
  async markMessagesSeen(conversation_id) {
  try {
    const authHeader = await this.getAuthHeader();

    const response = await this.api.put(
      `/message/${conversation_id}/seen`,
      {},
      authHeader
    );

    return response.data;
  } catch (error) {
    console.log("markMessagesSeen :: error", error);
    throw error;
  }
}
}

const messageService = new MessageService();

export default messageService;