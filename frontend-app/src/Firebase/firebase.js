import { initializeApp } from "firebase/app";
import { getMessaging } from "firebase/messaging";
// importScripts("https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js");
// importScripts("https://www.gstatic.com/firebasejs/10.7.0/firebase-messaging-compat.js");

// import 'dotenv/config';
const firebaseConfig = {
  //   apiKey: "AIzaSyAEWnPNtu9gQt7C7FkkPRKGdIVgPm7adas",
  // authDomain: "caresphere-474703.firebaseapp.com",
  // projectId: "caresphere-474703",
  // storageBucket: "caresphere-474703.firebasestorage.app",
  // messagingSenderId:"748085462199",
  // appId:"748085462199:web:9a5ad7823e59000c2bf932"

//   apiKey: import.meta.env.APIKEY,
//   authDomain: import.meta.env.AUTHDOMAIN,
//   projectId: import.meta.env.PROJECT_ID,
//   storageBucket: import.meta.env.STORAGE_BUCKET,
//   messagingSenderId:import.meta.env.MESSAGING_SENDER_ID,
//   appId:import.meta.env.APP_ID

//*********************************************** */
  //  apiKey: "AIzaSyC7POku1ofofXT7jwo1L3Aq0O-0dD-uMUk",
  // authDomain: "caresphere-c870c.firebaseapp.com",
  // projectId: "caresphere-c870c",
  // storageBucket: "caresphere-c870c.firebasestorage.app",
  // messagingSenderId: "785418315133",
  // appId: "1:785418315133:web:5238eb79d972d84cea9814",
  // measurementId: "G-BR5CS7G9WM"

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