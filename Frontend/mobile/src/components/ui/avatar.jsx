import React from 'react';
import {
  View,
  Image,
  Text,
  StyleSheet,
} from 'react-native';

function Avatar({
  size = 'default',
  children,
  style,
}) {
  const sizeStyle = getSizeStyle(size);

  return (
    <View
      style={[
        styles.avatar,
        sizeStyle,
        style,
      ]}
    >
      {children}
    </View>
  );
}

function AvatarImage({
  source,
  style,
}) {
  return (
    <Image
      source={source}
      style={[
        styles.avatarImage,
        style,
      ]}
      resizeMode="cover"
    />
  );
}

function AvatarFallback({
  children,
  style,
}) {
  return (
    <View
      style={[
        styles.avatarFallback,
        style,
      ]}
    >
      <Text style={styles.fallbackText}>
        {children}
      </Text>
    </View>
  );
}

function AvatarBadge({
  children,
  style,
}) {
  return (
    <View
      style={[
        styles.avatarBadge,
        style,
      ]}
    >
      {children}
    </View>
  );
}

function AvatarGroup({
  children,
  style,
}) {
  return (
    <View
      style={[
        styles.avatarGroup,
        style,
      ]}
    >
      {children}
    </View>
  );
}

function AvatarGroupCount({
  children,
  style,
}) {
  return (
    <View
      style={[
        styles.avatarGroupCount,
        style,
      ]}
    >
      <Text style={styles.groupCountText}>
        {children}
      </Text>
    </View>
  );
}

function getSizeStyle(size) {
  switch (size) {
    case 'sm':
      return {
        width: 24,
        height: 24,
        borderRadius: 12,
      };

    case 'lg':
      return {
        width: 40,
        height: 40,
        borderRadius: 20,
      };

    default:
      return {
        width: 32,
        height: 32,
        borderRadius: 16,
      };
  }
}

const styles = StyleSheet.create({
  avatar: {
    position: 'relative',
    flexShrink: 0,
    overflow: 'hidden',
    backgroundColor: '#374151',
  },

  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 999,
  },

  avatarFallback: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#374151',
    borderRadius: 999,
  },

  fallbackText: {
    color: '#d1d5db',
    fontSize: 14,
  },

  avatarBadge: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 10,
    height: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 5,
    backgroundColor: '#2563eb',
    borderWidth: 2,
    borderColor: '#121212',
  },

  avatarGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  avatarGroupCount: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#374151',
    borderWidth: 2,
    borderColor: '#121212',
  },

  groupCountText: {
    color: '#d1d5db',
    fontSize: 13,
  },
});

export {
  Avatar,
  AvatarImage,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
  AvatarBadge,
};