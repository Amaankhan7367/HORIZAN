import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "../conf/conf";

export class Recents {
    constructor() {
        this.api = axios.create({
            baseURL: API_URL,
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

    // ADD TEXT RECENT
    async addTextRecent(recent) {
        try {
            const res = await this.api.post(
                "/recent/text",
                recent,
                await this.getAuthHeader()
            );

            return res.data;
        } catch (error) {
            throw error;
        }
    }

    // ADD IMAGE RECENT
    async addImageRecent(recent) {
        try {
            const res = await this.api.post(
                "/recent/photo",
                recent,
                await this.getAuthHeader()
            );

            return res.data;
        } catch (error) {
            throw error;
        }
    }

    // GET ALL RECENTS
    async allRecent() {
        try {
            const res = await this.api.get(
                "/recent/all",
                await this.getAuthHeader()
            );

            return res.data;
        } catch (error) {
            throw error;
        }
    }

    // DELETE RECENT
    async deleteRecent(recent_id) {
        try {
            const res = await this.api.delete(
                `/recent/${recent_id}`,
                await this.getAuthHeader()
            );

            return res.data;
        } catch (error) {
            throw error;
        }
    }
}

const recent = new Recents();

export default recent;