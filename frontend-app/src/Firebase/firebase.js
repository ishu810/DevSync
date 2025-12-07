// // importScripts("https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js");
// // importScripts("https://www.gstatic.com/firebasejs/10.7.0/firebase-messaging-compat.js");
import { initializeApp } from "firebase/app";
import { getMessaging } from "firebase/messaging";

console.log("API KEY:", import.meta.env.VITE_APIKEY);

const firebaseConfig = {
  
  // apiKey: import.meta.env.VITE_APIKEY,
  // authDomain: import.meta.env.VITE_AUTHDOMAIN,
  // projectId: import.meta.env.VITE_PROJECT_ID,
  // storageBucket: import.meta.env.VITE_STORAGE_BUCKET,
  // messagingSenderId: import.meta.env.VITE_MESSAGING_SENDER_ID,
  // appId: import.meta.env.VITE_APP_ID,
  // measurementId: import.meta.env.VITE_MEASUREMENT_ID,
  apiKey: "AIzaSyDgYq_SgOUXy_Na6-5JwXPuYv0EJKzIQeQ",
  authDomain: "devsync-7042c.firebaseapp.com",
  projectId: "devsync-7042c",
  storageBucket: "devsync-7042c.firebasestorage.app",
  messagingSenderId: "350245660506",
  appId: "1:350245660506:web:b9d271fcd53d3b3f64b563",
  measurementId: "G-J7T1TBWGP9"
};


const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

export { messaging };