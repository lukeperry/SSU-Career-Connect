// src/pages/TalentMessages.js
import React, { useState, useEffect } from "react";
import { db } from "../firebase"; // Import Firestore
import { collection, query, where, onSnapshot } from "firebase/firestore"; // Import Firestore functions

const TalentMessages = () => {
  const [messages, setMessages] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchMessages = async () => {
      const userId = localStorage.getItem("userId"); // Assuming you store the user ID in localStorage
      const q = query(collection(db, "messages"), where("receiverId", "==", userId));

      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const messagesArray = [];
        querySnapshot.forEach((doc) => {
          messagesArray.push(doc.data());
        });
        setMessages(messagesArray);
      }, (error) => {
        console.error("Error fetching messages:", error);
        setError("Error fetching messages: " + error.message);
      });

      return () => unsubscribe();
    };

    fetchMessages();
  }, []);

  return (
    <div>
      <h1>Messages</h1>
      {messages.length > 0 ? (
        <ul>
          {messages.map((message, index) => (
            <li key={index}>
              <p><strong>From:</strong> {message.senderId}</p>
              <p>{message.content}</p>
              <p><small>{new Date(message.timestamp.toDate()).toLocaleString()}</small></p>
            </li>
          ))}
        </ul>
      ) : (
        <p>No messages found</p>
      )}
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
};

export default TalentMessages;
