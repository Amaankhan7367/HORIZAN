import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  FlatList,
} from 'react-native';

import dbService from '../../backend/dbService';
import PostCard from '../PostCard';
import Container from '../container/Container';

function AllPost({ navigation }) {
  const [post, setPost] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPosts = async () => {
      try {
        const response = await dbService.allPosts();

        if (response) {
          setPost(
            Array.isArray(response.data)
              ? response.data
              : []
          );
        }
      } catch (error) {
        console.log('All Posts Error:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPosts();
  }, []);

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

  return (
    <View style={styles.container}>
      <Container>
        <FlatList
          data={post}
          keyExtractor={(item) => item.postId.toString()}
          contentContainerStyle={styles.list}
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
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                No posts available
              </Text>
            </View>
          }
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

  list: {
    padding: 20,
    paddingBottom: 40,
  },

  cardWrapper: {
    marginBottom: 20,
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

  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },

  emptyText: {
    color: '#94a3b8',
    fontSize: 16,
  },
});

export default AllPost;