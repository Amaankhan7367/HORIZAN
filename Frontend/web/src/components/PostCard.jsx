import React ,{ useState } from 'react'
import service from '../backend/dbService';
import {Link} from 'react-router-dom';
import authService from '../backend/auth';


function PostCard({postId,title,image,userId}) {
   const [user, setUser] = useState(null);

  const getUser = async () => {
    const response = await authService.get_user_by_id(userId);
    setUser(response);
  };

  React.useEffect(() => {
    if (userId) getUser();
  }, [userId]);


  return (
    <Link to={`/post/${postId}`} className='post-link'>
        <div className='main-container'>
            <div className='img-box'>
                <img src={service.getFileUrl(image)} alt={title} />
            </div>
            <h2 className='title'>{title}</h2>
            <p className='user-id'>user:{user?.username || userId}</p>
        </div>
    </Link>
  )
}

export default PostCard
