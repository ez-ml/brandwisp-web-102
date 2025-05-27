import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCZsDhKQ8zo4JIUP55a4w7WcL55G2-iciQ",
  authDomain: "brandwisp-dev.firebaseapp.com",
  databaseURL: "https://brandwisp-dev-default-rtdb.firebaseio.com",
  projectId: "brandwisp-dev",
  storageBucket: "brandwisp-dev.firebasestorage.app",
  messagingSenderId: "426241866355",
  appId: "1:426241866355:web:362162eaaf2f1ce7f60806",
  measurementId: "G-QRCC9XPFFH"
};


const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
