importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyDgYq_SgOUXy_Na6-5JwXPuYv0EJKzIQeQ",
  authDomain: "devsync-7042c.firebaseapp.com",
  projectId: "devsync-7042c",
  // storageBucket: "devsync-7042c.firebasestorage.app",
  messagingSenderId: "350245660506",
  appId: "1:350245660506:web:b9d271fcd53d3b3f64b563",
  // measurementId: "G-J7T1TBWGP9"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function(payload) {
  console.log('[firebase-messaging-sw.js] Background message', payload);

  const notificationTitle = payload.notification?.title || 'CareSphere';
  const notificationOptions = {
    body: payload.notification?.body || '',
    // icon: '/logo192.png'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});