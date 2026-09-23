import axios from "axios"
import {apiUrl} from "../conf/conf"

export class AuthService {

    constructor(){
        this.api =axios.create({
            //baseURL: "http://127.0.0.1:8000",
            baseURL:apiUrl,
            headers: {
                "Content-Type": "application/json",
            },
        })
    }

    // create account
    async createAccount({ username, name,gmail, password}){

        try{
        const  userAccount = await this.api.post( "/user/signup",
            {
                username,
                name,
                gmail,
                password
                }
            );
        
        if (userAccount) {
            // login method 
            return this.login({username, password});
        }
        else{
            return userAccount
        }

        }
        catch (error) {
             console.log("createAccount :: error", error);
             throw error;
        }
    }
    
    // login method 
     async login({username, password}){
       try {
            const res=  await this.api.post("/user/login",{username, password});
            if (res.data.access_token) {
                localStorage.setItem("token",res.data.access_token)
            }
            return res.data;

        } catch (error) {
        console.log("login :: error", error);
        throw error;
        }
    }

     //logout method 
    async logout(){
        try {
            localStorage.removeItem("token");
        } catch (error) {
            console.log("logout :: error", error);
            throw error;
        }
    }
    


     //current user
    async getCurrentUser(){
        try {
            const token = localStorage.getItem("token")
            if (!token) null;

            const res = await this.api.get("/user/me",{
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })
            return res.data;
        } catch (error) {
            console.log(" getCurrentUser :: error", error);
            throw error;
        }
     return null;
     }


     getAuthHeader() {
    const token = localStorage.getItem("token");

    return {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };
}


    async searchUser(username) {
        try {
            const response = await this.api.get(
                "/user/search",
                {
                    params: {
                        username,
                    },
                    ...this.getAuthHeader(),
                }
            );

            return response.data;

        } catch (error) {
            console.log("searchUser :: error", error);
            throw error;
        }
    }


    async get_user_by_id(user_id){
        try {
            const response =await this.api.get("/user/search-id",
                {
                    params: {
                        user_id,
                    },
                }
            );
            return response.data;

        } catch (error) {
            
        }
    }
}
 const authService = new AuthService();

 export default authService;