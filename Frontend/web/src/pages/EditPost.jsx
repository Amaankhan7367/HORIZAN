import React, { useEffect, useState } from 'react'
import dbService from '../backend/dbService'
import {PostForm,Container} from '../components/index'
import { useNavigate, useParams } from 'react-router-dom'


function EditPost() {
    const [post, setPost] =useState(null);
    const{postId}= useParams();
    const navigate = useNavigate();

    useEffect(()=>{
        dbService.getPost(postId).then((post)=>{
            if (post) {
                setPost(post)
            }
            else{
                navigate("/")
            }
        })
    },[postId,navigate])


  return post? (
    <div>
        <Container>
            <PostForm post={post} />
        </Container>
    </div>
  ) :null
}

export default EditPost
