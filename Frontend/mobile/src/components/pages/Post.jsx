import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';

import dbService from '../../backend/dbService.js';
import { useSelector } from 'react-redux';
import { Container, Button } from '../index.js';

function Post({ route, navigation }) {
  const userData = useSelector((state) => state.auth.userData);

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  const { postId } = route.params || {};

  const isAuthor =
    post && userData
      ? post.userID === userData.id
      : false;

  useEffect(() => {
    const loadPost = async () => {
      try {
        if (!postId) {
          navigation.navigate('Home');
          return;
        }

        const data = await dbService.getPost(postId);

        if (data) {
          setPost(data);
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

  const deletePost = () => {
    Alert.alert(
      'Delete Post',
      'Are you sure you want to delete this post?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setDeleting(true);

              const status = await dbService.deletePost(
                post.postId
              );

              if (status) {
                if (post.image) {
                  await dbService.deleteFile(post.image);
                }

                navigation.navigate('Home');
              }
            } catch (error) {
              console.log('Delete Post Error:', error);

              Alert.alert(
                'Error',
                'Unable to delete the post.'
              );
            } finally {
              setDeleting(false);
            }
          },
        },
      ]
    );
  };

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
    <View style={styles.page}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Container>
          <View style={styles.postContainer}>

            {/* Image */}
            <View style={styles.imageContainer}>
              <Image
                source={{
                  uri: dbService.getFileUrl(post.image),
                }}
                style={styles.postImage}
                resizeMode="cover"
              />
            </View>

            {/* Content */}
            <View style={styles.postContent}>

              <Text style={styles.postTitle}>
                {post.title}
              </Text>

              <Text style={styles.postAuthor}>
                User: {post.userID}
              </Text>

              <Text style={styles.postDescription}>
                {post.content}
              </Text>

              {/* Actions */}
              {isAuthor && (
                <View style={styles.postActions}>

                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={deletePost}
                    disabled={deleting}
                  >
                    <Text style={styles.buttonText}>
                      {deleting
                        ? 'Deleting...'
                        : 'Delete Post'}
                    </Text>
                  </TouchableOpacity>

                  <Button
                    style={styles.editButton}
                    onPress={() =>
                      navigation.navigate('EditPost', {
                        postId: post.postId,
                      })
                    }
                    disabled={deleting}
                  >
                    Edit Post
                  </Button>

                </View>
              )}

            </View>
          </View>
        </Container>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: '#0f172a',
  },

  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },

  postContainer: {
    width: '100%',
    maxWidth: 900,
    alignSelf: 'center',

    backgroundColor: 'rgba(255,255,255,0.08)',

    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',

    borderRadius: 24,

    overflow: 'hidden',

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.35,
    shadowRadius: 20,

    elevation: 10,
  },

  imageContainer: {
    width: '100%',
    height: 450,
    overflow: 'hidden',
  },

  postImage: {
    width: '100%',
    height: '100%',
  },

  postContent: {
    padding: 30,
  },

  postTitle: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 10,
  },

  postAuthor: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: 14,
    marginBottom: 25,
  },

  postDescription: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 16,
    lineHeight: 28,
  },

  postActions: {
    marginTop: 30,
    flexDirection: 'row',
    gap: 15,
    flexWrap: 'wrap',
  },

  editButton: {
    minHeight: 50,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: 'rgba(59,130,246,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  deleteButton: {
    minHeight: 50,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: 'rgba(239,68,68,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  buttonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
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

export default Post;