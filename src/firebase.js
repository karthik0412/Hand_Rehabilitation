import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyDglc2rlQIxyj2c9CfTujK-NXQFttaMzvo",
  authDomain: "handrehab-e2afd.firebaseapp.com",
  databaseURL: "https://handrehab-e2afd-default-rtdb.asia-southeast1.firebasedatabase.app/",
  projectId: "handrehab-e2afd",
  storageBucket: "handrehab-e2afd.firebasestorage.app",
  messagingSenderId: "337803807188",
  appId: "1:337803807188:web:3a875527d1e45189fcae41",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

export { database, ref, onValue };
