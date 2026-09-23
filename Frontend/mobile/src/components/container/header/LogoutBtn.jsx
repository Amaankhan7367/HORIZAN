import React from 'react';
import {
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { useDispatch } from 'react-redux';
import authService from '../../../backend/auth';
import { logout } from '../../../store/authSlice';

function LogoutBtn() {
  const dispatch = useDispatch();

  const logoutHandler = async () => {
    try {
      await authService.logout();
      dispatch(logout());
      navigation.replace("Home");
    } catch (error) {
      console.log('Logout Error:', error);
    }
  };

  return (
    <TouchableOpacity
      style={styles.logoutButton}
      activeOpacity={0.7}
      onPress={logoutHandler}
    >
      <Ionicons
        name="log-out-outline"
        size={25}
        color="#ffffff"
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  logoutButton: {
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
});

export default LogoutBtn;