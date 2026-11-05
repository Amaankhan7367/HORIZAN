import axios from "axios"
import {apiUrl} from "../conf/conf"

export class Recents{
    constructor(){
        this.api =axios.create({
            baseURL:apiUrl,
            headers: {
                "Content-Type": "application/json",
            },
        })
    };

        getAuthHeader() {
        const token = localStorage.getItem("token");

        return {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        };
    }


    async addTextRecent(recent){
        try {
            const res = await this.api.post("/recent/text",
                recent,
                this.getAuthHeader()
            )

            return res.data
        } catch (error) {
            throw error;
        }
    }

    async addImageRecent(recent){
        try {
            const res = await this.api.post("/recent/photo",
                recent,
                this.getAuthHeader()
            )

            return res.data;

        } catch (error) {
            throw error
        }
    }

    async allRecent(){
        try {
                    const res = await this.api.get("/recent/all",
                        this.getAuthHeader()
                    )
                    return res.data;
        } catch (error) {
            throw error;
        }
    }
    async deleteRecent(recent_id){
        try {
            const res = await this.api.delete(`/recent/${recent_id}`,
                this.getAuthHeader()
            )
            return res.data;

        } catch (error) {
            throw error
        }
    }
}

const recent = new Recents();

export default recent