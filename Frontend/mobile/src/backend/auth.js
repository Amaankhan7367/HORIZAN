import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "../conf/conf";

export class AuthService {
  constructor() {
    this.api = axios.create({
      // baseURL: "http://127.0.0.1:8000",
      baseURL:API_URL,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  async createAccount({ username, name, gmail, password }) {
    try {
      const userAccount = await this.api.post("/user/signup", {
        username,
        name,
        gmail,
        password,
      });

      if (userAccount) {
        return this.login({ username, password });
      }

      return userAccount;
    } catch (error) {
      console.log("createAccount :: error", error);
      throw error;
    }
  }

  async login({ username, password }) {
    try {
      const res = await this.api.post("/user/login", {
        username,
        password,
      });

      if (res.data.access_token) {
        await AsyncStorage.setItem("token", res.data.access_token);
      }

      return res.data;
    } catch (error) {
      console.log("login :: error", error);
      throw error;
    }
  }

  async logout() {
    try {
      await AsyncStorage.removeItem("token");
    } catch (error) {
      console.log("logout :: error", error);
      throw error;
    }
  }

  async getCurrentUser() {
    try {
      const token = await AsyncStorage.getItem("token");

      if (!token) {
        return null;
      }

      const res = await this.api.get("/user/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return res.data;
    } catch (error) {
      console.log("getCurrentUser :: error", error);
      throw error;
    }
  }

  async getAuthHeader() {
    const token = await AsyncStorage.getItem("token");

    return {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
  }

  async searchUser(username) {
    try {
      const authHeader = await this.getAuthHeader();

      const response = await this.api.get("/user/search", {
        params: { username },
        ...authHeader,
      });

      return response.data;
    } catch (error) {
      console.log("searchUser :: error", error);
      throw error;
    }
  }

  async get_user_by_id(user_id) {
    try {
      const authHeader = await this.getAuthHeader();

      const response = await this.api.get("/user/search-id", {
        params: { user_id },
        ...authHeader,
      });

      return response.data;
    } catch (error) {
      console.log("get_user_by_id :: error", error);
      throw error;
    }
  }
}

const authService = new AuthService();

export default authService;