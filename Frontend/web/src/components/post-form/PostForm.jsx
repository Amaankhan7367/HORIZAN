import React,{useState,useCallback,useEffect} from 'react';
import { replace, useNavigate } from 'react-router-dom';
import{Input, Button, Select} from '../index';
import { useForm } from 'react-hook-form';
import dbService from '../../backend/dbService';
import authSlice from '../../store/authSlice';
import { useSelector } from 'react-redux';
import { FiUploadCloud, FiImage } from "react-icons/fi";


export default function PostForm({post}) {

    const {register, handleSubmit, watch, setValue, getValues} =useForm({
        defaultValues:{
            title : post?.title || "",
            content : post?.content || "",
            // status : post?.status || "active"
        }
    })

    const userData = useSelector((state)=>state.auth.userData);
    const navigate = useNavigate()

    const [preview, setPreview] = useState(post?.image ? dbService.getFileUrl(post.image):null )

    // const slugTransform = useCallback((value)=>{
    //     if(value){
    //         return value
    //         .trim()
    //         .toLowerCase()
    //         .replace(/[^a-zA-Z\d]+/g, "-")
            
    //     }
    //     return "";
    // },[])

    useEffect(()=>{
        const subscription = watch((value ,{name}) =>{
        // if (name === "title") {
        //     setValue("slug", slugTransform(value.title), {shouldValidate: true})
        // }

        if(name === "image" && value.image[0]&&value.image.length >0){
            const file = value.image[0]
            setPreview(URL.createObjectURL(file))
        }
    });
        return () => subscription.unsubscribe();
    },[setValue,/*slugTransform*/,watch])

    const submit = async(data)=>{

        try {
            let fileId =  post?.image ||null;

        if (data.image && data.image[0]) {
            const file = await dbService.uploadFile(data.image[0]);
            if (file) {
                fileId = file.data.filename;
    }
        }
        if (post && post?.image &&data.image?.[0] ) {
            await dbService.deleteFile(post.image)
        }

        const postData ={
            ...data,
            image:fileId,
            userId : userData.id
        }
console.log("Post Data:", postData);
        let dbPost;
        if (post) {
             console.log("UPDATING POST:", post.postId);
            dbPost = await dbService.updatePost(post.postId,postData)
        } else {
            dbPost = await dbService.createPost(postData)
        }
        
        if (dbPost) navigate(`/post/${dbPost.postId}`)
        } catch (error) {
            throw error
        }
    }


  return (
    <div className='form-outer'>
      <form onSubmit={handleSubmit(submit)} className='form-box'>
       <div className='form-inner'>

        <Input 
        label ="Title: "
        type='text'
        placeholder='Enter your title'
        className='form-title'
        {...register("title",{
            required : true
        })}
        />

        {/* <Input
        label ="Slug: "
        type="text"
        placeholder='slug'
        className='form-slug'
        {...register("slug",{
            required : true
        })}
        />  */}

        <Input
        label ="Content: "
        type ="text"
        placeholder='Enter your content'
        className='form-content'
        {...register("content",{
            required : true
        })}
        /> 

        <div className='image-section'>

        <div className='upload-box'style={{border: "2px solid rgba(59, 130, 246, 0.4)"}}>

            <label htmlFor="image-upload" className="upload-label">
                <FiUploadCloud className="upload-icon"/>
                <h3>Upload Image</h3>
                <p>Click to Choose Image</p>
            </label>

        <input
        //label ="Uplode Image: "
        id="image-upload"
        type = "file"
        style={{ display: "none" }}
        className='upload-input'
        {...register("image",{
            required: !post ? "Image is required" : false
        })}
        />
        </div>

        <div className='preview-box'>
            {preview?(
                 <img src={preview} alt='preview' className='img-prev'/>
            ) :(
                <>
                <FiImage className="preview-icon"/>
                <p>No Image Selected</p>
            </>
            )}
        </div>

        </div>
        {/* <Select 
        options ={["active","inactive"]}
        label="Status"
        className="dropdown"
        {...register("status",{
            required:true
        })}
        /> */}
        <Button type="submit" className="btn">
            {post? "Update" :"submit"}
        </Button>
       </div>
      </form>
    </div>
  )
}
