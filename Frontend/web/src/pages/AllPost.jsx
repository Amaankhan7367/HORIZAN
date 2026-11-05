import React, {useEffect,useState} from 'react'
import dbService from '../backend/dbService';
import PostCard from '../components/PostCard';
import Container from '../components/container/Container';
import { useNavigate } from "react-router-dom";
import "./AllPost.css"
function AllPost() {
    const [post,setPost] =useState([])
    const navigate = useNavigate();
 useEffect(() => {
    dbService.allPosts().then((response) => {
      if (response) {
        setPost(Array.isArray(response.data) ? response.data : []);
      }
    });
  }, []);


  return (
    <div>
     {/* ================= NAVBAR ================= */}

<div className="all-nav">

    <button
        className={`nav-tab ${
            location.pathname === "/all-posts" ? "active" : ""
        }`}
        onClick={() => navigate("/all-posts")}
    >
        All Post
    </button>

    <button
        className={`nav-tab ${
            location.pathname === "/recents" ? "active" : ""
        }`}
        onClick={() => navigate("/recents")}
    >
        Recents
    </button>

    <button
    className={`nav-tab ${
        location.pathname === "/nearby"
            ? "active"
            : ""
    }`}
    onClick={() => navigate("/nearby")}
>
    Nearby
</button> 

</div>
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
