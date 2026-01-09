// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBGn-daVD9p2TUnjiEaNTcT_Ec11lwBkbQ",
  authDomain: "swift-invoice-9124f.firebaseapp.com",
  projectId: "swift-invoice-9124f",
  storageBucket: "swift-invoice-9124f.appspot.com",
  messagingSenderId: "206350356892",
  appId: "1:206350356892:web:4be487199f9d17ef8f7859",
  measurementId: "G-NWJGDWMRW3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
const analytics = getAnalytics(app);

export { app, auth, db, storage, analytics };
