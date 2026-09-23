import React, {useEffect,useState} from 'react'
import dbService from '../backend/dbService';
import PostCard from '../components/PostCard';
import Container from '../components/container/Container';

function AllPost() {
    const [post,setPost] =useState([])

 useEffect(() => {
    dbService.allPosts().then((response) => {
      if (response) {
        setPost(Array.isArray(response.data) ? response.data : []);
      }
    });
  }, []);
  return (
    <div>
      <Container>
        {post &&(
            post.map((post)=>(
               <PostCard
            key={post.postId}
            postId={post.postId}
            title={post.title}
            image={post.image}
            userId={post.userId}
          />
            ))
)}
      </Container>
    </div>
  )
}

export default AllPost
