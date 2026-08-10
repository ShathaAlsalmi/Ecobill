import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  type User as FirebaseUser
} from "firebase/auth";

// Your web app's Firebase configuration provided
const firebaseConfig = {
  apiKey: "AIzaSyAsOiR3USFIWrmzovQ05rDnMYB09BVgN34",
  authDomain: "ecobill-ec2d2.firebaseapp.com",
  projectId: "ecobill-ec2d2",
  storageBucket: "ecobill-ec2d2.firebasestorage.app",
  messagingSenderId: "514147628109",
  appId: "1:514147628109:web:8cc5328435eae47bc51804"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

export { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  type FirebaseUser 
};
