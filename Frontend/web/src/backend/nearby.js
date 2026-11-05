import axios from "axios";
import { apiUrl } from "../conf/conf";

export class Nearby {
    constructor() {
        this.api = axios.create({
            baseURL: apiUrl,
            headers: {
                "Content-Type": "application/json",
            },
        });
    }

    getAuthHeader() {
        const token = localStorage.getItem("token");

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
                    ...this.getAuthHeader(),
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
                    ...this.getAuthHeader(),
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
                    ...this.getAuthHeader(),
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
                    ...this.getAuthHeader(),
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
                    ...this.getAuthHeader(),
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
                    ...this.getAuthHeader(),
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