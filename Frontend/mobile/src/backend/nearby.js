import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "../conf/conf";

export class Nearby {
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

    // CREATE
    async createNearby(nearby, userId) {
        try {
            const res = await this.api.post(
                "/nearby/",
                nearby,
                {
                    ...(await this.getAuthHeader()),
                    params: {
                        userId: userId,
                    },
                }
            );

            return res.data;
        } catch (error) {
            throw error;
        }
    }

    // GET MY NEARBY DATA
    async getMyNearby(userId) {
        try {
            const res = await this.api.get(
                "/nearby/me",
                {
                    ...(await this.getAuthHeader()),
                    params: {
                        userId: userId,
                    },
                }
            );

            return res.data;
        } catch (error) {
            throw error;
        }
    }

    // GET NEARBY USERS
    async getNearbyUsers(userId) {
        try {
            const res = await this.api.get(
                "/nearby/users",
                {
                    ...(await this.getAuthHeader()),
                    params: {
                        userId: userId,
                    },
                }
            );

            return res.data;
        } catch (error) {
            throw error;
        }
    }

    // UPDATE LOCATION + TOGGLE
    async updateNearby(nearby, userId) {
        try {
            const res = await this.api.put(
                "/nearby/",
                nearby,
                {
                    ...(await this.getAuthHeader()),
                    params: {
                        userId: userId,
                    },
                }
            );

            return res.data;
        } catch (error) {
            throw error;
        }
    }

    // UPDATE TOGGLE ONLY
    async updateNearbyStatus(location_enabled, userId) {
        try {
            const res = await this.api.patch(
                "/nearby/status",
                null,
                {
                    ...(await this.getAuthHeader()),
                    params: {
                        location_enabled: location_enabled,
                        userId: userId,
                    },
                }
            );

            return res.data;
        } catch (error) {
            throw error;
        }
    }

    // DELETE
    async deleteNearby(userId) {
        try {
            const res = await this.api.delete(
                "/nearby/",
                {
                    ...(await this.getAuthHeader()),
                    params: {
                        userId: userId,
                    },
                }
            );

            return res.data;
        } catch (error) {
            throw error;
        }
    }
}

const nearby = new Nearby();

export default nearby;