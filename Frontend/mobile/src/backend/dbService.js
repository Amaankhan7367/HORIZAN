import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "../conf/conf";

export class Service {
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

  async createPost(post) {
    try {
      const authHeader = await this.getAuthHeader();

      const response = await this.api.post(
        "/post/",
        post,
        authHeader
      );

      return response.data;
    } catch (error) {
      console.log("CREATE POST ERROR:", error);
      console.log("STATUS:", error.response?.status);
      console.log(
        "DATA:",
        JSON.stringify(error.response?.data, null, 2)
      );
      throw error;
    }
  }

  async updatePost(postId, { title, content, image, userId }) {
    try {
      const authHeader = await this.getAuthHeader();

      console.log("PUT URL:", `/post/${postId}`);

      const response = await this.api.put(
        `/post/${postId}`,
        {
          title,
          content,
          image,
          userId,
        },
        authHeader
      );

      console.log("UPDATE RESPONSE:", response.data);

      return response.data;
    } catch (error) {
      console.log("UPDATE POST ERROR:", error);
      throw error;
    }
  }

  async deletePost(postId) {
    try {
      console.log("DELETE REQUEST:", postId);

      const authHeader = await this.getAuthHeader();

      await this.api.delete(
        `/post/${postId}`,
        authHeader
      );

      return true;
    } catch (error) {
      console.log("DELETE POST ERROR:", error);
      throw error;
    }
  }

  async getPost(postId) {
    try {
      const response = await this.api.get(
        `/post/${postId}`
      );

      return response.data;
    } catch (error) {
      console.log("GET POST ERROR:", error);

      throw (
        error.response?.data?.detail ||
        error.message
      );
    }
  }

  async allPosts() {
    try {
      const response = await this.api.get("/post/");

      return response;
    } catch (error) {
      console.log("ALL POSTS ERROR:", error);
      throw error;
    }
  }

  // Upload file
  async uploadFile(file) {
    try {
      const formData = new FormData();

      formData.append("file", file);

      const response = await this.api.post(
        "/post/uploads",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      return response.data;
    } catch (error) {
      console.log(
        "UPLOAD STATUS:",
        error.response?.status
      );

      console.log(
        "UPLOAD DATA:",
        error.response?.data
      );

      console.log(
        "UPLOAD ERROR:",
        error.message
      );

      throw error;
    }
  }

  async deleteFile(fileId) {
    try {
      const authHeader = await this.getAuthHeader();

      await this.api.delete(
        `/post/uploads/${fileId}`,
        authHeader
      );

      return true;
    } catch (error) {
      console.log("DELETE FILE ERROR:", error);
      throw error;
    }
  }

  getFileUrl(fileId) {
    return `${this.api.defaults.baseURL}/uploads/${fileId}`;
  }
}

const service = new Service();

export default service;