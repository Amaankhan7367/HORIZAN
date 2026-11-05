import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Alert,
} from 'react-native';

import authService from '../../backend/auth';
import conversationApi from '../../backend/conversation';
import messageService from '../../backend/message';

function Inbox({ navigation }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [conversationUsers, setConversationUsers] = useState({});

  const [username, setUsername] = useState('');
  const [searchUser, setSearchUser] = useState(null);

  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [startingChat, setStartingChat] = useState(false);

  const [error, setError] = useState('');

  // =========================
  // LOAD INBOX
  // =========================

  useEffect(() => {
    loadInbox();
  }, []);

  const loadInbox = async () => {
    try {
      setLoading(true);
      setError('');

      // Get logged-in user
      const user = await authService.getCurrentUser();

      if (!user) {
        setError('Please login again.');
        return;
      }

      setCurrentUser(user);

      // Get user's conversations
      // const data = await conversationApi.getConversations(user.id);

      // setConversations(data || []);
      const data = await conversationApi.getConversations(user.id);

// Get latest message of every conversation
const conversationsWithTime = await Promise.all(
  (data || []).map(async (conversation) => {
    try {
      const messages = await messageService.getMessages(
        conversation.id
      );

      const latestMessage = [...(messages || [])].sort(
        (a, b) =>
          new Date(b.createdAt || 0).getTime() -
          new Date(a.createdAt || 0).getTime()
      )[0];

      return {
        ...conversation,
        latestMessageTime: latestMessage?.createdAt || 0,
        latestMessage,
      };

    } catch (error) {
      console.error('Message fetch error:', error);

      return {
        ...conversation,
        latestMessageTime: 0,
        latestMessage: null,
      };
    }
  })
);

// Sort newest conversation first
const sortedConversations = conversationsWithTime.sort(
  (a, b) =>
    new Date(b.latestMessageTime || 0).getTime() -
    new Date(a.latestMessageTime || 0).getTime()
);

setConversations(sortedConversations);

      const usersData = {};

      for (const conversation of data || []) {
        // Find other user's UUID
        const otherUserId =
          String(conversation.user1_id) === String(user.id)
            ? conversation.user2_id
            : conversation.user1_id;

        // Get user details using UUID
        const otherUser = await authService.get_user_by_id(otherUserId);

        usersData[conversation.id] = otherUser;
      }

      setConversationUsers(usersData);
    } catch (error) {
      console.error('Inbox load error:', error);

      setError(
        error.response?.data?.detail || 'Failed to load conversations'
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // SEARCH USER
  // =========================

  const handleSearch = async () => {
    const value = username.trim();

    if (!value) {
      setSearchUser(null);
      setError('');
      return;
    }

    try {
      setSearching(true);
      setError('');
      setSearchUser(null);

      const foundUser = await authService.searchUser(value);

      setSearchUser(foundUser);
    } catch (error) {
      console.error('Search user error:', error);

      setError(
        error.response?.data?.detail || 'User not found'
      );
    } finally {
      setSearching(false);
    }
  };

  // =========================
  // START CONVERSATION
  // =========================

  const handleMessage = async () => {
    if (!currentUser || !searchUser) {
      return;
    }

    try {
      setStartingChat(true);
      setError('');

      const conversation = await conversationApi.new_conversation(
        currentUser.id,
        searchUser.id
      );

      console.log('Conversation:', conversation);

      navigation.navigate('Chat', {
  conversationId: conversation.id,
  username: searchUser.username,
  name: searchUser.name,
});
    } catch (error) {
      console.error('Start conversation error:', error);

      setError(
        error.response?.data?.detail || 'Could not start conversation'
      );
    } finally {
      setStartingChat(false);
    }
  };

  // =========================
  // OPEN EXISTING CHAT
  // =========================

  // const openConversation = (conversation) => {
  //   navigation.navigate('Chat', {
  //     conversationId: conversation.id,
  //   });
  // };
 
  const openConversation = (conversation) => {
  const otherUser = conversationUsers[conversation.id];

  navigation.navigate('Chat', {
    conversationId: conversation.id,
    username: otherUser?.username,
    name: otherUser?.name,
  });
};

  // =========================
  // CLEAR SEARCH
  // =========================

  const clearSearch = () => {
    setUsername('');
    setSearchUser(null);
    setError('');
  };

  // =========================
  // UI
  // =========================

  return (
    <View style={styles.page}>
      {/* ================= NAVIGATION TABS ================= */}
      <View style={styles.topNav}>
        <TouchableOpacity
          style={[styles.navTab, styles.activeNavTab]}
          activeOpacity={0.7}
        >
          <Text style={[styles.navTabText, styles.activeNavTabText]}>
            Message
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navTab}
          onPress={() => navigation.navigate('Room')}
          activeOpacity={0.7}
        >
          <Text style={styles.navTabText}>Room</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.container}>
          {/* ================= HEADER ================= */}

          <View style={styles.header}>
            <View style={styles.headerText}>
              <Text style={styles.headerTitle}>Messages</Text>

              <Text style={styles.headerSubtitle}>
                Search users and start a conversation
              </Text>
            </View>

            <View style={styles.countBox}>
              <Text style={styles.countText}>{conversations.length}</Text>
            </View>
          </View>

          {/* ================= SEARCH ================= */}

          <View style={styles.searchContainer}>
            <Text style={styles.searchIcon}>🔍</Text>

            <TextInput
              style={styles.searchInput}
              placeholder="Search username..."
              placeholderTextColor="rgba(255,255,255,0.35)"
              value={username}
              onChangeText={(value) => {
                setUsername(value);
                setError('');
              }}
              onSubmitEditing={handleSearch}
              returnKeyType="search"
              autoCapitalize="none"
            />

            {username.length > 0 && (
              <TouchableOpacity
                style={styles.clearButton}
                onPress={clearSearch}
              >
                <Text style={styles.clearText}>✕</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[
                styles.searchButton,
                (searching || !username.trim()) && styles.disabledButton,
              ]}
              onPress={handleSearch}
              disabled={searching || !username.trim()}
            >
              <Text style={styles.searchButtonText}>
                {searching ? 'Searching...' : 'Search'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* ================= ERROR ================= */}

          {error ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          {/* ================= SEARCH RESULT ================= */}

          {searchUser && (
            <View style={styles.searchResult}>
              <View style={styles.searchAvatar}>
                <Text style={styles.avatarText}>
                  {searchUser.name?.charAt(0)?.toUpperCase() || '👤'}
                </Text>
              </View>

              <View style={styles.searchUserInfo}>
                <Text style={styles.userName}>
                  {searchUser.name || searchUser.username}
                </Text>

                <Text style={styles.usernameText}>
                  @{searchUser.username}
                </Text>
              </View>

              <TouchableOpacity
                style={styles.messageButton}
                onPress={handleMessage}
                disabled={startingChat}
              >
                <Text style={styles.messageButtonText}>
                  {startingChat ? 'Opening...' : 'Message'}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* ================= CONVERSATIONS ================= */}

          <View style={styles.conversationSection}>
            <View style={styles.sectionTitle}>
              <Text style={styles.sectionTitleText}>
                Recent Conversations
              </Text>
            </View>

            {/* LOADING */}

            {loading && (
              <View style={styles.stateContainer}>
                <ActivityIndicator size="large" />

                <Text style={styles.stateText}>
                  Loading conversations...
                </Text>
              </View>
            )}

            {/* EMPTY */}

            {!loading && conversations.length === 0 && (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyIcon}>💬</Text>

                <Text style={styles.emptyTitle}>No conversations yet</Text>

                <Text style={styles.emptyText}>
                  Search a username to start chatting.
                </Text>
              </View>
            )}

            {/* CONVERSATIONS */}

            {!loading &&
              conversations.length > 0 &&
              conversations.map((conversation) => {
                const otherUser = conversationUsers[conversation.id];

                return (
                  <TouchableOpacity
                    key={conversation.id}
                    style={styles.conversationCard}
                    activeOpacity={0.75}
                    onPress={() => openConversation(conversation)}
                  >
                    {/* Avatar */}

                    <View style={styles.conversationAvatar}>
                      <Text style={styles.conversationAvatarText}>
                        {otherUser?.name?.charAt(0)?.toUpperCase() || '👤'}
                      </Text>
                    </View>

                    {/* Conversation info */}

                    <View style={styles.conversationContent}>
                      <Text style={styles.conversationName}>
                        {otherUser?.name || 'Loading...'}
                      </Text>

                      <Text style={styles.conversationUsername}>
                        @{otherUser?.username || 'Loading...'}
                      </Text>

                      <Text style={styles.tapText}>
                        Tap to open conversation
                      </Text>
                    </View>

                    {/* Unread Message Green Dot */}

{conversation.unread_count > 0 && (
  <View style={styles.unreadDot} />
)}

                    {/* Arrow */}

                    <Text style={styles.arrow}>›</Text>
                  </TouchableOpacity>
                );
              })}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: '#080b12',
  },

  // ================= TOP NAVIGATION TABS =================

  topNav: {
    flexDirection: 'row',
    alignSelf: 'center',
    width: '100%',
    maxWidth: 850,
    marginTop: 15,
    paddingHorizontal: 15,
    gap: 10,
  },

  navTab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },

  activeNavTab: {
    backgroundColor: 'rgba(110,90,255,0.85)',
    borderColor: 'rgba(110,90,255,0.9)',
  },

  navTabText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 14,
    fontWeight: '600',
  },

  activeNavTabText: {
    color: '#fff',
    fontWeight: '700',
  },

  // ================= LAYOUT =================

  scrollContent: {
    flexGrow: 1,
    padding: 15,
  },

  container: {
    width: '100%',
    maxWidth: 850,
    alignSelf: 'center',

    backgroundColor: 'rgba(18,22,32,0.88)',

    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',

    borderRadius: 22,

    overflow: 'hidden',

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 20,
    },
    shadowOpacity: 0.45,
    shadowRadius: 30,

    elevation: 10,
  },

  // ================= HEADER =================

  header: {
    padding: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',

    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.07)',
  },

  headerText: {
    flex: 1,
  },

  headerTitle: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '700',
  },

  headerSubtitle: {
    marginTop: 6,
    color: 'rgba(255,255,255,0.45)',
    fontSize: 14,
  },

  countBox: {
    minWidth: 40,
    height: 40,

    alignItems: 'center',
    justifyContent: 'center',

    borderRadius: 12,

    backgroundColor: 'rgba(255,255,255,0.06)',

    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },

  countText: {
    color: 'rgba(255,255,255,0.75)',
    fontWeight: '600',
  },

  // ================= SEARCH =================

  searchContainer: {
    margin: 20,

    flexDirection: 'row',
    alignItems: 'center',

    paddingLeft: 15,
    paddingRight: 10,

    minHeight: 55,

    backgroundColor: 'rgba(255,255,255,0.045)',

    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',

    borderRadius: 15,
  },

  searchIcon: {
    fontSize: 18,
    marginRight: 10,
  },

  searchInput: {
    flex: 1,

    color: '#fff',
    fontSize: 14,

    paddingVertical: 10,
  },

  clearButton: {
    padding: 8,
  },

  clearText: {
    color: 'rgba(255,255,255,0.45)',
    fontSize: 17,
  },

  searchButton: {
    paddingVertical: 11,
    paddingHorizontal: 16,

    borderRadius: 10,

    backgroundColor: 'rgba(110,90,255,0.85)',
  },

  searchButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },

  disabledButton: {
    opacity: 0.5,
  },

  // ================= ERROR =================

  errorBox: {
    marginHorizontal: 20,
    marginBottom: 15,

    padding: 13,

    borderRadius: 12,

    backgroundColor: 'rgba(255,70,70,0.08)',

    borderWidth: 1,
    borderColor: 'rgba(255,70,70,0.15)',
  },

  errorText: {
    color: 'rgba(255,130,130,0.9)',
    fontSize: 13,
  },

  // ================= SEARCH RESULT =================

  searchResult: {
    marginHorizontal: 20,
    marginBottom: 20,

    padding: 15,

    flexDirection: 'row',
    alignItems: 'center',

    gap: 12,

    backgroundColor: 'rgba(255,255,255,0.055)',

    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',

    borderRadius: 17,
  },

  searchAvatar: {
    width: 50,
    height: 50,

    borderRadius: 25,

    alignItems: 'center',
    justifyContent: 'center',

    backgroundColor: 'rgba(115,90,255,0.6)',
  },

  avatarText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
  },

  searchUserInfo: {
    flex: 1,
  },

  userName: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },

  usernameText: {
    marginTop: 5,
    color: 'rgba(255,255,255,0.4)',
    fontSize: 12,
  },

  messageButton: {
    paddingVertical: 10,
    paddingHorizontal: 14,

    borderRadius: 10,

    backgroundColor: 'rgba(110,90,255,0.85)',
  },

  messageButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },

  // ================= SECTION =================

  conversationSection: {
    paddingHorizontal: 15,
    paddingBottom: 20,
  },

  sectionTitle: {
    paddingHorizontal: 10,
    paddingBottom: 12,
  },

  sectionTitleText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 14,
    fontWeight: '600',
  },

  // ================= CONVERSATION =================

  conversationCard: {
    minHeight: 80,

    flexDirection: 'row',
    alignItems: 'center',

    padding: 15,
    marginBottom: 7,

    borderRadius: 16,

    backgroundColor: 'rgba(255,255,255,0.025)',

    borderWidth: 1,
    borderColor: 'transparent',
  },

  conversationAvatar: {
    width: 50,
    height: 50,

    borderRadius: 25,

    alignItems: 'center',
    justifyContent: 'center',

    backgroundColor: 'rgba(255,255,255,0.07)',

    marginRight: 14,
  },

  conversationAvatarText: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: 18,
    fontWeight: '700',
  },

  conversationContent: {
    flex: 1,
  },

  conversationName: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },

  conversationUsername: {
    marginTop: 5,
    color: 'rgba(255,255,255,0.35)',
    fontSize: 12,
  },

  tapText: {
    marginTop: 5,
    color: 'rgba(255,255,255,0.25)',
    fontSize: 11,
  },

  arrow: {
    color: 'rgba(255,255,255,0.3)',
    fontSize: 30,
    marginLeft: 8,
  },

  // ================= STATES =================

  stateContainer: {
    minHeight: 300,

    alignItems: 'center',
    justifyContent: 'center',
  },

  stateText: {
    marginTop: 12,
    color: 'rgba(255,255,255,0.4)',
    fontSize: 14,
  },

  emptyContainer: {
    minHeight: 300,

    alignItems: 'center',
    justifyContent: 'center',

    paddingHorizontal: 30,
  },

  emptyIcon: {
    fontSize: 52,
    marginBottom: 15,
  },

  emptyTitle: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 16,
    fontWeight: '600',
  },

  emptyText: {
    marginTop: 7,
    color: 'rgba(255,255,255,0.4)',
    fontSize: 13,
    textAlign: 'center',
  },
  unreadDot: {
  width: 9,
  height: 9,
  borderRadius: 5,
  backgroundColor: '#22c55e',
  marginHorizontal: 8,
},
});

export default Inbox;