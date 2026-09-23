import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import authService from './backend/auth';
import {login,logout} from './store/authSlice';
import{Header,Footer}from './components/index.js'
import './App.css'
import { Outlet } from 'react-router-dom';

function App() {
  const [loading, setLoading ] = useState(true);
  const dispatch = useDispatch();

useEffect(() => {
    authService.getCurrentUser()
    .then((userData) => {
        

        if (userData) {
            dispatch(login(userData));
        } else {
            dispatch(logout());
        }
    })
    .catch((err) => {
        console.log(err);
        dispatch(logout());
    })
    .finally(() => {
        setLoading(false);
    });
}, [dispatch]);


  return !loading ?( 
    <div>
      <Header />
      <main>
      <Outlet />
      </main> 
      <Footer />
    
    </div>
    ):(
    <div className="loader">
      <div className="loader-circle"></div>
      <p className="loader-text">Loading...</p>
    </div>
  )
}

export default App
