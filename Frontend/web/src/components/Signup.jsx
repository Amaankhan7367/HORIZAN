import React,{useState} from 'react'
import authService from '../backend/auth'
import{useNavigate,Link} from 'react-router-dom'
import { useForm } from 'react-hook-form'
import {Input, Button} from './index.js'
import { login as authLogin } from '../store/authSlice.js'
import { useDispatch } from 'react-redux';
import './Signup.css'



function Signup() {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [error,setError] = useState(" ");
    const [suggestions, setSuggestions] = useState([]);
    const {register,handleSubmit} =useForm();

    const signup = async (data)=>{
        try {
            setError("");
            setSuggestions([]);
             const session =await authService.createAccount(data);
             if (session) {
                const userData =await authService.getCurrentUser()
                if(userData) dispatch(authLogin(userData))
                navigate("/")
             }
        } catch (error) {
            const detail = error.response?.data?.detail;

            if (detail?.message) {
                setError(detail.message);
                setSuggestions(detail.suggestions || []);
            } else {
                setError(error.message);
            }
        }
    }
  return (
    <div className='outerbox'>
      <div className='inner-box'>
        <form onSubmit={handleSubmit(signup)} className='form'>
            <div className='form-box'>

                <Input 
                label="Username:"
                type= 'text'
                placeholder='Enter your Username'
                className='username-input'
                {...register("username",{
                    required:true
                })}
                />

                        {/* suggestions for username  */}
                {suggestions.length > 0 && (
                    <div className="username-suggestions">
                        <p>Username already taken. Try:</p>

                        {suggestions.map((username) => (
                        <span
                                key={username}
                                onClick={() => setValue("username", username)}
                            >
                                {username}
                            </span>
                        ))}
                    </div>
                )}

                <Input 
                label="Name:"
                type= 'text'
                placeholder='Enter your name'
                className='name-input'
                {...register("name",{
                    required:true
                })}
                />

                <Input 
                label ="Email"
                type ="email"
                placeholder="Entr your email"
                className = "email-input"
                {...register("gmail",{
                    required: true,
                    validate: (value)=>/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[A-Za-z]{2,}$/.test(value)|| "Email address must be valid address "

                })}
                />
                <Input
                label ='Password:'
                type='password'
                placeholder='Enter your password'
                className='password-input'
                {...register(("password"),{
                    required:true
                })}
                />

                <Button type="submit" className="btn">Create Account</Button>
            </div>
        </form>
        {error&& <p className='error-msg'>{error}</p>}
        <p className='msg'>Already have an account </p>
        <Link to="/login" className='link'>Login</Link>
      </div>
    </div>
  )
}

export default Signup
