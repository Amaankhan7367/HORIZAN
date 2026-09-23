import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import {Provider} from 'react-redux';
import store from './store/store.js';
import App from './App.jsx';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Signup from './pages/Signup.jsx';
import Home from './pages/Home.jsx';
import { AuthLayout, Login } from './components/index.js';
import AllPost from './pages/AllPost.jsx';
import AddPost from './pages/AddPost.jsx';
import EditPost from './pages/EditPost.jsx';
import Inbox from './pages/Inbox.jsx'
import Chat from './pages/Chat.jsx'
import Post from './pages/Post.jsx';
import Room from './pages/Room.jsx';
import RoomChat from "./pages/RoomChat";
import './index.css';



const router = createBrowserRouter([
  {
  path : '/',
  element : <App />,
  children: [
    {
    path : "/",
    element : <Home />
  },
  {
    path : "/login",
     element :(
      <AuthLayout authentication = {false}>
        <Login />
      </AuthLayout>
    )
  },
  {
    path : "/createAccount",
    element :  (
      <AuthLayout authentication = {false}>
        <Signup />
      </AuthLayout>
    )
  },
  {
    path : "/all-posts",
    element :(
      <AuthLayout authentication >
        <AllPost />
      </AuthLayout>
    )
  },
  {
    path : "/add-post",
    element :(
      <AuthLayout authentication >
        <AddPost />
      </AuthLayout>
    )
  },
  {
    path : "/edit-post/:postId",
    element :(
      <AuthLayout authentication  >
        <EditPost />
      </AuthLayout>
    )
  },
  {
    path : "/message",
    element :(
      <AuthLayout authentication  >
        <Inbox />
      </AuthLayout>
    )
  },
  {
  path: "/room",
  element: (
    <AuthLayout authentication>
      <Room />
    </AuthLayout>
  )
},

  {
    path: "/message/:conversationId",
    element: <Chat />
},
{
    path: "/room/:roomId",
    element: <RoomChat />
},
  {
    path : "/post/:postId",
    element :<Post />
    
  },
]
  }
])

createRoot(document.getElementById('root')).render(
  <StrictMode>
    
      <Provider store ={store}>
        <RouterProvider router={router} />
      </Provider>
   
  </StrictMode>,
)
