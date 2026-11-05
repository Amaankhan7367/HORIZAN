import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  TouchableOpacity,
} from 'react-native';

import dbService from '../../backend/dbService';
import PostCard from '../PostCard';
import Container from '../container/Container';

function AllPost({ navigation, route }) {
  const [post, setPost] = useState([]);
  const [loading, setLoading] = useState(true);

  // Current active screen determination
  const currentRouteName = route?.name || 'AllPosts';

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
        <ActivityIndicator size="large" color="#E50914" />
        <Text style={styles.loadingText}>
          Loading posts...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* ================= NAVBAR ================= */}
      <View style={styles.navContainer}>
        <TouchableOpacity
          style={[
            styles.navTab,
            currentRouteName === 'AllPost' && styles.activeTab,
          ]}
          onPress={() => navigation.navigate('AllPost')}
        >
          <Text
            style={[
              styles.navTabText,
              currentRouteName === 'AllPost' && styles.activeTabText,
            ]}
          >
            All Post
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.navTab,
            currentRouteName === 'RecentMap' && styles.activeTab,
          ]}
          onPress={() => navigation.navigate('RecentMap')}
        >
          <Text
            style={[
              styles.navTabText,
              currentRouteName === 'RecentMap' && styles.activeTabText,
            ]}
          >
            Recents
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.navTab,
            currentRouteName === 'Nearby' && styles.activeTab,
          ]}
          onPress={() => navigation.navigate('Nearby')}
        >
          <Text
            style={[
              styles.navTabText,
              currentRouteName === 'Nearby' && styles.activeTabText,
            ]}
          >
            Nearby
          </Text>
        </TouchableOpacity>
      </View>

      {/* ================= CONTENT LIST ================= */}
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

  /* Navbar Styles */
  navContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    backgroundColor: '#030712',
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
  },

  navBar: {
  flexDirection: "row",
  backgroundColor: "#fff",
  padding: 5,
  borderRadius: 12,
  marginHorizontal: 15,
  marginVertical: 10,
  elevation: 3,
},

navTab: {
  flex: 1,
  alignItems: "center",
  justifyContent: "center",
  paddingVertical: 12,
  borderRadius: 10,
},

activeTab: {
  backgroundColor: "#6C63FF",
},

navTabText: {
  fontSize: 14,
  fontWeight: "600",
  color: "#555",
},

activeTabText: {
  color: "#fff",
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