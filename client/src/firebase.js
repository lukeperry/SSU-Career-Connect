// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getMessaging } from 'firebase/messaging';

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
// to fix, need to move this to a .env file
const firebaseConfig = {
  apiKey: "AIzaSyDCjfQN3g-mMV6BjRRCJT_GdsEqcoxZa4I",
  authDomain: "ssu-career-connect.firebaseapp.com",
  projectId: "ssu-career-connect",
  storageBucket: "ssu-career-connect.firebasestorage.app",
  messagingSenderId: "754501363753",
  appId: "1:754501363753:web:41da421c34215e9e495438",
  measurementId: "G-4JXV63H96F"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const db = getFirestore(app);
const auth = getAuth(app);
const messaging = getMessaging(app);

export { db, auth, messaging };