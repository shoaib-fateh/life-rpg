// src/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAz0ySSCuRePSzqeCf1Qu8SRdfKPOBEtJc",
  authDomain: "life-rpg-4b458.firebaseapp.com",
  projectId: "life-rpg-4b458",
  storageBucket: "life-rpg-4b458.firebasestorage.app",
  messagingSenderId: "697583369418",
  appId: "1:697583369418:web:f14fcf8434398827474833",
  measurementId: "G-WD4F6FD19N",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);