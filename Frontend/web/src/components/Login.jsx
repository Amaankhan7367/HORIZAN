import React, {useState} from 'react';
import {Input,Button} from './index.js';
import { useDispatch } from 'react-redux';
import { login as authLogin } from '../store/authSlice.js';
import { Link, useNavigate } from 'react-router-dom';
import {useForm} from 'react-hook-form';
import authService from '../backend/auth.js';
import './Login.css';


function Login() {

    const dispatch = useDispatch();
    const navigate = useNavigate();
   const {
  register,
  handleSubmit,
  formState: { errors }
} = useForm();
    const [error, setError] = useState("");

    const login= async (data) => {
        try {
            setError("")
             const session =await authService.login(data);
             if (session) {
              const userData =await authService.getCurrentUser()
              if (userData) dispatch(authLogin(userData));
              navigate("/")
             }
            } catch (error) {
    setError(error.response?.data?.detail);
}

    }

  return (
    <div className='login-outer'>
      <div className='login-inner'>
        <form onSubmit={handleSubmit(login)} className='form'>
          <div className='login-form'>

          <Input 
            label= "Username:"
            type='text'
            placeholder='Enter your Uername'
            className='login-username'
            {...register("username",{
              required : true,
            })}
          />

          <Input
          label ='Password:'
          type='password'
          placeholder='Enter your password'
          className='login-password'
          {...register("password",{
            required:true
          })}
          />

         <Button type='submit' className='login-btn'>Login</Button> 
          </div>
        </form>

        {error &&<p className='login-error'>{error}</p>}
        <p className='signup-msg'>Don't have an account ? </p>
        <Link to="/createAccount" className='signup-link'>Create Account</Link>
      </div>
      
    </div>
  )
}

export default Login
