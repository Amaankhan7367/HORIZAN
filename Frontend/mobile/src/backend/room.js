import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "../conf/conf";

export class RoomService {
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

    async createRoom(name, latitude, longitude) {
        try {
            const config = await this.getAuthHeader();

            const res = await this.api.post(
                "/room/create",
                {
                    name,
                    latitude,
                    longitude,
                },
                config
            );

            return res.data;
        } catch (error) {
            console.error(
                "Error creating room:",
                error.response?.data || error.message
            );
            throw error;
        }
    }

    async get_rooms() {
        try {
            const config = await this.getAuthHeader();

            const res = await this.api.get(
                "/room/",
                config
            );

            return res.data;
        } catch (error) {
            console.error(
                "Error getting rooms:",
                error.response?.data || error.message
            );
            throw error;
        }
    }

    async get_room_details(room_id) {
        try {
            const config = await this.getAuthHeader();

            const res = await this.api.get(
                `/room/${room_id}`,
                config
            );

            return res.data;
        } catch (error) {
            console.error(
                "Error getting room details:",
                error.response?.data || error.message
            );
            throw error;
        }
    }

    async join_existing_room(room_id, latitude, longitude) {
        try {
            const config = await this.getAuthHeader();

            const res = await this.api.post(
                `/room/${room_id}/join`,
                {
                    roomId: room_id,
                    latitude,
                    longitude,
                },
                config
            );

            return res.data;
        } catch (error) {
            console.error(
                "Error joining room:",
                error.response?.data || error.message
            );
            throw error;
        }
    }

    async get_members(room_id) {
        try {
            const config = await this.getAuthHeader();

            const res = await this.api.get(
                `/room/${room_id}/members`,
                config
            );

            return res.data;
        } catch (error) {
            console.error(
                "Error getting room members:",
                error.response?.data || error.message
            );
            throw error;
        }
    }

    async remove_room(room_id) {
        try {
            const config = await this.getAuthHeader();

            const res = await this.api.delete(
                `/room/${room_id}`,
                config
            );

            return res.data;
        } catch (error) {
            console.error(
                "Error removing room:",
                error.response?.data || error.message
            );
            throw error;
        }
    }
}

const roomService = new RoomService();

export default roomService;