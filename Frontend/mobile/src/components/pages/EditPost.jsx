import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';

import dbService from '../../backend/dbService.js';
import { PostForm, Container } from '../index.js';

function EditPost({ route, navigation }) {
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  const { postId } = route.params || {};

  useEffect(() => {
    const loadPost = async () => {
      try {
        if (!postId) {
          navigation.navigate('Home');
          return;
        }

        const response = await dbService.getPost(postId);

        if (response) {
          setPost(response);
        } else {
          navigation.navigate('Home');
        }
      } catch (error) {
        console.log('Get Post Error:', error);
        navigation.navigate('Home');
      } finally {
        setLoading(false);
      }
    };

    loadPost();
  }, [postId, navigation]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>
          Loading post...
        </Text>
      </View>
    );
  }

  if (!post) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Container>
        <PostForm
          post={post}
          navigation={navigation}
        />
      </Container>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#030712',
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#030712',
  },

  loadingText: {
    marginTop: 10,
    color: '#fff',
    fontSize: 15,
  },
});

export default EditPost;