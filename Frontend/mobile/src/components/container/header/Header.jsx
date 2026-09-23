import React from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

import { useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

import LogoutBtn from './LogoutBtn';

function Header() {
  const navigation = useNavigation();

  const authStatus = useSelector(
    (state) => state.auth.status
  );

  const navItems = [
    {
      route: 'Home',
      icon: 'home-outline',
      active: true,
    },
    {
      route: 'Login',
      icon: 'log-in-outline',
      active: !authStatus,
    },
    {
      route: 'Signup',
      icon: 'person-add-outline',
      active: !authStatus,
    },
    {
      route: 'AllPost',
      icon: 'grid-outline',
      active: authStatus,
    },
    {
      route: 'AddPost',
      icon: 'add-circle-outline',
      active: authStatus,
    },
    {
      route: 'Inbox',
      icon: 'chatbubble-outline',
      active: authStatus,
    },
  ];

  return (
    <View style={styles.header}>
      <View style={styles.navList}>

        {navItems.map((item) =>
          item.active ? (
            <TouchableOpacity
              key={item.route}
              style={styles.navButton}
              activeOpacity={0.7}
              onPress={() => navigation.navigate(item.route)}
            >
              <Ionicons
                name={item.icon}
                size={25}
                color="#ffffff"
              />
            </TouchableOpacity>
          ) : null
        )}

        {authStatus && (
          <LogoutBtn />
        )}

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
  position: 'absolute',
  bottom: 0,
  left: 0,
  right: 0,

  height: 65,

  backgroundColor: '#0f1117',

  borderTopWidth: 1,
  borderTopColor: 'rgba(255,255,255,0.08)',

  zIndex: 999,
  elevation: 10,

  paddingBottom: 5,
},

  navList: {
    flex: 1,

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',

    paddingHorizontal: 8,
  },

  navButton: {
    width: 50,
    height: 50,

    alignItems: 'center',
    justifyContent: 'center',

    borderRadius: 25,
  },
});

export default Header;