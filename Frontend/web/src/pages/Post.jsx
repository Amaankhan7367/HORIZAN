import React, { useEffect, useState } from 'react';
import authSlice from '../store/authSlice';
import dbService from '../backend/dbService';
import  {useSelector} from 'react-redux';
import {Link, useNavigate, useParams} from 'react-router-dom';
import {Container,Button} from '../components/index'
import './Post.css'

function Post() {
  const navigate = useNavigate();
  const userData = useSelector((status)=>status.auth.userData);
  const [post,setPost] = useState(null);
  const {postId} = useParams();
  const isAuther = post && userData ? post.userID === userData.id :false

  useEffect(()=>{

    if (postId) {
      
      dbService.getPost(postId).then((data)=>{
        if(data) setPost(data)
        else navigate('/')

      })
    }else{
      navigate("/")
    }
  },[postId,navigate])

  const deletePost = ()=>{
    dbService.deletePost(post.postId).then((status)=>{

      if(status){
        dbService.deleteFile(post.image)
        navigate("/")
      }
    })
  }
  return post? (
    <div className="post-page">
      <Container>
        <div className="post-container">

          <div className="post-image">
          <img
            src={dbService.getFileUrl(post.image)}
            alt={post.title}
          />
          </div>

          <div className="post-content">
            <h2 className="post-title">{post.title}</h2>

            <p className="post-author">
              User: {post.userID}
            </p>

            <p className="post-description">
              {post.content}
            </p>

            {isAuther && (
              <div className="post-actions">
                <button
                  className="delete-btn"
                  onClick={deletePost}
                >
                  Delete Post
                </button>

                <Link to={`/edit-post/${post.postId}`}>
                  <Button className="edit-btn">
                    Edit Post
                  </Button>
                </Link>
              </div>
            )}
          </div>

    </div>
  </Container>
</div>
  ):null
}

export default Post
