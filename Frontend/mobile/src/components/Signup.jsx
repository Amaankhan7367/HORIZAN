import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';

import authService from '../backend/auth';
import { Input, Button } from './index.js';
import { login as authLogin } from '../store/authSlice.js';
import { useDispatch } from 'react-redux';

function Signup({ navigation }) {
  const dispatch = useDispatch();

  const [username, setUsername] = useState('');
  const [name, setName] = useState('');
  const [gmail, setGmail] = useState('');
  const [password, setPassword] = useState('');

  const [error, setError] = useState('');
  const [suggestions, setSuggestions] = useState([]);

  const signup = async () => {
    try {
      setError('');
      setSuggestions([]);

      // Basic validation
      if (!username || !name || !gmail || !password) {
        setError('All fields are required');
        return;
      }

      // Email validation
      const emailRegex =
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[A-Za-z]{2,}$/;

      if (!emailRegex.test(gmail)) {
        setError('Email address must be valid');
        return;
      }

      const data = {
        username,
        name,
        gmail,
        password,
      };

      const session = await authService.createAccount(data);

      if (session) {
        const userData = await authService.getCurrentUser();

        if (userData) {
          dispatch(authLogin(userData));
        }
        navigation.replace("Home");
        // Navigation authentication state se handle hoga
      }
    } catch (error) {
      const detail = error.response?.data?.detail;

      if (detail?.message) {
        setError(detail.message);
        setSuggestions(detail.suggestions || []);
      } else {
        setError(
          error.message || 'Account creation failed. Please try again.'
        );
      }
    }
  };

  return (
    <View style={styles.outerbox}>
      <View style={styles.innerBox}>

        <View style={styles.formBox}>

          {/* Username */}
          <Input
            label="Username:"
            placeholder="Enter your Username"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
          />

          {/* Username Suggestions */}
          {suggestions.length > 0 && (
            <View style={styles.usernameSuggestions}>
              <Text style={styles.suggestionText}>
                Username already taken. Try:
              </Text>

              <View style={styles.suggestionList}>
                {suggestions.map((suggestion) => (
                  <TouchableOpacity
                    key={suggestion}
                    style={styles.suggestionButton}
                    onPress={() => {
                      setUsername(suggestion);
                      setSuggestions([]);
                      setError('');
                    }}
                  >
                    <Text style={styles.suggestionUsername}>
                      {suggestion}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Name */}
          <Input
            label="Name:"
            placeholder="Enter your name"
            value={name}
            onChangeText={setName}
          />

          {/* Email */}
          <Input
            label="Email:"
            placeholder="Enter your email"
            value={gmail}
            onChangeText={setGmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          {/* Password */}
          <Input
            label="Password:"
            placeholder="Enter your password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
          />

          {/* Signup Button */}
          <Button
            style={styles.button}
            onPress={signup}
          >
            Create Account
          </Button>

        </View>

        {/* Error */}
        {error ? (
          <Text style={styles.errorMessage}>
            {error}
          </Text>
        ) : null}

        {/* Login Message */}
        <Text style={styles.message}>
          Already have an account?
        </Text>

        <TouchableOpacity
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.link}>
            Login
          </Text>
        </TouchableOpacity>

      </View>
    </View>
  );
}

const styles = StyleSheet.create({

  outerbox: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#030712',
  },

  innerBox: {
    width: '100%',
    maxWidth: 470,
    alignSelf: 'center',

    padding: 30,

    borderRadius: 28,

    backgroundColor: 'rgba(255,255,255,0.06)',

    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 20,
    },
    shadowOpacity: 0.5,
    shadowRadius: 30,

    elevation: 10,
  },

  formBox: {
    gap: 22,
  },

  button: {
    width: '100%',
    minHeight: 60,

    borderRadius: 18,

    backgroundColor: '#2563eb',

    justifyContent: 'center',
    alignItems: 'center',

    shadowColor: '#2563eb',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.35,
    shadowRadius: 20,

    elevation: 8,
  },

  errorMessage: {
    marginTop: 15,

    textAlign: 'center',

    color: '#fb7185',

    fontSize: 14,
  },

  message: {
    marginTop: 22,

    textAlign: 'center',

    color: '#cbd5e1',

    fontSize: 14,
  },

  link: {
    marginTop: 8,

    textAlign: 'center',

    color: '#60a5fa',

    fontWeight: '600',

    fontSize: 15,
  },

  usernameSuggestions: {
    marginTop: -10,

    padding: 12,

    borderRadius: 12,

    backgroundColor: 'rgba(255,255,255,0.05)',

    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },

  suggestionText: {
    color: '#cbd5e1',

    fontSize: 13,

    marginBottom: 8,
  },

  suggestionList: {
    gap: 6,
  },

  suggestionButton: {
    paddingVertical: 8,
    paddingHorizontal: 10,

    borderRadius: 8,

    backgroundColor: 'rgba(96,165,250,0.10)',
  },

  suggestionUsername: {
    color: '#60a5fa',

    fontSize: 14,

    fontWeight: '600',
  },

});

export default Signup;