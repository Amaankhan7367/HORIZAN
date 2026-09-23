import React from 'react';
import { View, StyleSheet } from 'react-native';

import { Signup as SignupComponent } from '../index';

export default function Signup({ navigation }) {
  return (
    <View style={styles.container}>
      <SignupComponent navigation={navigation} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#030712',
  },
});
