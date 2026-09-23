import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

import service from '../backend/dbService';

function PostCard({
  postId,
  title,
  image,
  userId,
  navigation,
}) {
  return (
    <TouchableOpacity
      style={styles.postLink}
      activeOpacity={0.85}
      onPress={() => navigation.navigate('Post', { postId })}
    >
      <View style={styles.mainContainer}>

        {/* Post Image */}
        <View style={styles.imgBox}>
          <Image
            source={{
              uri: service.getFileUrl(image),
            }}
            style={styles.image}
            resizeMode="cover"
          />
        </View>

        {/* Title */}
        <Text style={styles.title} numberOfLines={2}>
          {title}
        </Text>

        {/* User */}
        <Text style={styles.userId}>
          user: {userId}
        </Text>

      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  postLink: {
    width: '100%',
  },

  mainContainer: {
    width: '100%',
    padding: 18,

    borderRadius: 20,

    backgroundColor: 'rgba(255,255,255,0.08)',

    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.4,
    shadowRadius: 16,

    elevation: 8,
  },

  imgBox: {
    width: '100%',
    height: 220,

    overflow: 'hidden',

    borderRadius: 15,
  },

  image: {
    width: '100%',
    height: '100%',
  },

  title: {
    marginTop: 15,

    color: '#fff',

    fontSize: 20,

    fontWeight: '600',
  },

  userId: {
    marginTop: 8,

    color: 'rgba(255,255,255,0.7)',

    fontSize: 14,
  },
});

export default PostCard;