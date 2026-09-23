import React, { useState, useEffect } from "react";
import dbService from "../backend/dbService";
import { useSelector } from "react-redux";
import PostCard from "../components/PostCard";
import './Home.css'

function Home() {
  const status = useSelector((state) => state.auth.status);
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    dbService.allPosts().then((response) => {
      if (response) {
        setPosts(Array.isArray(response.data) ? response.data : []);
      }
    });
  }, []);

  const displayContent = () => {
    if (!status) {
      return <h1 className="content-login">Login To See Posts</h1>;
    }

    if (posts.length === 0) {
      return <h1 className="content-unavailable">Posts Unavailable</h1>;
    }

    return (
      <div className="content-post">
        {posts.map((post) => (
          <PostCard
            key={post.postId}
            postId={post.postId}
            title={post.title}
            image={post.image}
            userId={post.userId}
          />
        ))}
      </div>
    );
  };

  return <div className="main">{displayContent()}</div>;
}

export default Home;