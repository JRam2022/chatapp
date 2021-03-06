import React, {useEffect, useState, useContext} from 'react'
import "./post.css"
import {MoreVert, ThumbUp } from "@material-ui/icons"
import axios from 'axios';
import { format } from 'timeago.js'
import { Link } from 'react-router-dom'
import { AuthContext } from '../../context/AuthContext';
import DeletePost from '../longMenu/LongMenu';


export default function Post({post}) {
  const [like, setLike] = useState(post.likes.length);
  const [isliked, setIsLiked] = useState(false);
  const [user, setUser] = useState({});
  const {user:currentUser} = useContext(AuthContext)

  const PF = process.env.REACT_APP_PUBLIC_FOLDER;

  useEffect(()=> {
    setIsLiked(post.likes.includes(currentUser._id));
  },[currentUser._id, post.likes]);
  
  useEffect(() => {
    const fetchUser = async() => {
      const res = await axios.get(`/users?userId=${post.userId}`)
      setUser(res.data);
    }
    fetchUser();
  },[post.userId]);
  
  const likeHandler = async() => {
    try {
       await axios.put('/posts/' + post._id + '/like', {userId:currentUser._id});
    } catch(err) {
      console.log(err);
    }
    setLike(isliked ? like-1 : like+1);
    setIsLiked(!isliked);
  }

  const statusStyle = (status) => {
    if (status) {
      return "#1872f2"
    } 
  };

  return (
    <div className="post">
      <div className="postWrapper">
        <div className="postTop">
          <div className="postTopLeft">
            <Link to={`profile/${user.username}`}>
            <img loading='lazy' className="postProfileImg" src={user.profilePicture ? PF + "profile/" + user.profilePicture : PF+"profile/noAvatar.png"} alt=""/>
            </Link>
            <span className="postUsername">{user.username}</span>
            <span className="postDate">{format(post.createdAt)}</span>
          </div>
          <div className="postTopRight">
            { (post.userId !== currentUser._id) ? <MoreVert/> : <DeletePost post={post}/>}
          </div>
        </div>
      </div>
      <div className="postCenter">
        <span className="postText">{post?.desc}</span>
        <img className="postImg" src={PF+post.img} alt="" />
      </div>
      <div className="postBottom">
        <div className="postBottomLeft">
          <div onClick={likeHandler}>
            <ThumbUp style={{fill: statusStyle(isliked), marginRight:"10px"}} />
          </div>
          <span className="postlikeCounter">{like} People Like it</span>
        </div>
        <div className="postBottomRight">
          <span className="postCommentText">{post.comment} Comments</span>
        </div>
      </div>
    </div>
  )
}
