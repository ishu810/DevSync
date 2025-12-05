importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js');

firebase.initializeApp({

  // apiKey: "AIzaSyDgYq_SgOUXy_Na6-5JwXPuYv0EJKzIQeQ",
  // authDomain: "devsync-7042c.firebaseapp.com",
  // projectId: "devsync-7042c",
  // storageBucket: "devsync-7042c.firebasestorage.app",
  // messagingSenderId: "350245660506",
  // appId: "1:350245660506:web:b9d271fcd53d3b3f64b563",
  // measurementId: "G-J7T1TBWGP9"
  apiKey: "AIzaSyC7POku1ofofXT7jwo1L3Aq0O-0dD-uMUk",
  authDomain: "caresphere-c870c.firebaseapp.com",
  projectId: "caresphere-c870c",
  storageBucket: "caresphere-c870c.firebasestorage.app",
  messagingSenderId: "785418315133",
  appId: "1:785418315133:web:5238eb79d972d84cea9814",
  measurementId: "G-BR5CS7G9WM"
//****************************** */
// apiKey: "AIzaSyAEWnPNtu9gQt7C7FkkPRKGdIVgPm7adas",
//   authDomain: "caresphere-474703.firebaseapp.com",
//   projectId: "caresphere-474703",
//   storageBucket: "caresphere-474703.firebasestorage.app",
//   messagingSenderId:"748085462199",
//   appId:"748085462199:web:9a5ad7823e59000c2bf932"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function(payload) {
  console.log('[firebase-messaging-sw.js] Background message', payload);

  const notificationTitle = payload.notification?.title || 'CareSphere';
  const notificationOptions = {
    body: payload.notification?.body || '',
    icon: '/logo192.png'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});