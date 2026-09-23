import React from 'react';
import { useDispatch } from 'react-redux';
import authService from '../../backend/auth'
import { logout } from '../../store/authSlice';
import './LogoutBtn.css';

function LogoutBtn() {

  const dispatch =useDispatch();

  const logoutHandler = () => {
      authService.logout().then(()=>{
        dispatch( logout() )
      })
  }
  return (
   <button className="logout-btn" onClick={logoutHandler}>
      Logout
    </button>
  )
}

export default LogoutBtn
