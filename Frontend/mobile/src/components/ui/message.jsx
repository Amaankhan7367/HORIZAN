import React from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';

function MessageGroup({
  children,
  style,
}) {
  return (
    <View style={[styles.messageGroup, style]}>
      {children}
    </View>
  );
}

function Message({
  children,
  align = 'start',
  style,
}) {
  return (
    <View
      style={[
        styles.message,
        align === 'end'
          ? styles.messageEnd
          : styles.messageStart,
        style,
      ]}
    >
      {children}
    </View>
  );
}

function MessageAvatar({
  children,
  style,
}) {
  return (
    <View
      style={[
        styles.messageAvatar,
        style,
      ]}
    >
      {children}
    </View>
  );
}

function MessageContent({
  children,
  style,
}) {
  return (
    <View
      style={[
        styles.messageContent,
        style,
      ]}
    >
      {children}
    </View>
  );
}

function MessageHeader({
  children,
  style,
}) {
  return (
    <View
      style={[
        styles.messageHeader,
        style,
      ]}
    >
      {typeof children === 'string' ? (
        <Text style={styles.headerText}>
          {children}
        </Text>
      ) : (
        children
      )}
    </View>
  );
}

function MessageFooter({
  children,
  style,
  align = 'start',
}) {
  return (
    <View
      style={[
        styles.messageFooter,
        align === 'end' && styles.footerEnd,
        style,
      ]}
    >
      {typeof children === 'string' ? (
        <Text style={styles.footerText}>
          {children}
        </Text>
      ) : (
        children
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  messageGroup: {
    minWidth: 0,
    flexDirection: 'column',
    gap: 8,
  },

  message: {
    width: '100%',
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },

  messageStart: {
    flexDirection: 'row',
  },

  messageEnd: {
    flexDirection: 'row-reverse',
  },

  messageAvatar: {
    width: 32,
    height: 32,
    minWidth: 32,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-end',
    overflow: 'hidden',
    borderRadius: 16,
    backgroundColor: '#374151',
  },

  messageContent: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'column',
    gap: 10,
  },

  messageHeader: {
    maxWidth: '100%',
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
  },

  headerText: {
    color: '#9ca3af',
    fontSize: 12,
    fontWeight: '500',
  },

  messageFooter: {
    maxWidth: '100%',
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
  },

  footerEnd: {
    justifyContent: 'flex-end',
  },

  footerText: {
    color: '#9ca3af',
    fontSize: 12,
    fontWeight: '500',
  },
});

export {
  MessageGroup,
  Message,
  MessageAvatar,
  MessageContent,
  MessageFooter,
  MessageHeader,
};