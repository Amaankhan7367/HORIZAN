import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';

import { Input, Button } from './index.js';
import { useDispatch } from 'react-redux';
import { login as authLogin } from '../store/authSlice.js';
import authService from '../backend/auth.js';

function Login({ navigation }) {
  const dispatch = useDispatch();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const login = async () => {
    try {
      setError('');

      if (!username || !password) {
        setError('Username and password are required');
        return;
      }

      const session = await authService.login({
        username,
        password,
      });

      // if (session) {
      //   const userData = await authService.getCurrentUser();

      //   if (userData) {
      //     dispatch(authLogin(userData));
      //   }
        
      //   // Navigation will be handled by authentication state
      // }
      if (session) {
  const userData = await authService.getCurrentUser();

  if (userData) {
    dispatch(authLogin(userData));

    navigation.replace("Home");
  }
}
    } catch (error) {
      setError(
        error.response?.data?.detail ||
        'Login failed. Please try again.'
      );
    }
  };

  return (
    <View style={styles.outer}>
      <View style={styles.inner}>

        <View style={styles.form}>

          <Input
            label="Username:"
            placeholder="Enter your Username"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
          />

          <Input
            label="Password:"
            placeholder="Enter your password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
          />

          <Button
            style={styles.loginButton}
            onPress={login}
          >
            Login
          </Button>

        </View>

        {error ? (
          <Text style={styles.error}>
            {error}
          </Text>
        ) : null}

        <Text style={styles.signupMessage}>
          Don't have an account?
        </Text>

        <TouchableOpacity
          onPress={() => navigation.navigate('Signup')}
        >
          <Text style={styles.signupLink}>
            Create Account
          </Text>
        </TouchableOpacity>

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#030712',
  },

  inner: {
    width: '100%',
    maxWidth: 450,
    alignSelf: 'center',
    padding: 30,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },

  form: {
    gap: 22,
  },

  loginButton: {
    width: '100%',
    minHeight: 60,
    borderRadius: 18,
    backgroundColor: '#2563eb',
    justifyContent: 'center',
    alignItems: 'center',
  },

  error: {
    marginTop: 15,
    textAlign: 'center',
    color: '#ef2341',
    fontSize: 14,
  },

  signupMessage: {
    marginTop: 25,
    textAlign: 'center',
    color: '#cbd5e1',
  },

  signupLink: {
    marginTop: 8,
    textAlign: 'center',
    color: '#60a5fa',
    fontWeight: '600',
  },
});

export default Login;
