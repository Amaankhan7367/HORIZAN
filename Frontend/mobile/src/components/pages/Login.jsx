import React from 'react';
import { View, StyleSheet } from 'react-native';

import { Login as LoginComponent } from '../index';

export default function Login({ navigation }) {
  return (
    <View style={styles.container}>
      <LoginComponent navigation={navigation} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#030712',
  },
});