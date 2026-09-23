import axios from "axios"
import {apiUrl} from "../conf/conf"

export class Service{



    constructor(){
        this.api =axios.create({
            //baseURL: "http://127.0.0.1:8000",
            baseURL:apiUrl,
            headers: {
                "Content-Type": "application/json",
            },
        })
    }



// async createPost({title, content, image, userId}){
//     try {
//         const token = localStorage.getItem("token");
//         return await this.api.post("/post/",
//             {
//                 title,
//                 content,
//                 image,
//                 status,
//                 userId,
//             },
//             {
//                 headers: {
//                     Authorization: `Bearer ${token}`
//                 }
//             }
//         )
//     } catch (error) {
//         throw error;
//     }
// }

async createPost(post) {
    try {
        const token = localStorage.getItem("token");

        const response = await this.api.post(
            "/post/",
            post,
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
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

async updatePost(postId,{title, content, image,userId}){
    try {
         console.log("🔥 PUT URL:", `/post/${postId}`);
        return await this.api.put(`/post/${postId}`,
            {
                title,
                content,
                image,
                userId,
            }
        )
         console.log("UPDATE RESPONSE:", response.data);
    } catch (error) {
        throw error;
    }
}

async deletePost(postId){
     try {
         console.log("🔥 DELETE REQUEST:", postId);
        return await this.api.delete(`/post/${postId}`);
        return true;
    }
    catch(error){
        throw error;
        return false
    }
}

async getPost(postId){
        try {
        const response = await this.api.get(`/post/${postId}`);
        return response.data;
    }
    catch(error){
        throw error.response?.data?.detail;
        return false
    }
}

async allPosts(){
    try {
        return await this.api.get("/post/")
    } catch (error) {
        throw error;
    }
}

//files 
async uploadFile(file){
    try {
        const formData = new FormData();
        formData.append("file", file);

        return await this.api.post(
            "/post/uploads",
            formData,
             {
                headers: {
                    "Content-Type": "multipart/form-data"
                }
            }
        )
    } catch (error) {
        console.log("UPLOAD STATUS:", error.response?.status);
        console.log("UPLOAD DATA:", error.response?.data);
        console.log("UPLOAD ERROR:", error.message);
        throw error;
        return false
    }
}

async deleteFile(fileId){
    try {
        await this.api.delete(`/post/uploads/${fileId}`);
        return true;
    } catch (error) {
        throw error;
        return false
    }
}

getFileUrl(fileId) {
    return `${this.api.defaults.baseURL}/uploads/${fileId}`;
}
// async  getFilePrev(fileId){
//     try {
//         return await this.bucket.getFilePreview(
//             conf.appwriteBucketId,
//             fileId
//         )
//     } catch (error) {
//         throw error;
//     }
// }
}

const service = new Service();

export default service;