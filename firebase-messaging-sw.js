// Firebase Cloud Messaging Service Worker
// This file must be at the root of your web app

importScripts('https://www.gstatic.com/firebasejs/12.8.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/12.8.0/firebase-messaging-compat.js');

// Initialize Firebase in the service worker
firebase.initializeApp({
    apiKey: "AIzaSyAZQSIHvjllGZ1Dlsf8lquHLY_27HWLXOM",
    authDomain: "miyamoto-lab-notification.firebaseapp.com",
    projectId: "miyamoto-lab-notification",
    storageBucket: "miyamoto-lab-notification.firebasestorage.app",
    messagingSenderId: "623524082594",
    appId: "1:623524082594:web:a065684d63907615f038fb"
});

const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] Received background message ', payload);

    const notificationTitle = payload.notification.title || '宮本研 予約リマインダー';
    const notificationOptions = {
        body: payload.notification.body,
        icon: '/favicon.ico', // アイコンのパスを適宜変更
        badge: '/favicon.ico',
        tag: 'reservation-reminder',
        requireInteraction: true, // ユーザーが閉じるまで表示
        data: payload.data
    };

    return self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
    console.log('[Service Worker] Notification click received.');
    event.notification.close();

    // Open the app when notification is clicked
    event.waitUntil(
        clients.openWindow('/')
    );
});
