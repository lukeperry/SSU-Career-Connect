import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { db, auth } from "../firebase";
import { 
  collection, 
  query, 
  where, 
  onSnapshot
} from "firebase/firestore";
import { signInWithCustomToken } from 'firebase/auth';
import axios from "axios";
import '../css/Messages.css';

const Messages = () => {
  const [messages, setMessages] = useState([]);
  const [messageContent, setMessageContent] = useState("");
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [searchEmail, setSearchEmail] = useState("");
  const [sidebarActive, setSidebarActive] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [darkMode, setDarkMode] = useState(false);

  const userId = localStorage.getItem("userId");
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);

  // ============================================================
  // OPTIMIZED: Single API call for Firebase auth + users
  // Replaces 3 sequential calls with 1 parallel request
  // ============================================================
  useEffect(() => {
    const initializeMessages = async () => {
      console.log('Initializing messages page...');
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('userId');
      const userRole = localStorage.getItem('role');
      
      if (!token || !userId) {
        console.log('No authentication found, redirecting to login...');
        const loginPath = userRole === 'hr' ? '/hr/login' : '/talent/login';
        navigate(loginPath);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        // Single API call gets: Firebase token + all users
        const response = await axios.get(
          `${process.env.REACT_APP_API_ADDRESS}/api/messages/init`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const { firebaseToken, users, currentUserId, currentUserRole, responseTime } = response.data;
        
        console.log(`✅ Messages initialized in ${responseTime}ms`);
        console.log(`✅ Loaded ${users.length} users`);

        // Sign in to Firebase with custom token
        await signInWithCustomToken(auth, firebaseToken);
        const firebaseUser = auth.currentUser;
        
        // Set state
        setCurrentUser({ 
          id: currentUserId, 
          role: currentUserRole, 
          firebaseUid: firebaseUser.uid 
        });
        setUsers(users);
        setLoading(false);

      } catch (error) {
        console.error('Error initializing messages:', error);
        
        // If JWT token expired (401), clear storage and redirect to login
        if (error.response?.status === 401) {
          console.log('JWT token expired, redirecting to login...');
          localStorage.clear();
          const loginPath = userRole === 'hr' ? '/hr/login' : '/talent/login';
          navigate(loginPath);
          return;
        }
        
        setError('Error loading messages. Please try again later.');
        setLoading(false);
      }
    };

    initializeMessages();
  }, [navigate]);

  // Effect for fetching conversations
  useEffect(() => {
    if (!currentUser) return;

    let unsubscribers = [];
    const userId = localStorage.getItem('userId');
    const allConversations = new Map();

    const handleMessages = (querySnapshot) => {
      const messagesToProcess = [];
      querySnapshot.forEach((doc) => {
        messagesToProcess.push({
          id: doc.id,
          ...doc.data()
        });
      });

      // Sort messages client-side by timestamp
      messagesToProcess.sort((a, b) => {
        const timeA = a.timestamp?.toMillis() || 0;
        const timeB = b.timestamp?.toMillis() || 0;
        return timeB - timeA;
      });

      // Process messages to get conversations
      messagesToProcess.forEach((message) => {
        const isSender = message.senderId === userId;
        const otherUserId = isSender ? message.receiverId : message.senderId;
        
        const existing = allConversations.get(otherUserId);
        if (!existing || (message.timestamp?.toMillis() || 0) > (existing.timestamp?.toMillis() || 0)) {
          allConversations.set(otherUserId, {
            id: message.id,
            ...message,
            lastMessage: message.content || '[No message content]',
            timestamp: message.timestamp
          });
        }
      });

      const sortedConversations = Array.from(allConversations.values())
        .sort((a, b) => (b.timestamp?.toMillis() || 0) - (a.timestamp?.toMillis() || 0));
      setConversations(sortedConversations);
    };

    try {
      // Query without orderBy to avoid needing composite index
      const sentQuery = query(
        collection(db, 'messages'),
        where('senderId', '==', userId)
      );

      const receivedQuery = query(
        collection(db, 'messages'),
        where('receiverId', '==', userId)
      );

      const unsubscribeSent = onSnapshot(sentQuery, handleMessages, error => {
        console.error("Error in sent messages listener:", error);
        console.error("Full error:", error);
        // Don't set error state for index errors, just log them
        if (!error.message.includes('index')) {
          setError("Failed to load conversations: " + error.message);
        }
      });

      const unsubscribeReceived = onSnapshot(receivedQuery, handleMessages, error => {
        console.error("Error in received messages listener:", error);
        console.error("Full error:", error);
        if (!error.message.includes('index')) {
          setError("Failed to load conversations: " + error.message);
        }
      });
      
      unsubscribers = [unsubscribeSent, unsubscribeReceived];
    } catch (error) {
      console.error('Error setting up conversation listeners:', error);
      setError('Failed to load conversations: ' + error.message);
    }

    return () => {
      unsubscribers.forEach(unsubscribe => {
        if (unsubscribe) {
          try {
            unsubscribe();
          } catch (e) {
            console.error("Error during cleanup:", e);
          }
        }
      });
    };
  }, [currentUser]);

  // Effect for fetching individual conversation messages
  useEffect(() => {
    if (!selectedUser?.id || !userId) return;

    let unsubscribers = [];
    let allMessages = new Map();

    try {
      // Query without orderBy to avoid needing composite index
      const sentQuery = query(
        collection(db, "messages"),
        where('senderId', '==', userId),
        where('receiverId', '==', selectedUser.id)
      );

      const receivedQuery = query(
        collection(db, "messages"),
        where('senderId', '==', selectedUser.id),
        where('receiverId', '==', userId)
      );

      const updateMessages = () => {
        // Sort messages client-side by timestamp
        const sortedMessages = Array.from(allMessages.values())
          .sort((a, b) => {
            const timeA = a.timestamp?.toMillis() || 0;
            const timeB = b.timestamp?.toMillis() || 0;
            return timeA - timeB;
          });
        setMessages(sortedMessages);
        scrollToBottom();
      };

      const unsubscribeSent = onSnapshot(sentQuery, (querySnapshot) => {
        querySnapshot.forEach((doc) => {
          allMessages.set(doc.id, {
            id: doc.id,
            ...doc.data(),
            isCurrentUser: true
          });
        });
        updateMessages();
      }, (error) => {
        console.error("Error in sent messages listener:", error);
        if (!error.message.includes('index')) {
          setError("Failed to load messages: " + error.message);
        }
      });

      const unsubscribeReceived = onSnapshot(receivedQuery, (querySnapshot) => {
        querySnapshot.forEach((doc) => {
          allMessages.set(doc.id, {
            id: doc.id,
            ...doc.data(),
            isCurrentUser: false
          });
        });
        updateMessages();
      }, (error) => {
        console.error("Error in received messages listener:", error);
        if (!error.message.includes('index')) {
          setError("Failed to load messages: " + error.message);
        }
      });

      unsubscribers = [unsubscribeSent, unsubscribeReceived];
    } catch (error) {
      console.error("Error setting up message listeners:", error);
      setError("Failed to set up message listener: " + error.message);
    }

    return () => {
      unsubscribers.forEach(unsubscribe => {
        if (unsubscribe) {
          try {
            unsubscribe();
          } catch (e) {
            console.error("Error during cleanup:", e);
          }
        }
      });
    };
  }, [userId, selectedUser]);

  // Auto-scroll to bottom when messages change or new message arrives
  useEffect(() => {
    // Use setTimeout to ensure DOM has updated before scrolling
    const timer = setTimeout(() => {
      scrollToBottom();
    }, 100);
    return () => clearTimeout(timer);
  }, [messages, selectedUser]);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      // Scroll the parent container (messages-list) to the bottom
      const messagesList = messagesEndRef.current.parentElement;
      if (messagesList) {
        messagesList.scrollTop = messagesList.scrollHeight;
      }
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!messageContent.trim() || !selectedUser) {
      return;
    }

    try {
      const senderId = userId;
      const receiverId = selectedUser.id || selectedUser._id;

      if (!receiverId) {
        console.error('Selected user has no ID:', selectedUser);
        setError('Failed to send message: Receiver ID not found');
        return;
      }

      // Use selectedUser directly since we already have the full user object
      const sender = users.find(user => user.id === senderId);
      
      // If sender not found in users array, use current user data from localStorage
      const senderName = sender 
        ? `${sender.firstName} ${sender.lastName}`
        : localStorage.getItem('userName') || 'Unknown User';
      
      const receiverName = `${selectedUser.firstName} ${selectedUser.lastName}`;

      console.log('Sending message:', { senderId, receiverId, senderName, receiverName });

  // const messageTimestamp = Timestamp.now(); // No longer needed

      // Send message via backend API
      const token = localStorage.getItem('token');
      const apiUrl = `${process.env.REACT_APP_API_ADDRESS}/api/messages`;
      const response = await axios.post(
        apiUrl,
        {
          receiverId,
          content: messageContent.trim()
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      if (response.data.success) {
        setMessageContent("");
        setTimeout(() => {
          scrollToBottom();
        }, 150);
      } else {
        setError("Failed to send message: Unknown error");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      setError("Failed to send message: " + error.message);
    }
  };

  const handleUserSelect = (user) => {
    setSelectedUser(user);
    setSidebarActive(false);
    setSearchEmail(""); // Clear search when a user is selected
  };

  const toggleSidebar = () => {
    setSidebarActive(!sidebarActive);
  };

  const handleViewProfile = (user) => {
    // Get the current logged-in user's role
    const currentUserRole = localStorage.getItem('role');
    
    // Determine target user's role based on available properties
    // HR users have companyName, Talent users don't
    const isTargetHR = user.companyName !== undefined && user.companyName !== null;
    const targetUserRole = isTargetHR ? 'hr' : 'talent';
    
    console.log('Viewing profile:', { currentUserRole, targetUserRole, userId: user.id });
    
    if (currentUserRole === 'hr') {
      if (targetUserRole === 'talent') {
        // HR viewing talent profile
        navigate(`/hr/talent-profile/${user.id}`);
      } else {
        // HR viewing another HR profile
        navigate(`/hr/profile/${user.id}`);
      }
    } else if (currentUserRole === 'talent') {
      if (targetUserRole === 'hr') {
        // Talent viewing HR profile
        navigate(`/talent/hr-profile/${user.id}`);
      } else {
        // Talent viewing another talent's profile
        navigate(`/talent/profile/${user.id}`);
      }
    }
  };

  const getInitials = (firstName, lastName) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
  };

  if (loading) {
    return <div className="loading">Loading messages...</div>;
  }

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  return (
    <div className={`messages-container ${darkMode ? 'dark-mode' : ''}`}>
      <div className={`sidebar ${sidebarActive ? 'active' : ''}`}>
        <div className="search-box">
          <input 
            type="text" 
            placeholder="Enter exact email to start conversation" 
            value={searchEmail} 
            onChange={(e) => setSearchEmail(e.target.value)} 
          />
        </div>
        <div className="users-list">
          {searchEmail.trim() ? (
            // ============================================================
            // SECURITY FIX: Only show users with EXACT email match
            // Prevents exposing all users in the system
            // ============================================================
            users
              .filter(user => 
                user.id !== userId && // Don't show current user
                user.email.toLowerCase() === searchEmail.toLowerCase().trim() // Exact match only
              )
              .length > 0 ? (
                (users || [])
                  .filter(user => 
                    user.id !== userId && 
                    user.email.toLowerCase() === searchEmail.toLowerCase().trim()
                  )
                  .map(user => {
                    // Check if this user has an existing conversation
                    const hasConversation = (conversations || []).some(conv => 
                      conv.senderId === user.id || conv.receiverId === user.id
                    );
                    return (
                      <div
                        key={user.id}
                        className={`user-item ${selectedUser?.id === user.id ? 'selected' : ''}`}
                        onClick={() => handleUserSelect(user)}
                      >
                        <div className="user-avatar">
                          {user.profilePicture ? (
                            <>
                              <img 
                                src={user.profilePicture} 
                                alt={`${user.firstName} ${user.lastName}`}
                                className="user-avatar-image"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                  e.target.nextSibling.style.display = 'flex';
                                }}
                              />
                              <div className="user-avatar-initials" style={{ display: 'none' }}>
                                {getInitials(user.firstName, user.lastName)}
                              </div>
                            </>
                          ) : (
                            <div className="user-avatar-initials">
                              {getInitials(user.firstName, user.lastName)}
                            </div>
                          )}
                        </div>
                        <div className="user-info">
                          <div className="user-name">
                            {user.firstName} {user.lastName}
                            {!hasConversation && <span className="new-conversation-badge"> (New)</span>}
                          </div>
                          <div className="user-email">{user.email}</div>
                        </div>
                      </div>
                    );
                  })
              ) : (
                // Show message when no exact match found
                <div className="no-results-message" style={{ 
                  padding: '20px', 
                  textAlign: 'center', 
                  color: '#666',
                  fontSize: '14px'
                }}>
                  <p>No user found with email: <strong>{searchEmail}</strong></p>
                  <p style={{ fontSize: '12px', marginTop: '10px' }}>
                    Please enter the exact email address
                  </p>
                </div>
              )
          ) : (
            // When not searching, show only existing conversations
            (conversations || [])
              .map(conv => {
                const otherUser = (users || []).find(u => 
                  u.id === (conv.senderId === userId ? conv.receiverId : conv.senderId)
                );
                if (!otherUser) return null;
                return {
                  conv,
                  otherUser
                };
              })
              .filter(item => item !== null)
              .map(({ conv, otherUser }) => (
                <div
                  key={conv.id}
                  className={`user-item ${selectedUser?.id === otherUser.id ? 'selected' : ''}`}
                  onClick={() => handleUserSelect(otherUser)}
                >
                  <div className="user-avatar">
                    {otherUser.profilePicture ? (
                      <>
                        <img 
                          src={otherUser.profilePicture} 
                          alt={`${otherUser.firstName} ${otherUser.lastName}`}
                          className="user-avatar-image"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                        <div className="user-avatar-initials" style={{ display: 'none' }}>
                          {getInitials(otherUser.firstName, otherUser.lastName)}
                        </div>
                      </>
                    ) : (
                      <div className="user-avatar-initials">
                        {getInitials(otherUser.firstName, otherUser.lastName)}
                      </div>
                    )}
                  </div>
                  <div className="user-info">
                    <div className="user-name">{otherUser.firstName} {otherUser.lastName}</div>
                    <div className="last-message">{conv.lastMessage}</div>
                    <div className="message-time">
                      {conv.timestamp?.toDate().toLocaleString('en-US', { 
                        month: 'short', 
                        day: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                </div>
              ))
          )}
        </div>
      </div>

      <div className="chat-area">
        <div className="chat-header">
          <button className="toggle-sidebar" onClick={toggleSidebar}>
            ☰
          </button>
          {selectedUser && (
            <div 
              className="selected-user clickable-user" 
              onClick={() => handleViewProfile(selectedUser)}
              title="Click to view profile"
            >
              <div className="user-avatar" style={{ width: '40px', height: '40px', fontSize: '16px', marginRight: '12px' }}>
                {selectedUser.profilePicture ? (
                  <>
                    <img 
                      src={selectedUser.profilePicture} 
                      alt={`${selectedUser.firstName} ${selectedUser.lastName}`}
                      className="user-avatar-image"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                    <div className="user-avatar-initials" style={{ display: 'none' }}>
                      {getInitials(selectedUser.firstName, selectedUser.lastName)}
                    </div>
                  </>
                ) : (
                  <div className="user-avatar-initials">
                    {getInitials(selectedUser.firstName, selectedUser.lastName)}
                  </div>
                )}
              </div>
              <span className="user-name-link">{selectedUser.firstName} {selectedUser.lastName}</span>
            </div>
          )}
          <button 
            className="dark-mode-toggle" 
            onClick={() => setDarkMode(!darkMode)}
            title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {darkMode ? '☀️' : '🌙'}
          </button>
        </div>

        <div className="messages-list">
          {selectedUser ? (
            messages.length > 0 ? (
              <>
                {(messages || []).map((message) => (
                  <div
                    key={message.id}
                    className={`message ${message.isCurrentUser ? 'sent' : 'received'}`}
                  >
                    <div className="message-content">{message.content}</div>
                    <div className="message-timestamp">
                      {message.timestamp?.toDate().toLocaleString()}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </>
            ) : (
              <div className="no-messages">No messages yet</div>
            )
          ) : (
            <div className="no-conversation">
              Select a conversation or search for a user to start messaging
            </div>
          )}
        </div>

        {selectedUser && (
          <form onSubmit={handleSendMessage} className="message-input">
            <input
              type="text"
              value={messageContent}
              onChange={(e) => setMessageContent(e.target.value)}
              placeholder="Type your message..."
            />
            <button type="submit" disabled={!messageContent.trim()}>
              {/* Arrow already styled in CSS via ::before */}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Messages;
