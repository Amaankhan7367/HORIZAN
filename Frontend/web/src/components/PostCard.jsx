import React from 'react'
import service from '../backend/dbService';
import {Link} from 'react-router-dom';


function PostCard({postId,title,image,userId}) {

  return (
    <Link to={`/post/${postId}`} className='post-link'>
        <div className='main-container'>
            <div className='img-box'>
                <img src={service.getFileUrl(image)} alt={title} />
            </div>
            <h2 className='title'>{title}</h2>
            <p className='user-id'>user:{userId}</p>
        </div>
    </Link>
  )
}

export default PostCard
