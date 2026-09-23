
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';

import * as ImagePicker from 'expo-image-picker';

import { Input, Button } from '../index.js';
import { useSelector } from 'react-redux';
import dbService from '../../backend/dbService';

export default function PostForm({ post, navigation }) {
  const userData = useSelector((state) => state.auth.userData);

  const [title, setTitle] = useState(post?.title || '');
  const [content, setContent] = useState(post?.content || '');
  const [selectedImage, setSelectedImage] = useState(null);

  const [preview, setPreview] = useState(
    post?.image ? dbService.getFileUrl(post.image) : null
  );

  const [loading, setLoading] = useState(false);

  // -------------------------
  // PICK IMAGE
  // -------------------------

  const pickImage = async () => {
    try {
      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          'Permission Required',
          'Please allow gallery permission to select an image.'
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
  mediaTypes: ['images'],
  allowsEditing: false,
  quality: 0.85,
});

      if (!result.canceled && result.assets?.length > 0) {
        const asset = result.assets[0];

        setSelectedImage({
          uri: asset.uri,
          name: asset.fileName || `post-${Date.now()}.jpg`,
          type: asset.mimeType || 'image/jpeg',
        });

        setPreview(asset.uri);
      }
    } catch (error) {
      console.log('Image Picker Error:', error);

      Alert.alert('Error', 'Unable to select image.');
    }
  };

  // -------------------------
  // SUBMIT
  // -------------------------

  const submit = async () => {
    try {
      if (!title.trim()) {
        Alert.alert('Required', 'Please enter a title.');
        return;
      }

      if (!content.trim()) {
        Alert.alert('Required', 'Please enter content.');
        return;
      }

      if (!post && !selectedImage) {
        Alert.alert('Required', 'Please select an image.');
        return;
      }

      if (!userData?.id) {
        Alert.alert(
          'Error',
          'User information not found. Please login again.'
        );
        return;
      }

      setLoading(true);

      let fileId = post?.image || null;

      // if (selectedImage) {
      //   const file = await dbService.uploadFile(selectedImage);

      //   if (file) {
      //     fileId = file.data?.filename;
      //   }
      // }
      if (selectedImage) {
  const file = await dbService.uploadFile(selectedImage);

  console.log('Uploaded File:', file);

  if (file) {
    fileId = file.filename || file.data?.filename;
  }
}

      if (post && post.image && selectedImage) {
        await dbService.deleteFile(post.image);
      }

      const postData = {
  title: title.trim(),
  content: content.trim(),
  image: fileId,
};

      console.log('Post Data:', postData);

      let dbPost;

      if (post) {
        dbPost = await dbService.updatePost(
          post.postId,
          postData
        );
      } else {
        dbPost = await dbService.createPost(postData);
      }

      if (dbPost) {
        navigation.navigate('Post', {
          postId: dbPost.postId,
        });
      }

} catch (error) {
  console.log('Post Submit Error:', error);
  console.log('Backend Error:', error.response?.data);

  const detail = error.response?.data?.detail;

  let errorMessage = 'Something went wrong.';

  if (typeof detail === 'string') {
    errorMessage = detail;
  } else if (Array.isArray(detail)) {
    errorMessage = detail
      .map((item) => {
        if (typeof item === 'string') {
          return item;
        }

        if (item?.msg) {
          return item.msg;
        }

        return JSON.stringify(item);
      })
      .join('\n');
  } else if (error.message) {
    errorMessage = String(error.message);
  }

  Alert.alert('Error', errorMessage);
} finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.keyboard}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >

        {/* HEADER */}

        <View style={styles.header}>
          <Text style={styles.heading}>
            {post ? 'Edit Post' : 'Create Post'}
          </Text>

          <Text style={styles.subHeading}>
            {post
              ? 'Update your post details'
              : 'Share something with the community'}
          </Text>
        </View>

        {/* GLASS CARD */}

        <View style={styles.formBox}>

          {/* TITLE */}

          <View style={styles.field}>
            <Text style={styles.label}>Title</Text>

            <Input
              placeholder="Give your post a title"
              value={title}
              onChangeText={setTitle}
              autoCapitalize="sentences"
              backgroundColor="rgba(255,255,255,0.055)"
              color="#ffffff"
              borderColor="rgba(255,255,255,0.10)"
            />
          </View>

          {/* CONTENT */}

          <View style={styles.field}>
            <Text style={styles.label}>Content</Text>

            <Input
              placeholder="Write something interesting..."
              value={content}
              onChangeText={setContent}
              multiline
              textAlignVertical="top"
              backgroundColor="rgba(255,255,255,0.055)"
              color="#ffffff"
              borderColor="rgba(255,255,255,0.10)"
              style={styles.contentInput}
            />
          </View>

          {/* IMAGE */}

          <View style={styles.field}>
            <Text style={styles.label}>Cover Image</Text>

            <TouchableOpacity
              style={styles.uploadBox}
              activeOpacity={0.75}
              onPress={pickImage}
            >
              {preview ? (
                <>
                  <Image
                    source={{ uri: preview }}
                    style={styles.previewImage}
                    resizeMode="cover"
                  />

                  <View style={styles.imageOverlay}>
                    <View style={styles.changeButton}>
                      <Text style={styles.changeButtonText}>
                        Change Image
                      </Text>
                    </View>
                  </View>
                </>
              ) : (
                <>
                  <View style={styles.uploadIconCircle}>
                    <Text style={styles.uploadIcon}>＋</Text>
                  </View>

                  <Text style={styles.uploadTitle}>
                    Add an image
                  </Text>

                  <Text style={styles.uploadText}>
                    Tap here to choose from your gallery
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* SUBMIT */}

          <TouchableOpacity
            style={[
              styles.submitButton,
              loading && styles.submitDisabled,
            ]}
            activeOpacity={0.8}
            onPress={submit}
            disabled={loading}
          >
            <Text style={styles.submitText}>
              {loading
                ? 'Publishing...'
                : post
                ? 'Update Post'
                : 'Publish Post'}
            </Text>

            {!loading && (
              <Text style={styles.submitArrow}>→</Text>
            )}
          </TouchableOpacity>

        </View>

        <Text style={styles.footerText}>
          Make it interesting. Make it yours.
        </Text>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// -------------------------
// PREMIUM GLASS STYLES
// -------------------------

const styles = StyleSheet.create({
  keyboard: {
    flex: 1,
  },

  container: {
    flex: 1,
    backgroundColor: '#030712',
  },

  contentContainer: {
    paddingHorizontal: 18,
    paddingTop: 30,
    paddingBottom: 110,
  },

  // HEADER

  header: {
    marginBottom: 22,
    paddingHorizontal: 4,
  },

  heading: {
    color: '#ffffff',
    fontSize: 30,
    fontWeight: '800',
    letterSpacing: -0.6,
  },

  subHeading: {
    color: '#64748b',
    fontSize: 14,
    marginTop: 7,
  },

  // GLASS CARD

  formBox: {
    width: '100%',
    padding: 18,
    borderRadius: 26,

    backgroundColor: 'rgba(255,255,255,0.055)',

    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',

    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 18,
    },
    shadowOpacity: 0.35,
    shadowRadius: 25,

    elevation: 12,
  },

  field: {
    marginBottom: 20,
  },

  label: {
    color: '#e2e8f0',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 8,
    letterSpacing: 0.3,
  },

  // CONTENT

  contentInput: {
    minHeight: 125,
    paddingTop: 14,
  },

  // IMAGE UPLOAD

  uploadBox: {
    width: '100%',
    height: 210,

    borderRadius: 20,

    overflow: 'hidden',

    backgroundColor: 'rgba(255,255,255,0.035)',

    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.09)',

    justifyContent: 'center',
    alignItems: 'center',
  },

  uploadIconCircle: {
    width: 58,
    height: 58,

    borderRadius: 29,

    backgroundColor: 'rgba(37,99,235,0.15)',

    borderWidth: 1,
    borderColor: 'rgba(96,165,250,0.25)',

    justifyContent: 'center',
    alignItems: 'center',

    marginBottom: 14,
  },

  uploadIcon: {
    color: '#60a5fa',
    fontSize: 30,
    fontWeight: '300',
  },

  uploadTitle: {
    color: '#f8fafc',
    fontSize: 17,
    fontWeight: '700',
  },

  uploadText: {
    color: '#64748b',
    fontSize: 12,
    marginTop: 7,
    textAlign: 'center',
  },

  // IMAGE PREVIEW

  previewImage: {
    width: '100%',
    height: '100%',
  },

  imageOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,

    padding: 14,

    backgroundColor: 'rgba(0,0,0,0.38)',

    alignItems: 'center',
  },

  changeButton: {
    paddingVertical: 9,
    paddingHorizontal: 17,

    borderRadius: 12,

    backgroundColor: 'rgba(15,23,42,0.85)',

    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },

  changeButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },

  // SUBMIT

  submitButton: {
    height: 58,
    borderRadius: 17,

    backgroundColor: '#2563eb',

    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',

    marginTop: 2,

    shadowColor: '#2563eb',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.28,
    shadowRadius: 15,

    elevation: 8,
  },

  submitDisabled: {
    opacity: 0.55,
  },

  submitText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.2,
  },

  submitArrow: {
    color: '#ffffff',
    fontSize: 22,
    marginLeft: 10,
    marginTop: -2,
  },

  footerText: {
    color: '#475569',
    textAlign: 'center',
    fontSize: 12,
    marginTop: 18,
  },
});

