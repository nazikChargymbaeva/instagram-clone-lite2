// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAJjsHcVS1kWjpzwotgJqLqEbRptycnZEA",
  authDomain: "instagramclone-49ffb.firebaseapp.com",
  projectId: "instagramclone-49ffb",
  storageBucket: "instagramclone-49ffb.firebasestorage.app",
  messagingSenderId: "766558360730",
  appId: "1:766558360730:web:300f330f47ba143204bb23",
  measurementId: "G-Z8DF0CRT0F"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth(app)
export const db = getFirestore(app)