import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { messaging } from './firebase'; // Import messaging

// Request permission to send notifications
const requestPermission = async () => {
  // Only request permission if messaging is supported
  if (!messaging) {
    console.log('Firebase Messaging is not supported in this browser. Push notifications will not be available.');
    return;
  }

  try {
    await Notification.requestPermission();
    if (Notification.permission === 'granted') {
      console.log('Notification permission granted.');
      // Get the token
      const token = await messaging.getToken();
      console.log('FCM Token:', token);
      // Send the token to your server to save it
    } else {
      console.log('Unable to get permission to notify.');
    }
  } catch (error) {
    console.error('Error getting permission for notifications:', error);
  }
};

requestPermission();

const root = createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
