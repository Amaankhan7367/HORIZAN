import React from 'react';
import LogoutBtn from './LogoutBtn'
import {useSelector} from 'react-redux';
//import {authSlice.reduser}from '../../store/authSlice';
import { useNavigate } from 'react-router-dom';
import Container from '../container/Container.jsx';
import './Header.css';



function Header() {
  const authStatus = useSelector((state)=>state.auth.status);
  const navigate = useNavigate();
  const navItems =[
    {
      name: "Home",
      slug: "/",
      active: true
    },
    {
      name: "Login",
      slug: "/login",
      active: !authStatus
    },
    {
      name: "CreateAccount",
      slug: "/createAccount",
      active: !authStatus
    },
    {
      name: "Explore",
      slug: "/all-posts",
      active: authStatus
    },
    {
      name: "AddPost",
      slug: "/add-post",
      active: authStatus
    },
    {
      name: "Inbox",
      slug: "/message",
      active: authStatus
    }

  ]
  return (
    <header className='header'>
      <Container>
        <nav className='nav'>
          <ul className='nav__list'>
            {navItems.map((item)=>
              item.active ? (
                <li key={item.name} className='nav__item'>
                <button onClick={()=>navigate(item.slug)} className='nav__btn'>
                  {item.name}
                </button>
              </li>
            ):null
          )}
          {authStatus &&(
            <li className='nav__item'>
              <LogoutBtn />
            </li>
          )}
        </ul>
      </nav>
      </Container>
    </header>
  )
}

export default Header
