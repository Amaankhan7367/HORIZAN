import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';

import { useDispatch } from 'react-redux';
import {
  NavigationContainer,
} from '@react-navigation/native';
import {
  createNativeStackNavigator,
} from '@react-navigation/native-stack';

import authService from './backend/auth';
import { login, logout } from './store/authSlice';

import Header from './components/container/header/Header.jsx';

import Home from './components/pages/Home.jsx';
import Login from './components/pages/Login.jsx';
import Signup from './components/pages/Signup.jsx';
import AllPost from './components/pages/AllPost.jsx';
import AddPost from './components/pages/AddPost.jsx';
import EditPost from './components/pages/EditPost.jsx';
import Post from './components/pages/Post.jsx';
import Inbox from './components/pages/Inbox.jsx';
import Chat from './components/pages/Chat.jsx';
import Room from './components/pages/room.jsx';
import RoomChat from './components/pages/roomchat.jsx';
import Nearby from './components/pages/Nearby.jsx';
import AddRecent from './components/pages/AddRecent.jsx';
import RecentMap from './components/pages/RecentMap.jsx';

const Stack = createNativeStackNavigator();

function AppContent() {
  return (
    <View style={styles.container}>

      {/* Main pages */}
      <View style={styles.main}>
        <Stack.Navigator
          initialRouteName="Home"
          screenOptions={{
            headerShown: false,
          }}
        >
          <Stack.Screen name="Home" component={Home} />
          <Stack.Screen name="Login" component={Login} />
          <Stack.Screen name="Signup" component={Signup} />
          <Stack.Screen name="AllPost" component={AllPost} />
          <Stack.Screen name="AddPost" component={AddPost} />
          <Stack.Screen name="EditPost" component={EditPost} />
          <Stack.Screen name="Post" component={Post} />
          <Stack.Screen name="Inbox" component={Inbox} />
          <Stack.Screen name="Chat" component={Chat} />
          <Stack.Screen name="Room" component={Room} />
          <Stack.Screen name="RoomChat" component={RoomChat} />
          <Stack.Screen name="AddRecent" component={AddRecent} />
          <Stack.Screen name="Nearby" component={Nearby} />
          <Stack.Screen name="RecentMap" component={RecentMap} />
        </Stack.Navigator>
      </View>

      {/* Bottom Navigation */}
      <Header />

    </View>
  );
}

function App() {
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();

  useEffect(() => {
    authService
      .getCurrentUser()
      .then((userData) => {
        if (userData) {
          dispatch(login(userData));
        } else {
          dispatch(logout());
        }
      })
      .catch((err) => {
        console.log('AUTH ERROR:', err);
        dispatch(logout());
      })
      .finally(() => {
        setLoading(false);
      });
  }, [dispatch]);

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#536cff" />
        <Text style={styles.loaderText}>
          Loading...
        </Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      <AppContent />
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#030712',
  },

  main: {
    flex: 1,
    paddingBottom: 65,
  },

  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#030712',
  },

  loaderText: {
    marginTop: 12,
    color: '#ffffff',
    fontSize: 16,
  },
});

export default App;