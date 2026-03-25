import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDgZB9UnVxw52zBxniRm1CkFnMvgrctDQA",
  authDomain: "sandwich-pro.firebaseapp.com",
  projectId: "sandwich-pro",
  storageBucket: "sandwich-pro.firebasestorage.app",
  messagingSenderId: "1077936359572",
  appId: "1:1077936359572:web:704246893cb09cc14b4c81"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);