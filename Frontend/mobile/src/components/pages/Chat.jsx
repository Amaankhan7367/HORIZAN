import React, {
  useEffect,
  useRef,
  useState,
} from 'react';

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';

import authService from '../../backend/auth';
import messageService from '../../backend/message';

function Chat({ navigation, route }) {
  const { conversationId, username, name } = route.params;

  const [currentUser, setCurrentUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  const scrollViewRef = useRef(null);

  // =========================
  // LOAD CHAT
  // =========================

  useEffect(() => {
    loadChat();
  }, [conversationId]);

  const loadChat = async () => {
    try {
      setLoading(true);
      setError('');

      const user = await authService.getCurrentUser();

      if (!user) {
        setError('Please login again.');
        return;
      }

      setCurrentUser(user);

      // Mark received messages as seen
await messageService.markMessagesSeen(conversationId);

      const data =
        await messageService.getMessages(conversationId);

      setMessages(data || []);

    } catch (error) {
      console.error('Chat load error:', error);

      setError(
        error.response?.data?.detail ||
        'Failed to load messages'
      );

    } finally {
      setLoading(false);
    }
  };

  // =========================
  // AUTO SCROLL
  // =========================

  useEffect(() => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({
        animated: true,
      });
    }, 100);
  }, [messages]);

  // =========================
  // SEND MESSAGE
  // =========================

  const handleSend = async () => {
    const text = newMessage.trim();

    if (!text || sending) return;

    try {
      setSending(true);
      setError('');

      const messageData = {
        ciphertext: text,
        messageType: 'text',
      };

      const createdMessage =
        await messageService.createMessage(
          conversationId,
          messageData
        );

      setMessages((previousMessages) => [
        ...previousMessages,
        createdMessage,
      ]);

      setNewMessage('');

    } catch (error) {
      console.error('Send message error:', error);

      setError(
        error.response?.data?.detail ||
        'Failed to send message'
      );

    } finally {
      setSending(false);
    }
  };

  // =========================
  // FORMAT TIME
  // =========================

  const formatTime = (dateValue) => {
    if (!dateValue) return '';

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return '';
    }

    return date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // =========================
  // UI
  // =========================

  return (
    <KeyboardAvoidingView
      style={styles.page}
      behavior={
        Platform.OS === 'ios'
          ? 'padding'
          : undefined
      }
      keyboardVerticalOffset={Platform.OS === 'ios' ? 10 : 0}
    >

      {/* ================= HEADER ================= */}

      <View style={styles.header}>

        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.navigate('Inbox')}
          activeOpacity={0.7}
        >
          <Text style={styles.backIcon}>
            ‹
          </Text>
        </TouchableOpacity>

        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            👤
          </Text>
        </View>

        <View style={styles.userInfo}>
  <Text style={styles.headerTitle}>
    {name || username || 'User'}
  </Text>

  <Text style={styles.headerSubtitle}>
    @{username || ''}
  </Text>
</View>

      </View>

      {/* ================= ERROR ================= */}

      {error ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>
            {error}
          </Text>
        </View>
      ) : null}

      {/* ================= MESSAGES ================= */}

      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesArea}
        contentContainerStyle={styles.messagesContent}
        keyboardShouldPersistTaps="handled"
      >

        {loading && (
          <View style={styles.loadingBox}>
            <ActivityIndicator
              size="large"
              color="#536cff"
            />

            <Text style={styles.loadingText}>
              Loading messages...
            </Text>
          </View>
        )}

        {!loading && messages.length === 0 && (
          <View style={styles.emptyChat}>

            <Text style={styles.emptyIcon}>
              👤
            </Text>

            <Text style={styles.emptyTitle}>
              No messages yet
            </Text>

            <Text style={styles.emptyText}>
              Say hello and start the conversation.
            </Text>

          </View>
        )}

        {!loading &&
          messages.map((message) => {

            const isMine =
              String(message.senderId) ===
              String(currentUser?.id);

            return (
              <View
                key={message.messageId}
                style={[
                  styles.messageRow,
                  isMine
                    ? styles.messageMine
                    : styles.messageOther,
                ]}
              >

                <View
                  style={[
                    styles.messageBubble,
                    isMine
                      ? styles.myBubble
                      : styles.otherBubble,
                  ]}
                >

                  <Text
                    style={[
                      styles.messageText,
                      isMine
                        ? styles.myMessageText
                        : styles.otherMessageText,
                    ]}
                  >
                    {message.ciphertext}
                  </Text>

                  <Text
                    style={[
                      styles.messageTime,
                      isMine
                        ? styles.myMessageTime
                        : styles.otherMessageTime,
                    ]}
                  >
                    {formatTime(message.createdAt)}
                  </Text>

                </View>

              </View>
            );
          })}

      </ScrollView>

      {/* ================= INPUT ================= */}

      <View style={styles.inputArea}>

        <TextInput
          style={styles.input}
          placeholder="Write a message..."
          placeholderTextColor="#6b7280"
          value={newMessage}
          onChangeText={setNewMessage}
          editable={!sending}
          multiline
        />

        <TouchableOpacity
          style={[
            styles.sendButton,
            (!newMessage.trim() || sending) &&
              styles.sendButtonDisabled,
          ]}
          onPress={handleSend}
          disabled={
            sending ||
            !newMessage.trim()
          }
          activeOpacity={0.8}
        >
          <Text style={styles.sendIcon}>
            ➤
          </Text>
        </TouchableOpacity>

      </View>

    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: '#030712',
  },

  // ================= HEADER =================

  header: {
    minHeight: 70,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1f2937',
    backgroundColor: '#0b1120',
  },

  backButton: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },

  backIcon: {
    color: '#ffffff',
    fontSize: 38,
    lineHeight: 38,
    fontWeight: '300',
  },

  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1f2937',
  },

  avatarText: {
    fontSize: 20,
  },

  userInfo: {
    marginLeft: 12,
  },

  headerTitle: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '600',
  },

  headerSubtitle: {
    marginTop: 2,
    color: '#9ca3af',
    fontSize: 12,
  },

  // ================= ERROR =================

  errorBox: {
    marginHorizontal: 16,
    marginTop: 12,
    padding: 12,
    borderRadius: 10,
    backgroundColor: 'rgba(239,68,68,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.3)',
  },

  errorText: {
    color: '#f87171',
    fontSize: 13,
  },

  // ================= MESSAGES =================

  messagesArea: {
    flex: 1,
  },

  messagesContent: {
    padding: 16,
    paddingBottom: 20,
    flexGrow: 1,
  },

  loadingBox: {
    flex: 1,
    minHeight: 300,
    justifyContent: 'center',
    alignItems: 'center',
  },

  loadingText: {
    marginTop: 12,
    color: '#9ca3af',
    fontSize: 14,
  },

  emptyChat: {
    flex: 1,
    minHeight: 400,
    alignItems: 'center',
    justifyContent: 'center',
  },

  emptyIcon: {
    fontSize: 42,
    marginBottom: 14,
  },

  emptyTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },

  emptyText: {
    marginTop: 8,
    color: '#9ca3af',
    fontSize: 14,
    textAlign: 'center',
  },

  messageRow: {
    width: '100%',
    marginBottom: 10,
    flexDirection: 'row',
  },

  messageMine: {
    justifyContent: 'flex-end',
  },

  messageOther: {
    justifyContent: 'flex-start',
  },

  messageBubble: {
    maxWidth: '78%',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
  },

  myBubble: {
    backgroundColor: '#536cff',
    borderBottomRightRadius: 4,
  },

  otherBubble: {
    backgroundColor: '#1f2937',
    borderBottomLeftRadius: 4,
  },

  messageText: {
    fontSize: 15,
    lineHeight: 21,
  },

  myMessageText: {
    color: '#ffffff',
  },

  otherMessageText: {
    color: '#e5e7eb',
  },

  messageTime: {
    marginTop: 4,
    fontSize: 10,
    alignSelf: 'flex-end',
  },

  myMessageTime: {
    color: '#dbe4ff',
  },

  otherMessageTime: {
    color: '#9ca3af',
  },

  // ================= INPUT =================

  inputArea: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#1f2937',
    backgroundColor: '#0b1120',
  },

  input: {
    flex: 1,
    maxHeight: 100,
    minHeight: 46,
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 23,
    backgroundColor: '#111827',
    borderWidth: 1,
    borderColor: '#374151',
    color: '#ffffff',
    fontSize: 15,
  },

  sendButton: {
    width: 46,
    height: 46,
    marginLeft: 8,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#536cff',
  },

  sendButtonDisabled: {
    opacity: 0.45,
  },

  sendIcon: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '700',
  },
});

export default Chat;