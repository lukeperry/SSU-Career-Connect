import React, { useState, useEffect } from "react";
import { db } from "../firebase"; // Import Firestore
import { collection, query, where, onSnapshot, addDoc, Timestamp, orderBy } from "firebase/firestore"; // Import Firestore functions
import axios from "axios";
import '../css/Messages.css'; // Import CSS for styling

const Messages = () => {
  const [messages, setMessages] = useState([]);
  const [messageContent, setMessageContent] = useState("");
  const [users, setUsers] = useState([]); // Initialize as an empty array
  const [selectedUser, setSelectedUser] = useState(null); // State to store the selected user for conversation
  const [conversations, setConversations] = useState([]); // State to store users with conversations
  const [searchEmail, setSearchEmail] = useState(""); // State to store the search input

  const userId = localStorage.getItem("userId");
  const role = localStorage.getItem("role");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const hrResponse = await axios.get(`${process.env.REACT_APP_API_ADDRESS}/api/users/hr`);
        const talentResponse = await axios.get(`${process.env.REACT_APP_API_ADDRESS}/api/users/talent`);
  
        const hrUsers = Array.isArray(hrResponse.data) ? hrResponse.data : [];
        const talentUsers = Array.isArray(talentResponse.data) ? talentResponse.data : [];
  
        setUsers([...hrUsers, ...talentUsers]);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };
  
    fetchUsers();
  }, []);

  useEffect(() => {
    const fetchConversations = async () => {
      const q1 = query(
        collection(db, "messages"),
        where("senderId", "==", userId)
      );

      const q2 = query(
        collection(db, "messages"),
        where("receiverId", "==", userId)
      );

      const unsubscribe1 = onSnapshot(q1, (querySnapshot) => {
        const conversationsArray = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          if (!conversationsArray.includes(data.receiverId)) {
            conversationsArray.push(data.receiverId);
          }
        });

        const unsubscribe2 = onSnapshot(q2, (querySnapshot2) => {
          querySnapshot2.forEach((doc) => {
            const data = doc.data();
            if (!conversationsArray.includes(data.senderId)) {
              conversationsArray.push(data.senderId);
            }
          });
          setConversations(conversationsArray);
        }, (error) => {
          console.error("Error fetching conversations:", error);
        });

        return () => {
          unsubscribe1();
          unsubscribe2();
        };
      }, (error) => {
        console.error("Error fetching conversations:", error);
      });

      return () => unsubscribe1();
    };

    fetchConversations();
  }, [userId]);

  useEffect(() => {
    if (!selectedUser) return;
  
    const fetchMessages = async () => {
      const q = query(
        collection(db, "messages"),
        where("senderId", "in", [userId, selectedUser._id]),
        where("receiverId", "in", [userId, selectedUser._id]),
        orderBy("timestamp", "asc") // Order by timestamp in ascending order
      );
  
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const messagesArray = [];
        querySnapshot.forEach((doc) => {
          messagesArray.push(doc.data());
        });
        setMessages(messagesArray);
      }, (error) => {
        console.error("Error fetching messages:", error);
      });
  
      return () => unsubscribe();
    };

    fetchMessages();
  }, [userId, role, selectedUser]);

  const handleSendMessage = async () => {
    if (!selectedUser) {
      alert("Please select a user to send a message.");
      return;
    }

    try {
      await addDoc(collection(db, "messages"), {
        senderId: userId,
        receiverId: selectedUser._id,
        content: messageContent,
        timestamp: Timestamp.now()
      });
      setMessageContent("");
    } catch (error) {
      console.error("Error sending message:", error);
      alert("Failed to send message.");
    }
  };

  const filteredUsers = users.filter(user => 
    conversations.includes(user._id) && 
    (searchEmail === "" || user.email === searchEmail)
  );

  return (
    <div className="messages-container animated-gradient">
      <div className="sidebar">
        <h2>Conversations</h2>
        <input 
          type="text" 
          placeholder="Search by email" 
          value={searchEmail} 
          onChange={(e) => setSearchEmail(e.target.value)} 
          className="search-bar"
        />
        <ul>
          {filteredUsers.map((user) => (
            <li key={user._id} onClick={() => setSelectedUser(user)} className={selectedUser && selectedUser._id === user._id ? "selected" : ""}>
              <div className="profile-picture-container">
                <img src={user.profilePicture} alt={`${user.firstName} ${user.lastName}`} className="profile-picture" />
              </div>
              <div className="user-info">
                <span className="full-name">{`${user.firstName} ${user.lastName}`}</span>
                <span className="email">{user.email}</span>
              </div>
            </li>
          ))}
        </ul>
      </div>
      <div className="conversation">
        {selectedUser ? (
          <>
            <div className="conversation-header">
              <div className="profile-picture-container-2">
                <img src={selectedUser.profilePicture} alt={`${selectedUser.firstName} ${selectedUser.lastName}`} className="profile-picture" />
              </div>
              <div className="user-details">
                <h2>Conversation with {selectedUser.firstName} {selectedUser.lastName}</h2>
                <p className="email">{selectedUser.email}</p>
              </div>
            </div>
            <div className="messages">
              {messages.length > 0 ? (
                <ul>
                  {messages.map((message, index) => (
                    <li key={index} className={message.senderId === userId ? "sent" : "received"}>
                      <p>{message.content}</p>
                      <p><small>{new Date(message.timestamp.toDate()).toLocaleString()}</small></p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No messages found</p>
              )}
            </div>
            <div className="send-message">
              <textarea
                value={messageContent}
                onChange={(e) => setMessageContent(e.target.value)}
                placeholder="Type your message here..."
                rows="2"
                style={{ width: 'calc(100% - 60px)', marginRight: '10px' }}
              />
              <button onClick={handleSendMessage} className="btn btn-primary">Send</button>
            </div>
          </>
        ) : (
          <div className="no-conversation">
            <p>Select a user to start a conversation</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Messages;