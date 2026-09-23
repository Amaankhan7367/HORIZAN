import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
} from 'react-native';

import dbService from '../../backend/dbService';
import { useSelector } from 'react-redux';
import PostCard from '../PostCard';

function Home({ navigation }) {
  const status = useSelector((state) => state.auth.status);

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPosts = async () => {
      try {
        const response = await dbService.allPosts();

        if (response) {
          setPosts(
            Array.isArray(response.data)
              ? response.data
              : []
          );
        }
      } catch (error) {
        console.log('Home Posts Error:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPosts();
  }, []);

  // Not logged in
  if (!status) {
    return (
      <View style={styles.main}>
        <View style={styles.messageBox}>
          <Text style={styles.messageText}>
            Login To See Posts
          </Text>
        </View>
      </View>
    );
  }

  // Loading
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>
          Loading posts...
        </Text>
      </View>
    );
  }

  // No posts
  if (posts.length === 0) {
    return (
      <View style={styles.main}>
        <View style={styles.messageBox}>
          <Text style={styles.messageText}>
            Posts Unavailable
          </Text>
        </View>
      </View>
    );
  }

  // Posts
  return (
    <View style={styles.main}>
      <FlatList
        data={posts}
        keyExtractor={(item) =>
          item.postId.toString()
        }
        contentContainerStyle={styles.postList}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <View style={styles.cardWrapper}>
            <PostCard
              navigation={navigation}
              postId={item.postId}
              title={item.title}
              image={item.image}
              userId={item.userId}
            />
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  main: {
    flex: 1,
    backgroundColor: '#0f172a',
    padding: 20,
  },

  postList: {
    paddingTop: 10,
    paddingBottom: 30,
  },

  cardWrapper: {
    width: '100%',
    marginBottom: 20,
  },

  messageBox: {
    width: '100%',
    maxWidth: 600,
    alignSelf: 'center',
    marginTop: 100,
    padding: 30,

    backgroundColor: 'rgba(255,255,255,0.08)',

    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',

    borderRadius: 20,

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 20,

    elevation: 8,
  },

  messageText: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0f172a',
  },

  loadingText: {
    marginTop: 10,
    color: '#fff',
    fontSize: 15,
  },
});

export default Home;