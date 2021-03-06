import {useState, useContext, useEffect, useRef} from 'react'
import "./messenger.css";
import Topbar from "../../components/topbar/Topbar"
import Conversation from '../../components/conversation/Conversation';
import Message from '../../components/message/Message';
import ChatOnline from '../../components/chatOnline/ChatOnline';
import axios from "axios";
import { AuthContext } from '../../context/AuthContext';
import { io } from 'socket.io-client';
import TextField from '@mui/material/TextField';


export default function Messenger() {
  const [conversations, setConversations] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [arrivalMessage, setArrivalMessage] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);

  const { user } = useContext(AuthContext);
  const scrollRef = useRef();
  const socket = useRef()

  useEffect(() => {
    socket.current = io("ws://localhost:8900")
    socket.current.on("connect_error", (err) => {
      console.log(`connect_error due to ${err.message}`);
    });
    socket.current.on("getMessage", data => {
      setArrivalMessage({
        sender: data.senderId,
        text: data.text,
        createdAt: Date.now()
      });
    });
  },[]);

  useEffect(()=> {
    arrivalMessage && currentChat?.members.includes(arrivalMessage.sender) &&
    setMessages(prev=> [...prev, arrivalMessage]);
  },[arrivalMessage, currentChat])
  
  useEffect(()=> {
    if (user) {
      socket.current.emit("addUser", user._id)
      socket.current.on("getUsers", users=>{
        setOnlineUsers(user.following.filter(f=>users.some(u=>u.userId === f)));
      })
    }
    
  },[user]);

  useEffect(() => {
    const getConversations = async () => {
      try {
        const res = await axios.get("/conversations/" + user._id);
        setConversations(res.data);
      } catch (err) {
        console.log(err);
      }
    };
    getConversations();
  }, [user._id]);

  useEffect(()=> {
    const getMessages = async () => {

      try {
        const res = await axios.get('/messages/' + currentChat?._id);
        setMessages(res.data);
        } catch(err) {
        console.log(err)
      }
    };
    getMessages()
  },[currentChat])

  const handleSubmit = async(e) => {
    e.preventDefault();
    const message = {
      sender: user._id,
      text: newMessage, 
      conversationId: currentChat._id
    }

    const receiverId = currentChat.members.find(member=> member !== user._id)
    
    socket.current.emit("sendMessage", {
      senderId: user._id,
      receiverId,
      text: newMessage
    })

    try {
      const res = await axios.post('/messages', message);
      setMessages([...messages, res.data])
      setNewMessage("");
    }catch(err) {
      console.log(err)
    }
  }

  useEffect(()=>{
    scrollRef.current?.scrollIntoView({behavior:"smooth"})
  },[messages])

  
  return (
    <>
      <Topbar />
      <div className="messenger">
        <div className="chatMenu">
          <div className="chatMenuWrapper">
            <input placeholder="Find or start a conversation" className="chatMenuInput" />
            {conversations.map((c, i) => (
              <div onClick={() => setCurrentChat(c)} key={i}>
                <Conversation conversation={c} currentUser={user} />
              </div>
            ))}
          </div>
        </div>
        <div className="chatBox">
          <div className="chatBoxWrapper">
            {currentChat ? (
              <>
                <div className="chatBoxTop">
                  {messages.map((m,i) => (
                    <div ref={scrollRef} key={i}>
                      <Message message={m} own={m.sender === user._id} currentUser={user}/>
                    </div>
                  ))}
                </div>
                <div className="chatBoxBottom">
                  <TextField 
                    id="standard-basic" 
                    variant="standard"
                    className="chatMessageInput"
                    placeholder="Direct message"
                    onChange={(e) => setNewMessage(e.target.value)}
                    value={newMessage}/>
                  <button className="chatSubmitButton" onClick={handleSubmit}>
                    Send
                  </button>
                </div>
              </>
            ) : (
              <span className="noConversationText">
                How to start a conversation<br/>
                <span className='convoText'>
                  <ol className="convoTable">
                  <li>Introduce yourself.</li>
                  <li>Pay a compliment.</li>
                  <li>Comment on something pleasant.</li>
                  <li>Offer help.</li>
                  <li>Ask for help.</li>
                  <li>Mention a shared experience.</li>
                  <li>Ask an opinion.</li>
                  </ol>
                </span>
              </span>
            )}
          </div>
        </div>
        <div className="chatOnline">
          <div className="chatOnlineWrapper">
            <ChatOnline
              onlineUsers={onlineUsers} 
              currentId={user._id} 
              setCurrentChat={setCurrentChat}
            />
          </div>
        </div>
      </div>
    </>
  );
}
