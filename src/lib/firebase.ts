import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyDJdbrKdYgJDN01mrSwmcEFvZe1vSD0GLE",
  authDomain: "baranangsiang-evening-chur.firebaseapp.com",
  projectId: "baranangsiang-evening-chur",
  storageBucket: "baranangsiang-evening-chur.firebasestorage.app",
  messagingSenderId: "100937908314",
  appId: "1:100937908314:web:2e40cde32baf5537e6d863",
  measurementId: "G-SC5XWRE3BV",
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const db = getFirestore(app);
export const auth = getAuth(app);
export default app;
