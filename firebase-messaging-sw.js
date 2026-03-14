// ===============================================
// Firebase Cloud Messaging Service Worker (重複防止版)
// ===============================================

importScripts('https://www.gstatic.com/firebasejs/12.8.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/12.8.0/firebase-messaging-compat.js');

// 1. Firebaseの初期化
firebase.initializeApp({
    apiKey: "AIzaSyAZQSIHvjllGZ1Dlsf8lquHLY_27HWLXOM",
    authDomain: "miyamoto-lab-notification.firebaseapp.com",
    projectId: "miyamoto-lab-notification",
    storageBucket: "miyamoto-lab-notification.firebasestorage.app",
    messagingSenderId: "623524082594",
    appId: "1:623524082594:web:a065684d63907615f038fb"
});

const messaging = firebase.messaging();

// ===============================================
// 修正ポイント: onBackgroundMessage を賢くする
// ===============================================
// アプリがバックグラウンドにある時のみ呼ばれます。
messaging.onBackgroundMessage((payload) => {
    console.log('[SW] Received background message ', payload);

    // 【重要】
    // Firebase V1で送信する際、"notification" ペイロードが含まれていると
    // ブラウザが「自動的に」通知を出します。
    // その状態でここで `self.registration.showNotification` を呼ぶと、
    // 「ブラウザの自動通知」＋「ここでの手動通知」で2個出てしまいます。
    
    // なので、ブラウザが自動で出してくれている機能（通知上書き・タグなど）を
    // 邪魔しないように、ここでは何もしません！
});

// ===============================================
// 通知をクリックした時の挙動
// ===============================================
self.addEventListener('notificationclick', (event) => {
    console.log('[SW] Notification click received.');
    event.notification.close();

    // 通知をクリックしたらアプリの画面を開く（または戻る）
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
            // すでに開いているタブがあればそこにフォーカス
            for (let i = 0; i < windowClients.length; i++) {
                const client = windowClients[i];
                if (client.url === '/' && 'focus' in client) {
                    return client.focus();
                }
            }
            // なければ新しく開く
            if (clients.openWindow) {
                return clients.openWindow('/');
            }
        })
    );
});
