import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBGn-daVD9p2TUnjiEaNTcT_Ec11lwBkbQ",
  authDomain: "swift-invoice-9124f.firebaseapp.com",
  databaseURL: "https://swift-invoice-9124f-default-rtdb.firebaseio.com",
  projectId: "swift-invoice-9124f",
  storageBucket: "swift-invoice-9124f.firebasestorage.app",
  messagingSenderId: "206350356892",
  appId: "1:206350356892:web:4be487199f9d17ef8f7859",
  measurementId: "G-NWJGDWMRW3"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, storage };
