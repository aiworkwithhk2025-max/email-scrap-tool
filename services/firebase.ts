import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { getFirestore, collection, addDoc, query, where, orderBy, limit, getDocs, deleteDoc, doc } from 'firebase/firestore';

// ------------------------------------------------------------------
// CONFIGURATION
// Replace these values with your actual Firebase Project keys.
// For a real app, use environment variables (process.env.REACT_APP_...)
// ------------------------------------------------------------------
const firebaseConfig = {
  apiKey: "AIzaSyD-PLACEHOLDER-KEY-HERE",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

export { 
  auth, 
  db, 
  googleProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged,
  collection,
  addDoc,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  deleteDoc,
  doc
};

export type { User };