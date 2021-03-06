import './login.css';
import { loginCall } from '../../apiCalls';
import {CircularProgress} from '@material-ui/core'
import React, { useRef } from 'react'
import { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';

export default function Login() {
  const email = useRef();
  const password = useRef();
  const { isFetching, dispatch } = useContext(AuthContext); 

  const handleClick = (e) => {
    e.preventDefault();
    loginCall({email:email.current.value, password:password.current.value}, dispatch)
  }

  return (
    <div className='login'>
      <div className="loginWrapper">
        <div className="loginLeft">
          <h3 className="loginLogo">ChatApp</h3>
          <span className="loginDesc">
            Connect with friends from around the world you on ChatApp
          </span>
        </div>
        <div className="loginRight">
          <form className="loginBox" onSubmit={handleClick}>
            <input 
              type="email" 
              placeholder="Email" 
              className="loginInput" 
              ref={email}
            />
            <input 
              type="password" 
              placeholder="Password" 
              className="loginInput" 
              ref={password} 
              required 
              minLength="6"
            />
            <button className="loginButton" type='submit' disabled={isFetching}>
              {isFetching ? <CircularProgress color='white' size="20px" /> : "Log In"}
            </button>
            <span className="loginForgot">Forgot Password?</span>
            <button className="loginRegister">
              {isFetching ? <CircularProgress color='white' size="20px"/> : "Create a New Account"}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
