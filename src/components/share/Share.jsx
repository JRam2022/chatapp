import "./share.css"
import {PermMedia, Label, Room, EmojiEmotions} from "@material-ui/icons"
import { AuthContext } from "../../context/AuthContext";
import { useContext, useRef, useState } from "react";
import axios from "axios";
import CancelIcon from '@mui/icons-material/Cancel';


export default function Share() {
  const PF = process.env.REACT_APP_PUBLIC_FOLDER;

  const {user} = useContext(AuthContext)
  const desc = useRef()
  const [file, setFile] = useState(null)

  const submitHandler = async (e) => {
    e.preventDefault()
    const newPost = {
      userId: user._id,
      desc: desc.current.value
    }
    
    if (file) {
      const data = new FormData();
      const fileName = Date.now() + file.name;
      data.append('name', fileName);
      data.append('file', file);
      newPost.img = fileName;

      try {
        await axios.post('/upload', data);
      }catch(err) {
        console.log(err);
      }
    }

    try {
      await axios.post('/posts', newPost)
      window.location.reload()
    } catch(err) {

    }
  }

  return (
    <div className="share">
      <div className="shareWrapper">
        <div className="shareTop">
          <img className="shareProfileImg" src={user.profilePicture ? PF+"profile/"+user.profilePicture : PF+"profile/noAvatar.png"} alt="" />
          <input placeholder={"What's on your mind ?"} className="shareInput" ref={desc}/>
        </div>
        <hr className="shareHr"/>
        {file && (
          <div className="shareImgContainer">
            <img className="shareImg" src={URL.createObjectURL(file)} alt="" />
            <div className="shareCancelImg" onClick={()=>setFile(null)}>
              <CancelIcon />
            </div>
          </div>
        )}
        <form className="shareBottom" onSubmit={submitHandler}>
          <div className="shareOptions">
            <label htmlFor="file" className="shareOption">
              <PermMedia htmlColor="tomato" className="shareIcon"/>
              <span className="shareOptionText">Upload</span>
              <input style={{display:"none"}} type="file" id="file" accept=".png, .jpg, .jpeg" onChange={(e) => setFile(e.target.files[0])} />
            </label>
            <div className="shareOption">
              <Label htmlColor="blue" className="shareIcon"/>
              <span className="shareOptionText">Tag</span>
            </div>
            <div className="shareOption">
              <Room htmlColor="tomato" className="shareIcon"/>
              <span className="shareOptionText">Location</span>
            </div>
            <div className="shareOption">
              <EmojiEmotions htmlColor="goldenrod" className="shareIcon"/>
              <span className="shareOptionText">Reactions</span>
            </div>
          </div>
          <button className="shareButton" type="submit">Share</button>
        </form>
      </div>
    </div>
  )
}
