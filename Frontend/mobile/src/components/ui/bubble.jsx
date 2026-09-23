import React from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';

function BubbleGroup({
  children,
  style,
}) {
  return (
    <View style={[styles.bubbleGroup, style]}>
      {children}
    </View>
  );
}

function Bubble({
  children,
  variant = 'default',
  align = 'start',
  style,
}) {
  return (
    <View
      style={[
        styles.bubble,
        getVariantStyle(variant),
        align === 'end'
          ? styles.alignEnd
          : styles.alignStart,
        style,
      ]}
    >
      {children}
    </View>
  );
}

function BubbleContent({
  children,
  style,
}) {
  return (
    <View
      style={[
        styles.bubbleContent,
        style,
      ]}
    >
      {typeof children === 'string' ? (
        <Text style={styles.contentText}>
          {children}
        </Text>
      ) : (
        children
      )}
    </View>
  );
}

function BubbleReactions({
  children,
  side = 'bottom',
  align = 'end',
  style,
}) {
  return (
    <View
      style={[
        styles.reactions,
        side === 'top'
          ? styles.reactionsTop
          : styles.reactionsBottom,
        align === 'start'
          ? styles.reactionsStart
          : styles.reactionsEnd,
        style,
      ]}
    >
      {children}
    </View>
  );
}

function getVariantStyle(variant) {
  switch (variant) {
    case 'secondary':
      return {
        backgroundColor: '#374151',
      };

    case 'muted':
      return {
        backgroundColor: '#262626',
      };

    case 'tinted':
      return {
        backgroundColor: '#1e293b',
      };

    case 'outline':
      return {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: '#374151',
      };

    case 'ghost':
      return {
        backgroundColor: 'transparent',
        borderWidth: 0,
      };

    case 'destructive':
      return {
        backgroundColor: 'rgba(239,68,68,0.15)',
      };

    default:
      return {
        backgroundColor: '#536cff',
      };
  }
}

const styles = StyleSheet.create({
  bubbleGroup: {
    minWidth: 0,
    flexDirection: 'column',
    gap: 8,
  },

  bubble: {
    position: 'relative',
    width: 'auto',
    maxWidth: '80%',
    minWidth: 0,
    flexDirection: 'column',
    gap: 4,
    alignSelf: 'flex-start',
  },

  alignStart: {
    alignSelf: 'flex-start',
  },

  alignEnd: {
    alignSelf: 'flex-end',
  },

  bubbleContent: {
    maxWidth: '100%',
    minWidth: 0,
    overflow: 'hidden',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'transparent',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },

  contentText: {
    color: '#fff',
    fontSize: 14,
    lineHeight: 20,
  },

  reactions: {
    position: 'absolute',
    zIndex: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    borderRadius: 999,
    backgroundColor: '#374151',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderWidth: 2,
    borderColor: '#121212',
  },

  reactionsTop: {
    top: 0,
    transform: [{ translateY: -12 }],
  },

  reactionsBottom: {
    bottom: 0,
    transform: [{ translateY: 12 }],
  },

  reactionsStart: {
    left: 12,
  },

  reactionsEnd: {
    right: 12,
  },
});

export {
  BubbleGroup,
  Bubble,
  BubbleContent,
  BubbleReactions,
};