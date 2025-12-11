import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { getFirestore, collection, addDoc, query, where, orderBy, limit, getDocs, deleteDoc, doc } from 'firebase/firestore';

// ------------------------------------------------------------------
// CONFIGURATION
// Replace these values with your actual Firebase Project keys.
// ------------------------------------------------------------------
const firebaseConfig = {
  apiKey: "AIzaSyD-PLACEHOLDER-KEY-HERE",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};

// Validation check to help developers
if (firebaseConfig.apiKey.includes("PLACEHOLDER")) {
  console.warn(
    "%c CRITICAL CONFIGURATION MISSING ",
    "background: #ff0000; color: #ffffff; font-size: 14px; font-weight: bold; padding: 4px;",
    "\nPlease update 'services/firebase.ts' with your actual Firebase project configuration values."
  );
}

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