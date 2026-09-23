import React from 'react';
import { View } from 'react-native';

export default function Container({ children }) {
  return (
    <View>
      {children}
    </View>
  );
}