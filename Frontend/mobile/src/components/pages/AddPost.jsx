
import React from 'react';
import { View, StyleSheet } from 'react-native';

import PostForm from '../post-form/PostForm.jsx';

export default function AddPost({ navigation }) {
  return (
    <View style={styles.container}>
      <PostForm navigation={navigation} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#030712',
  },
});

