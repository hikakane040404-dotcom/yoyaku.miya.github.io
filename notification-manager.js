// Push Notification Manager for Miyamoto Lab Reservation System
// Handles notification subscription and management

class NotificationManager {
    constructor() {
        this.vapidKey = 'BNkZ8kKb19MEe_dQ1DLxJQKe0GpFBLnpE3GQZ1FvoeJTSpysirqDGNd-BTMwhzUto913aBrqRxgEsCtnBVh3QeI';
        this.messaging = null;
        this.currentToken = null;
    }

    // Initialize Firebase Messaging
    async init(firebaseApp) {
        try {
            const { getMessaging, getToken, onMessage } = await import('https://www.gstatic.com/firebasejs/12.8.0/firebase-messaging.js');
            this.messaging = getMessaging(firebaseApp);

            // Handle foreground messages
            onMessage(this.messaging, (payload) => {
                console.log('Message received in foreground: ', payload);
                this.showForegroundNotification(payload);
            });

            console.log('Notification Manager initialized');
        } catch (error) {
            console.error('Error initializing notification manager:', error);
        }
    }

    // Request notification permission and subscribe
    async requestPermission() {
        try {
            const permission = await Notification.requestPermission();

            if (permission === 'granted') {
                console.log('Notification permission granted.');
                await this.subscribeToNotifications();
                return true;
            } else {
                console.log('Notification permission denied.');
                return false;
            }
        } catch (error) {
            console.error('Error requesting notification permission:', error);
            return false;
        }
    }

    // Subscribe to push notifications
    async subscribeToNotifications() {
        try {
            if (!this.messaging) {
                console.error('Messaging not initialized');
                return null;
            }

            const { getToken } = await import('https://www.gstatic.com/firebasejs/12.8.0/firebase-messaging.js');

            // Register service worker (relative path for GitHub Pages compatibility)
            const registration = await navigator.serviceWorker.register('./firebase-messaging-sw.js');
            console.log('Service Worker registered:', registration);

            // Wait for service worker to be ready
            await navigator.serviceWorker.ready;
            console.log('Service Worker is ready');

            // If the service worker is installing, wait for it to activate
            if (registration.installing) {
                await new Promise((resolve) => {
                    registration.installing.addEventListener('statechange', (e) => {
                        if (e.target.state === 'activated') {
                            resolve();
                        }
                    });
                });
            }

            // Get FCM token
            const token = await getToken(this.messaging, {
                vapidKey: this.vapidKey,
                serviceWorkerRegistration: registration
            });

            if (token) {
                console.log('FCM Token:', token);
                this.currentToken = token;

                // Save token to server
                await this.saveTokenToServer(token);

                return token;
            } else {
                console.log('No registration token available.');
                return null;
            }
        } catch (error) {
            console.error('Error subscribing to notifications:', error);
            return null;
        }
    }

    // Save FCM token to Google Apps Script
    async saveTokenToServer(token) {
        try {
            const currentUser = JSON.parse(localStorage.getItem('miyamoto_current_user') || 'null');

            if (!currentUser || !currentUser.studentId) {
                console.warn('No user logged in, cannot save token');
                return;
            }

            // Get GAS API URL from main script
            const GAS_API_URL = localStorage.getItem('miyamoto_gas_url') ||
                'https://script.google.com/macros/s/AKfycbxD3w9crFLx9qAudd95hqT6bN1Sijd-bH81-oVYJKIYoGHnqzEtPSe1F22cdbzch2ObAA/exec';

            const response = await fetch(GAS_API_URL, {
                method: 'POST',
                mode: 'no-cors',
                headers: { 'Content-Type': 'text/plain' },
                body: JSON.stringify({
                    action: 'saveFCMToken',
                    studentId: currentUser.studentId,
                    token: token,
                    timestamp: new Date().toISOString()
                })
            });

            console.log('Token saved to server');

            // Also save locally
            localStorage.setItem('miyamoto_fcm_token', token);
            localStorage.setItem('miyamoto_fcm_token_time', new Date().toISOString());

        } catch (error) {
            console.error('Error saving token to server:', error);
        }
    }

    // Show notification when app is in foreground
    showForegroundNotification(payload) {
        const notificationTitle = payload.notification?.title || '宮本研 予約リマインダー';
        const notificationOptions = {
            body: payload.notification?.body || '予約の時間が近づいています',
            icon: '/favicon.ico',
            badge: '/favicon.ico',
            tag: 'reservation-reminder',
            requireInteraction: true
        };

        if (Notification.permission === 'granted') {
            new Notification(notificationTitle, notificationOptions);
        }
    }

    // Check if notifications are supported
    isSupported() {
        // Safari requires PWA installation (standalone mode)
        if (this.isSafari() && !this.isStandalone()) {
            return false;
        }
        return 'Notification' in window &&
            'serviceWorker' in navigator &&
            'PushManager' in window;
    }

    // Detect if running on Safari
    isSafari() {
        const ua = navigator.userAgent.toLowerCase();
        return ua.indexOf('safari') !== -1 && ua.indexOf('chrome') === -1;
    }

    // Detect if running in standalone mode (PWA)
    isStandalone() {
        return window.matchMedia('(display-mode: standalone)').matches ||
            window.navigator.standalone === true;
    }

    // Check if iOS device
    isIOS() {
        return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    }

    // Get current notification permission status
    getPermissionStatus() {
        if (!('Notification' in window)) {
            return 'not-supported';
        }
        return Notification.permission;
    }

    // Get Safari-specific installation status
    getSafariInstallStatus() {
        if (!this.isSafari() && !this.isIOS()) {
            return { needsInstall: false, message: '' };
        }

        if (this.isStandalone()) {
            return { needsInstall: false, message: '' };
        }

        return {
            needsInstall: true,
            message: 'Safariをご利用の場合、通知を受け取るには「ホーム画面に追加」する必要があります。',
            instructions: [
                '1. 画面下部の共有ボタン（□↑）をタップ',
                '2. 「ホーム画面に追加」を選択',
                '3. 追加したアイコンからアプリを開く',
                '4. 再度通知設定を行ってください'
            ]
        };
    }

    // Unsubscribe from notifications
    async unsubscribe() {
        try {
            if (this.currentToken) {
                // Delete token from server
                await this.deleteTokenFromServer(this.currentToken);

                // Clear local storage
                localStorage.removeItem('miyamoto_fcm_token');
                localStorage.removeItem('miyamoto_fcm_token_time');

                this.currentToken = null;
                console.log('Unsubscribed from notifications');
                return true;
            }
        } catch (error) {
            console.error('Error unsubscribing:', error);
            return false;
        }
    }

    // Delete token from server
    async deleteTokenFromServer(token) {
        try {
            const currentUser = JSON.parse(localStorage.getItem('miyamoto_current_user') || 'null');

            if (!currentUser || !currentUser.studentId) {
                return;
            }

            const GAS_API_URL = localStorage.getItem('miyamoto_gas_url') ||
                'https://script.google.com/macros/s/AKfycbxD3w9crFLx9qAudd95hqT6bN1Sijd-bH81-oVYJKIYoGHnqzEtPSe1F22cdbzch2ObAA/exec';

            await fetch(GAS_API_URL, {
                method: 'POST',
                mode: 'no-cors',
                headers: { 'Content-Type': 'text/plain' },
                body: JSON.stringify({
                    action: 'deleteFCMToken',
                    studentId: currentUser.studentId,
                    token: token
                })
            });

            console.log('Token deleted from server');
        } catch (error) {
            console.error('Error deleting token from server:', error);
        }
    }
}

// Export for use in main script
window.NotificationManager = NotificationManager;
