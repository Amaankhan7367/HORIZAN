import axios from "axios";  
import {apiUrl} from "../conf/conf"

export class RoomService{
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
 
    async createRoom (name,latitude,longitude){ 
        try {
            const res = await this.api.post("/room/create", 
                { 
                    name, 
                latitude, 
                longitude 
            }, 
            this.getAuthHeader() 
            ) 
            return res.data; 
        } catch (error) {
            console.error("Error creating room:", error);
            throw error;
        }
    }; 
 
    async get_rooms(){ 
        try {
            const res = await this.api.get("/room/", 
                this.getAuthHeader() 
            ) 
            return res.data 
        } catch (error) {
            console.error("Error getting rooms:", error);
            throw error;
        }
    }; 
 
    async get_room_details(room_id){ 
        try {
            const res = await this.api.get(`/room/${room_id}`, 
                this.getAuthHeader() 
            ) 
            return res.data; 
        } catch (error) {
            console.error("Error getting room details:", error);
            throw error;
        }
    }; 
 
    async join_existing_room(room_id,latitude,longitude){ 
        try {
            const res = await this.api.post(`/room/${room_id}/join`, 
                { 
        roomId: room_id, 
        latitude, 
        longitude 
    }, 
                this.getAuthHeader() 
            ) 
            return res.data; 
        } catch (error) {
            console.error("Error joining room:", error);
            throw error;
        }
    }; 
 
    async get_members (room_id){ 
        try {
            const res =await this.api.get(`/room/${room_id}/members`, 
                this.getAuthHeader() 
            ) 
            return res.data; 
        } catch (error) {
            console.error("Error getting room members:", error);
            throw error;
        }
    } 
 
    async remove_room(room_id){ 
        try {
            const res =await this.api.delete(`/room/${room_id}`, 
                this.getAuthHeader() 
            ) 
            return res.data; 
        } catch (error) {
            console.error("Error removing room:", error);
            throw error;
        }
    }; 
 
 
} 
 
const roomService = new RoomService(); 
 
export default roomService; 
