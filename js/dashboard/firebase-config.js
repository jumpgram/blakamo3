import { initializeApp } from "https://www.gstatic.com/firebasejs/9.5.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.5.0/firebase-auth.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.5.0/firebase-analytics.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.5.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCDCcSG3EQIkid0Ec4kFpO5imirHnXEB8w",
  authDomain: "jumpgramalec.firebaseapp.com",
  projectId: "jumpgramalec",
  storageBucket: "jumpgramalec.appspot.com",
  messagingSenderId: "18580874593",
  appId: "1:18580874593:web:1974579e105e3ecf8e1120",
  measurementId: "G-ZFNBG8PDC8",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const analytics = getAnalytics(app);
