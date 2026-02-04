document.addEventListener('DOMContentLoaded', () => {
    // State
    let currentDate = new Date();
    currentDate.setDate(1); // Set to 1st of the month to avoid overflow when navigating
    let isAdminMode = false;
    let currentAdminUser = null; // Stores the currently logged in owner object
    let currentUserAccount = null; // Stores the currently logged in student user
    const DEFAULT_PASSWORD = 'admin'; // Initial password

    // Initialize Notification Manager
    let notificationManager = null;
    if (window.NotificationManager) {
        notificationManager = new window.NotificationManager();
        // Initialize after Firebase is loaded
        setTimeout(() => {
            if (window.firebaseApp) {
                notificationManager.init(window.firebaseApp);
            }
        }, 1000);
    }

    const timeSlots = [
        "08:30",
        "08:45",
        "09:00",
        "09:15",
        "09:30",
        "09:45",
        "10:00",
        "10:15",
        "10:30",
        "10:45",
        "11:00",
        "11:15",
        "11:30",
        "11:45",
        "12:00",
        "12:15",
        "12:30",
        "12:45",
        "13:00",
        "13:15",
        "13:30",
        "13:45",
        "14:00",
        "14:15",
        "14:30",
        "14:45",
        "15:00",
        "15:15",
        "15:30",
        "15:45",
        "16:00",
        "16:15",
        "16:30",
        "16:45",
        "17:00",
        "17:15",
        "17:30",
        "17:45",
        "18:00",
        "18:15",
        "18:30",
        "18:45",
        "19:00",
        "19:15",
        "19:30",
        "19:45"
    ];

    // DOM Elements - Main
    const calendarGrid = document.getElementById('calendarGrid');
    const currentMonthDisplay = document.getElementById('currentMonthDisplay');
    const prevMonthBtn = document.getElementById('prevMonth');
    const nextMonthBtn = document.getElementById('nextMonth');
    const toast = document.getElementById('toast');
    const adminToggleBtn = document.getElementById('adminToggleBtn');
    const allReservationsBtn = document.getElementById('allReservationsBtn');
    const changePasswordBtn = document.getElementById('changePasswordBtn');
    const syncDataBtn = document.getElementById('syncDataBtn');

    // DOM Elements - Decoration
    // DOM Elements - Reservation Modal
    const reservationModal = document.getElementById('reservationModal');
    const reservationForm = document.getElementById('reservationForm');
    const modalDateTitle = document.getElementById('modalDateTitle');
    // const timeSlotSelect = document.getElementById('timeSlot'); // No longer used as select
    const bookingScheduleView = document.getElementById('bookingScheduleView');
    const bookingFormContainer = document.getElementById('bookingFormContainer');
    const dailyScheduleList = document.getElementById('dailyScheduleList');
    const backToScheduleBtn = document.getElementById('backToScheduleBtn');
    const selectedTimeDisplay = document.getElementById('selectedTimeDisplay');
    const timeSlotInput = document.getElementById('timeSlot'); // Hidden input

    // DOM Elements - Admin Modal
    const adminDayModal = document.getElementById('adminDayModal');
    const adminDateTitle = document.getElementById('adminDateTitle');
    const adminTimeSlots = document.getElementById('adminTimeSlots');

    // DOM Elements - Form Fields
    const attendeesInput = document.getElementById('attendees');
    const additionalAttendeesContainer = document.getElementById('additionalAttendeesContainer');

    // DOM Elements - Dashboard
    const dashboardTodayList = document.getElementById('dashboardTodayList');
    const dashboardWeekList = document.getElementById('dashboardWeekList');
    const myReservationsSection = document.getElementById('myReservationsSection');
    const myReservationList = document.getElementById('myReservationList');
    const adminReservationsList = document.getElementById('adminReservationsList');
    // Daily Batch Controls
    const dailyBatchStartTime = document.getElementById('dailyBatchStartTime');
    const dailyBatchEndTime = document.getElementById('dailyBatchEndTime');
    const dailyBatchApplyBtn = document.getElementById('dailyBatchApplyBtn');

    // DOM Elements - Password Modals
    const passwordModal = document.getElementById('passwordModal');
    const passwordForm = document.getElementById('passwordForm');
    const adminPasswordInput = document.getElementById('adminPassword');

    const changePasswordModal = document.getElementById('changePasswordModal');
    const changePasswordForm = document.getElementById('changePasswordForm');
    const currentPasswordInput = document.getElementById('currentPasswordInput');
    const newPasswordInput = document.getElementById('newPasswordInput');
    const adminUserSelect = document.getElementById('adminUserSelect');

    // DOM Elements - All Reservations Modal
    const allReservationsModal = document.getElementById('allReservationsModal');
    const allReservationsList = document.getElementById('allReservationsList');
    const copyAllDataBtn = document.getElementById('copyAllDataBtn');

    // DOM Elements - Owner Management Modal
    const ownerManagementBtn = document.getElementById('ownerManagementBtn');
    const ownerManagementModal = document.getElementById('ownerManagementModal');
    const addOwnerForm = document.getElementById('addOwnerForm');
    const ownerList = document.getElementById('ownerList');

    // DOM Elements - My Page (Student)
    const myPageBtn = document.getElementById('myPageBtn');
    const myPageModal = document.getElementById('myPageModal');
    const myPageFutureList = document.getElementById('myPageFutureList');
    const myPagePastList = document.getElementById('myPagePastList');
    const myPageSettingsBtn = document.getElementById('myPageSettingsBtn');


    // DOM Elements - Batch Registration Modal
    const batchRegistrationBtn = document.getElementById('batchRegistrationBtn');
    const batchRegistrationModal = document.getElementById('batchRegistrationModal');
    const batchRegistrationForm = document.getElementById('batchRegistrationForm');
    const batchStartDate = document.getElementById('batchStartDate');
    const batchEndDate = document.getElementById('batchEndDate');
    const batchStartTime = document.getElementById('batchStartTime');
    const batchEndTime = document.getElementById('batchEndTime');

    // DOM Elements - User Management Modal (Admin)
    const userManagementBtn = document.getElementById('userManagementBtn');
    const userManagementModal = document.getElementById('userManagementModal');
    const userManagementList = document.getElementById('userManagementList');

    // DOM Elements - Admin Menu
    const adminMenuBtn = document.getElementById('adminMenuBtn');
    const adminMenuModal = document.getElementById('adminMenuModal');
    // const menuAllReservationsBtn = document.getElementById('menuAllReservationsBtn'); // Removed
    // const menuBatchRegistrationBtn = document.getElementById('menuBatchRegistrationBtn'); // Removed
    const menuOwnerManagementBtn = document.getElementById('menuOwnerManagementBtn');
    const menuUserManagementBtn = document.getElementById('menuUserManagementBtn');
    const menuChangePasswordBtn = document.getElementById('menuChangePasswordBtn');
    const adminQuickActions = document.getElementById('adminQuickActions');
    const sidebarStudentHistoryBtn = document.getElementById('sidebarStudentHistoryBtn');
    const sidebarAllReservationsBtn = document.getElementById('sidebarAllReservationsBtn');

    // Details Modal
    const reservationDetailsModal = document.getElementById('reservationDetailsModal');
    const closeReservationDetailsModal = document.getElementById('closeReservationDetailsModal');
    const closeReservationDetailsBtn = document.getElementById('closeReservationDetailsBtn');
    const reservationDetailsBody = document.getElementById('reservationDetailsBody');

    // Close buttons
    document.querySelectorAll('.closeModal').forEach(btn => {
        btn.addEventListener('click', () => {
            if (reservationModal) reservationModal.classList.remove('show');
            if (adminDayModal) adminDayModal.classList.remove('show');
            if (passwordModal) passwordModal.classList.remove('show');
            if (changePasswordModal) changePasswordModal.classList.remove('show');
            if (allReservationsModal) allReservationsModal.classList.remove('show');
            if (ownerManagementModal) ownerManagementModal.classList.remove('show');
            if (batchRegistrationModal) batchRegistrationModal.classList.remove('show');
            // Check existence for potentially removed/dynamic modals
            if (typeof userManagementModal !== 'undefined' && userManagementModal) userManagementModal.classList.remove('show');
            if (typeof adminMenuModal !== 'undefined' && adminMenuModal) adminMenuModal.classList.remove('show');
            if (reservationDetailsModal) reservationDetailsModal.classList.remove('show');
            // Added Student History Modal
            const shModal = document.getElementById('studentHistoryModal');
            if (shModal) shModal.classList.remove('show');

            if (myPageModal) myPageModal.classList.remove('show');

            const accModal = document.getElementById('accountModal');
            if (accModal) accModal.classList.remove('show');

            const settingsModal = document.getElementById('userSettingsModal');
            if (settingsModal) settingsModal.classList.remove('show');

            // Notification Settings Modal
            const notifModal = document.getElementById('notificationSettingsModal');
            if (notifModal) notifModal.classList.remove('show');
        });
    });

    // Close Details Modal (Specific buttons)
    if (closeReservationDetailsModal) {
        closeReservationDetailsModal.addEventListener('click', () => {
            if (reservationDetailsModal) reservationDetailsModal.classList.remove('show');
        });
    }
    if (closeReservationDetailsBtn) {
        closeReservationDetailsBtn.addEventListener('click', () => {
            if (reservationDetailsModal) reservationDetailsModal.classList.remove('show');
        });
    }

    // Windows Click Close Logic
    window.addEventListener('click', (e) => {
        if (e.target === reservationDetailsModal) reservationDetailsModal.classList.remove('show');
        if (e.target === myPageModal) myPageModal.classList.remove('show');
        const notifModal = document.getElementById('notificationSettingsModal');
        if (e.target === notifModal) notifModal.classList.remove('show');
    });

    // Local Storage Helpers
    const getStoredPassword = () => {
        return localStorage.getItem('miyamoto_admin_password') || DEFAULT_PASSWORD;
    };

    // --- Synchronization & Storage Helpers ---

    // GAS Web App URL (Updated: 2026-02-03 - Notification Support)
    const GAS_API_URL = 'https://script.google.com/macros/s/AKfycbxD3w9crFLx9qAudd95hqT6bN1Sijd-bH81-oVYJKIYoGHnqzEtPSe1F22cdbzch2ObAA/exec';

    // Display Connection Info
    const serverIdDisplay = document.getElementById('connectedServerId');
    if (serverIdDisplay) {
        const idMatch = GAS_API_URL.match(/\/s\/([^\/]+)\/exec/);
        const shortId = idMatch ? idMatch[1].substring(0, 8) + '...' : 'Unknown';
        serverIdDisplay.textContent = shortId;
        serverIdDisplay.title = GAS_API_URL;
    }

    // Show sync status
    const showSyncing = (msg = '同期中...') => {
        toast.textContent = msg;
        toast.className = 'toast show';
    };
    const hideSyncing = () => {
        toast.className = 'toast';
    };

    // Save to GAS
    // Save to GAS
    const pushDataToGas = async (key, data) => {
        try {
            // Simply stringify if it's an object, otherwise use as is
            const payload = (typeof data === 'object') ? JSON.stringify(data) : data;

            console.log(`Syncing ${key}...`, payload.length > 100 ? payload.substring(0, 100) + '...' : payload);

            await fetch(GAS_API_URL, {
                method: 'POST',
                mode: 'no-cors',
                headers: { 'Content-Type': 'text/plain' },
                body: JSON.stringify({ action: 'saveData', key: key, data: payload })
            });

            if (syncDataBtn) syncDataBtn.classList.remove('sync-error');
        } catch (err) {
            console.error('GAS Save failed:', err);
            if (syncDataBtn) syncDataBtn.classList.add('sync-error');
        }
    };

    // Helper: Fetch specific data key from GAS (for safe updates)
    const fetchFromGas = async (key) => {
        try {
            const url = `${GAS_API_URL}?key=${key}`;
            const response = await fetch(url);
            const data = await response.json();
            return data;
        } catch (err) {
            console.error(`Fetch ${key} failed:`, err);
            return null;
        }
    };

    // Fetch all data from GAS on load
    const syncDataWithGas = async (isSilent = false) => {
        if (!isSilent) showSyncing();
        if (syncDataBtn) {
            syncDataBtn.classList.remove('sync-error');
            syncDataBtn.classList.add('syncing');
        }

        try {
            const controller = new AbortController();
            const id = setTimeout(() => controller.abort(), 10000);

            const urlWithCacheBuster = `${GAS_API_URL}${GAS_API_URL.includes('?') ? '&' : '?'}key=&cb=${Date.now()}`;

            const response = await fetch(urlWithCacheBuster, {
                signal: controller.signal,
                cache: 'no-store'
            });
            clearTimeout(id);

            if (!response.ok) throw new Error(`HTTP ${response.status}`);

            let remoteRaw = await response.json();
            let remoteData = remoteRaw;

            // Handle double stringification from GAS if necessary
            if (typeof remoteRaw === 'string') {
                try { remoteData = JSON.parse(remoteRaw); } catch (e) { }
            }

            if (remoteData && typeof remoteData === 'object') {
                console.log('✅ GAS Sync Success. Received:', Object.keys(remoteData));

                const processAndStore = (localKey, remoteKey) => {
                    let val = remoteData[remoteKey];
                    if (val === undefined || val === null) return;

                    // Deep Parse
                    let parsed = val;
                    for (let i = 0; i < 3; i++) {
                        if (typeof parsed === 'string' && parsed !== "") {
                            try {
                                const tried = JSON.parse(parsed);
                                if (tried && (typeof tried === 'object' || Array.isArray(tried))) {
                                    parsed = tried;
                                } else {
                                    break;
                                }
                            } catch (e) { break; }
                        } else { break; }
                    }

                    // Normalize date keys for reservations and open_slots to avoid mismatch
                    if (remoteKey === 'reservations' || remoteKey === 'open_slots') {
                        const normalized = {};
                        Object.keys(parsed).forEach(key => {
                            const d = new Date(key);
                            if (!isNaN(d.getTime())) {
                                const y = d.getFullYear();
                                const m = ('0' + (d.getMonth() + 1)).slice(-2);
                                const dia = ('0' + d.getDate()).slice(-2);
                                normalized[`${y}-${m}-${dia}`] = parsed[key];
                            }
                        });
                        parsed = normalized;
                    }

                    // Special Merge for Users & Owners to preserve local passwords if remote is missing them
                    if (remoteKey === 'users' || remoteKey === 'owners') {
                        const localStr = localStorage.getItem(localKey);
                        let localList = [];
                        try { localList = JSON.parse(localStr) || []; } catch (e) { }

                        if (Array.isArray(parsed) && Array.isArray(localList)) {
                            const localMap = {};
                            localList.forEach(item => {
                                const k = (remoteKey === 'users') ? item.studentId : (item.email || item.name);
                                if (k) localMap[k] = item;
                            });

                            parsed = parsed.map(remoteItem => {
                                const k = (remoteKey === 'users') ? remoteItem.studentId : (remoteItem.email || remoteItem.name);
                                const localItem = localMap[k];
                                if (localItem) {
                                    if (!remoteItem.password && localItem.password) remoteItem.password = localItem.password;
                                    if (remoteItem.notify === undefined && localItem.notify !== undefined) remoteItem.notify = localItem.notify;
                                }
                                return remoteItem;
                            });
                        }
                    }

                    localStorage.setItem(localKey, JSON.stringify(parsed));
                };

                // Explicitly map keys
                processAndStore('miyamoto_reservations', 'reservations');
                processAndStore('miyamoto_open_slots', 'open_slots');
                processAndStore('miyamoto_users', 'users');
                processAndStore('miyamoto_owners', 'owners');
                processAndStore('miyamoto_date_config', 'date_config');
                processAndStore('miyamoto_admin_password', 'admin_password');

                // Summary for User Debugging
                const resCount = Object.keys(JSON.parse(localStorage.getItem('miyamoto_reservations') || '{}')).length;
                const slotCount = Object.keys(JSON.parse(localStorage.getItem('miyamoto_open_slots') || '{}')).length;
                const userCount = JSON.parse(localStorage.getItem('miyamoto_users') || '[]').length;
                console.log(`Sync Summary: ResDays=${resCount}, SlotDays=${slotCount}, Users=${userCount}`);

                // Only show toast if manual sync (not silent) or if explicit feedback needed
                if (!isSilent) {
                    showToast(`同期完了: 予約${resCount}日分, 設定${slotCount}日分, ユーザー${userCount}人`);
                }

                // Re-render UI after sync
                renderCalendar(currentDate);
                renderDashboard();
                if (ownerManagementModal && ownerManagementModal.classList.contains('show')) {
                    renderOwnerList();
                }
            } else {
                console.warn('GAS Response was empty or invalid:', remoteRaw);
            }
            if (syncDataBtn) syncDataBtn.classList.remove('syncing');
            if (!isSilent) hideSyncing();
        } catch (err) {
            console.error('Initial sync failed:', err);
            if (syncDataBtn) {
                syncDataBtn.classList.remove('syncing');
                syncDataBtn.classList.add('sync-error');
            }
            if (!isSilent) hideSyncing();
        }
    };

    const getOwners = () => {
        const data = localStorage.getItem('miyamoto_owners');
        try {
            return (data && data !== "undefined") ? JSON.parse(data) : [];
        } catch (e) { return []; }
    };

    const getReservations = () => {
        const data = localStorage.getItem('miyamoto_reservations');
        try {
            return (data && data !== "undefined") ? JSON.parse(data) : {};
        } catch (e) { return {}; }
    };

    const getUsers = () => {
        const data = localStorage.getItem('miyamoto_users');
        try {
            return (data && data !== "undefined") ? JSON.parse(data) : [];
        } catch (e) { return []; }
    };

    const saveUsers = (users) => {
        localStorage.setItem('miyamoto_users', JSON.stringify(users));
        pushDataToGas('users', users);
    };

    const setStoredPassword = (pwd) => {
        localStorage.setItem('miyamoto_admin_password', pwd);
        pushDataToGas('admin_password', pwd);
    };

    const saveOwners = (owners) => {
        localStorage.setItem('miyamoto_owners', JSON.stringify(owners));
        pushDataToGas('owners', owners); // Ensure this is sending the latest owner objects with passwords
    };

    // Updated saveReservation to accept an optional full map to avoid re-fetching stale data during Edit
    const saveReservation = (dateStr, data, updatedReservations = null) => {
        const reservations = updatedReservations || getReservations();
        if (!reservations[dateStr]) {
            reservations[dateStr] = [];
        }
        reservations[dateStr].push(data);
        localStorage.setItem('miyamoto_reservations', JSON.stringify(reservations));
        pushDataToGas('reservations', reservations);
        renderDashboard();
        renderCalendar(currentDate);
    };

    // --- Dashboard Logic ---
    const renderDashboard = () => {
        if (!dashboardTodayList || !dashboardWeekList) return;

        const reservations = getReservations();
        const today = new Date();
        // Zero out time for accurate date comparison
        today.setHours(0, 0, 0, 0);
        const todayStr = toLocalYMD(today);

        // --- 0. My Reservations Logic ---
        if (myReservationsSection && myReservationList) {
            if (!currentUserAccount) {
                myReservationsSection.style.display = 'none';
            } else {
                myReservationsSection.style.display = 'block';
                myReservationList.innerHTML = '';

                // Collect all future reservations for this user
                let myResEvents = [];
                const sortedDates = Object.keys(reservations).sort();

                sortedDates.forEach(dStr => {
                    const rDate = new Date(dStr);
                    if (rDate >= today) { // Future or Today
                        const dayRes = reservations[dStr] || [];
                        dayRes.forEach(r => {
                            const isOwner = r.studentId === currentUserAccount.studentId;
                            const isAttendee = r.additionalAttendees && Array.isArray(r.additionalAttendees) && r.additionalAttendees.some(a => a.id === currentUserAccount.studentId);

                            if (isOwner || isAttendee) {
                                myResEvents.push({ ...r, dateStr: dStr, dateObj: rDate });
                            }
                        });
                    }
                });

                // Deduplicate multi-slot bookings (group by timestamp or timeslot+name)
                // We reuse the grouping logic idea but just for display
                // Simple approach: Render them as items.
                // Better: Reuse the groupReservations logic if possible, or just accept raw list. 
                // Since this is across multiple days, grouping by day first is cleaner.

                if (myResEvents.length === 0) {
                    myReservationList.innerHTML = '<div style="color:#718096; font-size:0.85rem;">現在、予約はありません</div>';
                } else {
                    // Sort by Date then Time
                    myResEvents.sort((a, b) => {
                        if (a.dateStr !== b.dateStr) return a.dateObj - b.dateObj;
                        return a.timeSlot.localeCompare(b.timeSlot);
                    });

                    // Limit? Maybe show all or top 5. User asked for "dashboard ... displayed". Start with all or reasonable limit.
                    // Let's show all for "My" reservations as they are critical.

                    const MAX_MY_SHOW = 3;
                    let hasHiddenMyRes = false;

                    myResEvents.forEach((r, index) => {
                        // Simplify display: [Date] [Time] [Tag]
                        const d = r.dateObj;
                        const dayName = ["日", "月", "火", "水", "木", "金", "土"][d.getDay()];
                        const dateDisplay = `${d.getMonth() + 1}/${d.getDate()}(${dayName})`;

                        let tag = '';
                        if (r.privacyType === 'open') tag = '<span style="font-size:0.65rem; background:#ecc94b; color:white; padding:1px 3px; border-radius:2px; margin-left:4px;">同席可</span>';

                        const item = document.createElement('div');
                        item.style.marginBottom = '6px';
                        item.style.padding = '8px';
                        item.style.background = '#ebf8ff'; // Light blue for MY res
                        item.style.borderLeft = '3px solid #3182ce';
                        item.style.borderRadius = '4px';
                        item.style.cursor = 'pointer';

                        const isHidden = index >= MAX_MY_SHOW;
                        if (isHidden) {
                            item.style.display = 'none';
                            item.classList.add('my-res-hidden');
                            hasHiddenMyRes = true;
                        }

                        let groupBadge = '';
                        if (r.attendees > 1) {
                            groupBadge = `<span style="font-size:0.7rem; background:#38a169; color:white; padding:1px 5px; border-radius:4px; margin-left:8px;">グループ (${r.attendees}名)</span>`;
                        } else {
                            groupBadge = `<span style="font-size:0.7rem; background:#718096; color:white; padding:1px 5px; border-radius:4px; margin-left:8px;">個人</span>`;
                        }

                        item.innerHTML = `
                            <div style="font-weight:700; color:#2c5282; display:flex; justify-content:space-between;">
                                <span>${dateDisplay} ${r.timeSlot.split(' - ')[0]}~</span>
                                ${tag}
                            </div>
                            <div style="font-size:0.8rem; margin-top:2px; display:flex; align-items:center;">
                                <span>${r.type === 'research' ? '研究相談' : (r.type === 'report' ? '進捗報告' : 'その他')}</span>
                                ${groupBadge}
                            </div>
                         `;

                        item.addEventListener('click', () => showReservationDetails(r, r.dateStr));
                        myReservationList.appendChild(item);
                    });

                    if (hasHiddenMyRes) {
                        const showAllBtn = document.createElement('button');
                        showAllBtn.textContent = 'すべて表示する';
                        showAllBtn.style.width = '100%';
                        showAllBtn.style.padding = '8px';
                        showAllBtn.style.marginTop = '4px';
                        showAllBtn.style.background = '#bee3f8';
                        showAllBtn.style.border = 'none';
                        showAllBtn.style.borderRadius = '4px';
                        showAllBtn.style.color = '#2c5282';
                        showAllBtn.style.fontSize = '0.8rem';
                        showAllBtn.style.cursor = 'pointer';
                        showAllBtn.style.fontWeight = 'bold';

                        let isExpanded = false;
                        showAllBtn.addEventListener('click', () => {
                            const hiddenItems = document.querySelectorAll('.my-res-hidden');
                            if (!isExpanded) {
                                hiddenItems.forEach(el => el.style.display = 'block');
                                showAllBtn.textContent = '折りたたむ';
                                isExpanded = true;
                            } else {
                                hiddenItems.forEach(el => el.style.display = 'none');
                                showAllBtn.textContent = 'すべて表示する';
                                isExpanded = false;
                            }
                        });
                        myReservationList.appendChild(showAllBtn);
                    }
                }
            }
        }

        // Helper to group reservations by timestamp (for multi-slot bookings)
        const groupReservations = (resList) => {
            const groups = {};
            resList.forEach(r => {
                // Use timestamp as unique ID for a booking action
                // Fallback to timeSlot+name if no timestamp (legacy data)
                const key = r.timestamp || (r.timeSlot + r.name);
                if (!groups[key]) {
                    groups[key] = { ...r, _rawSlots: [r.timeSlot] };
                } else {
                    groups[key]._rawSlots.push(r.timeSlot);
                }
            });

            return Object.values(groups).map(g => {
                // If we have a stored fullRange, prefer it.
                // Otherwise calculate min-max from slots
                if (!g.fullRange) {
                    g._rawSlots.sort();
                    const start = g._rawSlots[0].split(' - ')[0];
                    const end = g._rawSlots[g._rawSlots.length - 1].split(' - ')[1];
                    g.timeSlot = `${start} - ${end}`; // Update display time
                } else {
                    g.timeSlot = g.fullRange;
                }
                return g;
            });
        };

        // Render Today
        const rawTodayRes = reservations[todayStr] || [];
        const todayGroups = groupReservations(rawTodayRes);
        todayGroups.sort((a, b) => a.timeSlot.localeCompare(b.timeSlot));

        if (todayGroups.length === 0) {
            dashboardTodayList.innerHTML = '<div style="color:#a0aec0; font-size:0.8rem;">予約はありません</div>';
        } else {
            dashboardTodayList.innerHTML = '';
            todayGroups.forEach(r => {
                const item = document.createElement('div');
                item.style.marginBottom = '6px';
                item.style.padding = '6px';
                item.style.background = '#f7fafc';
                item.style.borderRadius = '6px';
                item.style.borderLeft = '3px solid var(--color-primary)';

                // Show "Open" tag if applicable
                let tag = '';
                if (r.privacyType === 'open') tag = '<span style="font-size:0.7rem; background:#ecc94b; color:white; padding:1px 4px; border-radius:3px; margin-left:4px;">同席可</span>';

                // Group Badge Logic
                let groupBadge = '';
                if (r.attendees > 1) {
                    groupBadge = `<span style="font-size:0.7rem; background:#38a169; color:white; padding:1px 5px; border-radius:4px; margin-left:8px;">グループ (${r.attendees}名)</span>`;
                } else {
                    groupBadge = `<span style="font-size:0.7rem; background:#718096; color:white; padding:1px 5px; border-radius:4px; margin-left:8px;">個人</span>`;
                }

                item.innerHTML = `
                    <div style="font-weight:700; color:#2d3748; display:flex; justify-content:space-between; align-items:center;">
                        <span>
                            ${r.timeSlot.split(' - ')[0]} - ${r.timeSlot.split(' - ')[1]}
                            ${tag}
                        </span>
                    </div>
                    <div style="font-size:0.8rem; display:flex; align-items:center; margin-top:2px;">
                        <span>${r.name} 様</span>
                        ${groupBadge}
                    </div>
                `;

                // Add Click Event for Details
                item.style.cursor = 'pointer';
                item.addEventListener('click', () => showReservationDetails(r, todayStr));

                dashboardTodayList.appendChild(item);
            });
        }

        // Render Week (Tomorrow to +7 days)
        dashboardWeekList.innerHTML = '';
        let hasWeekRes = false;
        let weekResCount = 0;
        const MAX_WEEK_SHOW = 3;
        let hasHiddenItems = false;

        for (let i = 1; i <= 7; i++) {
            const nextDay = new Date(today);
            nextDay.setDate(today.getDate() + i);
            const nextDayStr = toLocalYMD(nextDay);
            const dayName = ["日", "月", "火", "水", "木", "金", "土"][nextDay.getDay()];

            const rawDayRes = reservations[nextDayStr] || [];
            if (rawDayRes.length > 0) {
                const dayGroups = groupReservations(rawDayRes);
                dayGroups.sort((a, b) => a.timeSlot.localeCompare(b.timeSlot));

                hasWeekRes = true;

                // Header Visibility Logic
                // If we have already reached the limit before starting this day, hide the header too.
                const isHeaderHidden = weekResCount >= MAX_WEEK_SHOW;

                const dayHeader = document.createElement('div');
                dayHeader.style.fontSize = '0.85rem';
                dayHeader.style.fontWeight = '700';
                dayHeader.style.color = '#718096';
                dayHeader.style.marginTop = '10px';
                dayHeader.style.marginBottom = '4px';
                dayHeader.textContent = `${nextDay.getMonth() + 1}/${nextDay.getDate()} (${dayName})`;
                if (isHeaderHidden) {
                    dayHeader.style.display = 'none';
                    dayHeader.classList.add('week-hidden-item');
                }
                dashboardWeekList.appendChild(dayHeader);

                dayGroups.forEach(r => {
                    weekResCount++;
                    const isItemHidden = weekResCount > MAX_WEEK_SHOW;
                    if (isItemHidden) hasHiddenItems = true;

                    let tag = '';
                    if (r.privacyType === 'open') tag = '<span style="font-size:0.65rem; background:#ecc94b; color:white; padding:1px 3px; border-radius:2px; margin-left:4px;">同席可</span>';

                    const item = document.createElement('div');
                    item.style.marginBottom = '4px';
                    item.style.padding = '4px 8px';
                    item.style.borderLeft = '2px solid #cbd5e0';
                    // Hidden styling
                    if (isItemHidden) {
                        item.style.display = 'none';
                        item.classList.add('week-hidden-item');
                    }

                    // Check if deletable (Week view)
                    let deleteAction = '';
                    if (currentUserAccount || isAdminMode) {
                        const isOwner = currentUserAccount && r.studentId === currentUserAccount.studentId;
                        const isAttendee = currentUserAccount && r.additionalAttendees && Array.isArray(r.additionalAttendees) && r.additionalAttendees.some(a => a.id === currentUserAccount.studentId);
                        const isAdmin = isAdminMode;

                        if (isOwner || isAttendee || isAdmin) {
                            deleteAction = `<button class="cancel-my-res-btn" data-date="${nextDayStr}" data-timestamp="${r.timestamp}" style="margin-left:auto; padding:2px 6px; font-size:0.65rem; color:white; background:#e53e3e; border:none; border-radius:4px; cursor:pointer;">取消</button>`;
                        }
                    }

                    // Group Badge Logic
                    let groupBadge = '';
                    if (r.attendees > 1) {
                        groupBadge = `<span style="font-size:0.65rem; background:#38a169; color:white; padding:1px 4px; border-radius:4px; margin-left:6px;">グループ (${r.attendees}名)</span>`;
                    } else {
                        groupBadge = `<span style="font-size:0.65rem; background:#718096; color:white; padding:1px 4px; border-radius:4px; margin-left:6px;">個人</span>`;
                    }

                    item.innerHTML = `
                        <div style="display:flex; justify-content:space-between; align-items:start;">
                            <div>
                                <span style="font-weight:600; margin-right:6px;">${r.timeSlot}</span>${tag}<br>
                                <div style="font-size:0.8rem; display:flex; align-items:center; margin-top:2px;">
                                    <span>${r.name} 様</span>
                                    ${groupBadge}
                                </div>
                            </div>
                        </div>
                    `;

                    // Add Click for Details
                    item.style.cursor = 'pointer';
                    item.addEventListener('click', () => showReservationDetails(r, nextDayStr));

                    dashboardWeekList.appendChild(item);
                });
            }
        }

        if (!hasWeekRes) {
            dashboardWeekList.innerHTML = '<div style="color:#a0aec0; font-size:0.8rem;">今週の予約はありません</div>';
        } else if (hasHiddenItems) {
            // Add "Show All" button
            const showAllBtn = document.createElement('button');
            showAllBtn.textContent = 'すべて表示する';
            showAllBtn.style.width = '100%';
            showAllBtn.style.padding = '8px';
            showAllBtn.style.marginTop = '8px';
            showAllBtn.style.background = '#e2e8f0';
            showAllBtn.style.border = 'none';
            showAllBtn.style.borderRadius = '4px';
            showAllBtn.style.color = '#4a5568';
            showAllBtn.style.fontSize = '0.8rem';
            showAllBtn.style.cursor = 'pointer';

            let isExpanded = false;
            showAllBtn.addEventListener('click', () => {
                const hiddenItems = document.querySelectorAll('.week-hidden-item');
                if (!isExpanded) {
                    // Expand
                    hiddenItems.forEach(el => el.style.display = 'block');
                    showAllBtn.textContent = '折りたたむ';
                    isExpanded = true;
                } else {
                    // Collapse
                    hiddenItems.forEach(el => el.style.display = 'none');
                    showAllBtn.textContent = 'すべて表示する';
                    isExpanded = false;
                }
            });
            dashboardWeekList.appendChild(showAllBtn);
        }
    };

    // Cancel Reservation (User initiated)
    const cancelReservation = (dateStr, timestamp) => {
        const reservations = getReservations();
        if (reservations[dateStr]) {
            const initialLength = reservations[dateStr].length;

            const resToDelete = reservations[dateStr].find(r => {
                const key = r.timestamp || (r.timeSlot + r.name);
                return key === timestamp;
            });

            reservations[dateStr] = reservations[dateStr].filter(r => {
                const key = r.timestamp || (r.timeSlot + r.name);
                return key !== timestamp;
            });

            if (reservations[dateStr].length !== initialLength) {
                if (reservations[dateStr].length === 0) {
                    delete reservations[dateStr];
                }
                localStorage.setItem('miyamoto_reservations', JSON.stringify(reservations));
                pushDataToGas('reservations', reservations);
                renderDashboard();
                renderCalendar(currentDate);

                // Send Cancellation Email
                if (resToDelete && resToDelete.email) {
                    const owners = getOwners();
                    const ownerEmails = owners.filter(o => o.notify && o.email).map(o => o.email).join(',');

                    const emailPayload = {
                        action: 'send_email',
                        to: resToDelete.email,
                        cc: ownerEmails,
                        subject: `【宮本研】予約キャンセルの完了 (${dateStr})`,
                        body: `${resToDelete.name} 様\n\n以下の予約が取り消されました。\n\n日時: ${dateStr} ${resToDelete.timeSlot}\n内容: ${resToDelete.type === 'research' ? '研究相談' : (resToDelete.type === 'report' ? '進捗報告' : 'その他')}\n\nまたのご利用をお待ちしております。`
                    };

                    // Use standard fetch to send email action
                    fetch(GAS_API_URL, {
                        method: 'POST',
                        mode: 'no-cors',
                        headers: { 'Content-Type': 'text/plain' },
                        body: JSON.stringify(emailPayload)
                    }).then(() => console.log('Cancellation email sent')).catch(e => console.error('Email failed', e));
                }

                pushDataToGas('reservations', reservations);
                renderDashboard();
                renderCalendar(currentDate);
                showToast('予約を取り消しました');
            }
        }
    };

    // Show Reservation Details
    const showReservationDetails = (r, dateStr) => {
        if (!reservationDetailsBody) return;

        const transFormat = (f) => {
            const map = {
                'presential': '対面',
                'remote': 'リモート (Zoom/Teams)',
                'online': 'リモート (Zoom/Teams)',
                'offline': '対面',
                'Online': 'リモート (Zoom/Teams)',
                'Offline': '対面'
            };
            return map[f] || (f === 'presential' ? '対面' : (f === 'remote' ? 'リモート (Zoom/Teams)' : '未設定'));
        };
        const transType = (t) => {
            const map = {
                'research': '研究相談',
                'report': '進捗報告',
                'other': 'その他',
                'interview': '研究相談',
                'consultation': '進捗報告'
            };
            return map[t] || t;
        };
        const transPrivacy = (p) => {
            if (p === 'open') return '同席を許可';
            if (p === 'private') return '個別面談 (非公開)';
            return '個別面談 (非公開)'; // Default safe fallback
        };

        let attendeesHtml = '';
        if (r.attendees > 1 && r.additionalAttendees && r.additionalAttendees.length > 0) {
            attendeesHtml += '<div style="margin-top:0.5rem; padding-top:0.5rem; border-top:1px dashed #e2e8f0;">';
            r.additionalAttendees.forEach((a, index) => {
                attendeesHtml += `<div style="margin-bottom:0.2rem;"><strong>参加者 ${index + 2}:</strong> ${a.name} (${a.id})</div>`;
            });
            attendeesHtml += '</div>';
        }

        const dateObj = new Date(dateStr);
        const dateDisplay = `${dateObj.getMonth() + 1}/${dateObj.getDate()}`;

        reservationDetailsBody.innerHTML = `
            <div style="margin-bottom:0.5rem;"><strong>日時:</strong> ${dateDisplay} ${r.timeSlot}</div>
            <div style="margin-bottom:0.5rem;"><strong>氏名:</strong> ${r.name}</div>
            <div style="margin-bottom:0.5rem;"><strong>学籍番号:</strong> ${r.studentId}</div>
            <div style="margin-bottom:0.5rem;"><strong>開催形式:</strong> ${transFormat(r.format)}</div>
            <div style="margin-bottom:0.5rem;"><strong>面談内容:</strong> ${transType(r.type)}</div>
            <div style="margin-bottom:0.5rem;"><strong>公開設定:</strong> ${transPrivacy(r.privacyType)}</div>
            ${attendeesHtml}
            <div style="margin-top:1rem; padding:0.5rem; background:#f7fafc; border-radius:4px;">
                <strong>備考/相談内容:</strong><br>
                <div style="white-space:pre-wrap;">${r.remarks || 'なし'}</div>
            </div>
        `;

        // Only show contact info to Admins or Owner
        let showContact = false;
        if (currentUserAccount) {
            if (currentUserAccount.status === 'faculty' || currentUserAccount.status === 'admin') showContact = true;
            if (currentUserAccount.studentId === r.studentId) showContact = true;
        }

        if (showContact && r.email) {
            reservationDetailsBody.innerHTML += `<div style="margin-top:0.5rem; color:#718096; font-size:0.9rem;"><strong>連絡先:</strong> ${r.email}</div>`;
        }

        // --- Memo Functionality ---
        let isOwnerForMemo = currentUserAccount && r.studentId === currentUserAccount.studentId;
        let isAdminForMemo = (typeof isAdminMode !== 'undefined' && isAdminMode) || (currentUserAccount && (currentUserAccount.status === 'faculty' || currentUserAccount.status === 'admin'));

        if (isOwnerForMemo || isAdminForMemo) {
            const memoSection = document.createElement('div');
            memoSection.style.marginTop = '1rem';
            memoSection.style.paddingTop = '1rem';
            memoSection.style.borderTop = '1px dashed #cbd5e0';

            let memoHtml = '';

            // Student Memo (Editable: Owner, Viewable: Owner & Admin)
            if (isOwnerForMemo || isAdminForMemo) {
                memoHtml += `<div style="margin-bottom:1rem;">
                    <label style="font-weight:bold; font-size:0.9rem; display:block; margin-bottom:4px;">学生用メモ <span style="font-weight:normal; font-size:0.8rem; color:#718096;">(備忘録)</span></label>
                    <textarea id="memoStudent" style="width:100%; border:1px solid #cbd5e0; border-radius:4px; padding:6px; font-size:0.9rem; resize:vertical; font-family:inherit;" rows="3" ${!isOwnerForMemo ? 'disabled' : ''} placeholder="学習の振り返りや、次回への課題などを記録しましょう。">${r.noteStudent || ''}</textarea>
                 </div>`;
            }

            // Shared Feedback / Minutes (Editable: Admin, Viewable: Owner & Admin) - NEW
            if (isOwnerForMemo || isAdminForMemo) {
                memoHtml += `<div style="margin-bottom:1rem;">
                    <label style="font-weight:bold; font-size:0.9rem; display:block; margin-bottom:4px; color:#2b6cb0;">共有議事録・フィードバック <span style="font-weight:normal; font-size:0.8rem; color:#718096;">(学生も閲覧可)</span></label>
                    <textarea id="memoShared" style="width:100%; border:1px solid #4299e1; border-radius:4px; padding:6px; font-size:0.9rem; resize:vertical; background:#ebf8ff; font-family:inherit;" rows="3" ${!isAdminForMemo ? 'disabled' : ''} placeholder="面談の議事録や教員からのフィードバック（学生に公開されます）。">${r.noteShared || ''}</textarea>
                 </div>`;
            }

            // Faculty Memo (Editable: Admin, Viewable: Admin only)
            if (isAdminForMemo) {
                memoHtml += `<div style="margin-bottom:1rem;">
                    <label style="font-weight:bold; font-size:0.9rem; display:block; margin-bottom:4px; color:#e53e3e;">教員用メモ <span style="font-weight:normal; font-size:0.8rem; color:#e53e3e;">(非公開)</span></label>
                    <textarea id="memoFaculty" style="width:100%; border:1px solid #fc8181; border-radius:4px; padding:6px; font-size:0.9rem; resize:vertical; background:#fff5f5; font-family:inherit;" rows="3" placeholder="指導記録、評価など（学生には見えません）。">${r.noteFaculty || ''}</textarea>
                 </div>`;
            }

            memoHtml += `<div style="text-align:right;">
                <button id="saveMemoBtn" style="background:#2b6cb0; color:white; border:none; padding:6px 16px; border-radius:4px; cursor:pointer; font-size:0.85rem; box-shadow:0 2px 4px rgba(0,0,0,0.1); font-weight:bold;">内容を保存</button>
            </div>`;

            memoSection.innerHTML = memoHtml;
            reservationDetailsBody.appendChild(memoSection);

            // Memo Logic
            setTimeout(() => {
                const saveBtn = document.getElementById('saveMemoBtn');
                if (saveBtn) {
                    saveBtn.addEventListener('click', () => {
                        const studentNoteEl = document.getElementById('memoStudent');
                        const sharedNoteEl = document.getElementById('memoShared');
                        const facultyNoteEl = document.getElementById('memoFaculty');

                        const studentNote = studentNoteEl ? studentNoteEl.value : null;
                        const sharedNote = sharedNoteEl ? sharedNoteEl.value : null;
                        const facultyNote = facultyNoteEl ? facultyNoteEl.value : null;

                        const reservations = getReservations();
                        const dayRes = reservations[dateStr];
                        if (dayRes) {
                            const target = dayRes.find(x => x.timestamp === r.timestamp);
                            if (target) {
                                let changed = false;
                                if (isOwnerForMemo && studentNote !== null && target.noteStudent !== studentNote) {
                                    target.noteStudent = studentNote;
                                    r.noteStudent = studentNote;
                                    changed = true;
                                }
                                if (isAdminForMemo && sharedNote !== null && target.noteShared !== sharedNote) {
                                    target.noteShared = sharedNote;
                                    r.noteShared = sharedNote;
                                    changed = true;
                                }
                                if (isAdminForMemo && facultyNote !== null && target.noteFaculty !== facultyNote) {
                                    target.noteFaculty = facultyNote;
                                    r.noteFaculty = facultyNote;
                                    changed = true;
                                }

                                if (changed) {
                                    localStorage.setItem('miyamoto_reservations', JSON.stringify(reservations));
                                    pushDataToGas('reservations', reservations);
                                    showToast('メモ・内容を保存しました');
                                    saveBtn.textContent = '保存済み';
                                    saveBtn.style.background = '#48bb78';
                                    setTimeout(() => {
                                        saveBtn.textContent = '内容を保存';
                                        saveBtn.style.background = '#2b6cb0';
                                    }, 2000);
                                } else {
                                    showToast('変更はありません');
                                }
                            }
                        }
                    });
                }
            }, 0);
        }

        // Add Edit Button if owner or admin
        // Add Edit & Cancel Buttons if owner or admin
        let canEdit = false;
        if (currentUserAccount || typeof isAdminMode !== 'undefined' && isAdminMode) {
            const isOwner = currentUserAccount && r.studentId === currentUserAccount.studentId;
            const isAttendee = currentUserAccount && r.additionalAttendees && Array.isArray(r.additionalAttendees) && r.additionalAttendees.some(a => a.id === currentUserAccount.studentId);
            const isAdmin = (typeof isAdminMode !== 'undefined' && isAdminMode) || (currentUserAccount && (currentUserAccount.status === 'faculty' || currentUserAccount.status === 'admin'));
            if (isOwner || isAdmin || isAttendee) canEdit = true;
        }

        if (canEdit) {
            const btnContainer = document.createElement('div');
            btnContainer.style.marginTop = '1.5rem';
            btnContainer.style.display = 'flex';
            btnContainer.style.justifyContent = 'center';
            btnContainer.style.gap = '1rem';

            btnContainer.innerHTML = `
                <button id="editReservationBtn" class="submit-btn" style="background:#3182ce; flex:1; max-width:200px;">修正する</button>
                <button id="cancelDetailsReservationBtn" class="submit-btn" style="background:#e53e3e; flex:1; max-width:200px;">取り消す</button>
            `;
            reservationDetailsBody.appendChild(btnContainer);

            // --- Google Calendar Button Removed ---

            document.getElementById('editReservationBtn').addEventListener('click', () => {
                reservationDetailsModal.classList.remove('show');
                editReservation(dateStr, r);
            });

            document.getElementById('cancelDetailsReservationBtn').addEventListener('click', () => {
                if (confirm('本当にこの予約を取り消しますか？\n(取り消すと復元できません)')) {
                    cancelReservation(dateStr, r.timestamp);
                    reservationDetailsModal.classList.remove('show');
                }
            });
        }

        reservationDetailsModal.classList.add('show');
    };

    // Edit Reservation Logic
    const editReservation = (dateStr, r) => {
        // Switch to form view
        if (reservationModal) {
            reservationModal.classList.add('show');
            if (bookingScheduleView) bookingScheduleView.style.display = 'none';
            if (bookingFormContainer) bookingFormContainer.style.display = 'block';
        }

        // Set Headers
        const dateObj = new Date(dateStr);
        if (modalDateTitle) {
            modalDateTitle.textContent = `${dateObj.getMonth() + 1}月${dateObj.getDate()}日の予約修正`;
            modalDateTitle.dataset.date = dateStr;
        }

        // Fill Form
        const safeVal = (id, val) => { const el = document.getElementById(id); if (el) el.value = val || ''; };

        safeVal('name', r.name);
        safeVal('studentId', r.studentId);
        safeVal('email', r.email);
        safeVal('attendees', r.attendees);
        safeVal('selectedTimeDisplay', `${dateStr}  ${r.timeSlot}`);
        safeVal('timeSlot', r.timeSlot);

        // Selects
        const formatSelect = document.getElementById('format');
        if (formatSelect && r.format) formatSelect.value = r.format;
        const typeSelect = document.getElementById('type');
        if (typeSelect && r.type) typeSelect.value = r.type;

        // Remarks
        const remarksArea = document.querySelector('#reservationForm textarea') || document.getElementById('remarks'); // fallback
        if (remarksArea) remarksArea.value = r.remarks || '';

        // Privacy
        const privacyRadios = document.getElementsByName('privacyType');
        privacyRadios.forEach(radio => {
            if (radio.value === r.privacyType) radio.checked = true;
        });

        // Additional Attendees
        if (additionalAttendeesContainer) {
            additionalAttendeesContainer.innerHTML = '';
            if (r.additionalAttendees && r.additionalAttendees.length > 0) {
                r.additionalAttendees.forEach((a, index) => {
                    const div = document.createElement('div');
                    div.style.marginBottom = '1.5rem';
                    div.style.padding = '1rem';
                    div.style.backgroundColor = '#f8fafc';
                    div.style.borderRadius = '8px';
                    div.style.border = '1px solid #e2e8f0';
                    div.innerHTML = `
                        <h5 style="font-size: 0.9rem; color: #4a5568; margin: 0 0 0.8rem 0;">参加者 ${index + 2} (同席)</h5>
                        <div class="form-group" style="margin-bottom: 0.5rem;">
                            <input type="text" class="add-name" placeholder="氏名" value="${a.name}" required style="width: 100%; padding: 10px; border: 1px solid #e2e8f0; border-radius: 8px;">
                        </div>
                        <div class="form-group" style="margin-bottom: 0.5rem;">
                            <input type="text" class="add-id" placeholder="学籍番号" value="${a.id}" required style="width: 100%; padding: 10px; border: 1px solid #e2e8f0; border-radius: 8px;">
                        </div>
                        <div class="form-group" style="margin-bottom: 0;">
                            <input type="email" class="add-email" placeholder="メールアドレス (任意)" value="${a.email || ''}" style="width: 100%; padding: 10px; border: 1px solid #e2e8f0; border-radius: 8px;">
                        </div>
                     `;
                    additionalAttendeesContainer.appendChild(div);
                });
            }
        }

        // Lock Duration
        const dur = document.getElementById('duration');
        if (dur) dur.disabled = true;

        // Set Edit Mode
        const modeEl = document.getElementById('editMode');
        if (modeEl) modeEl.value = 'true';
        const tsEl = document.getElementById('originalTimestamp');
        if (tsEl) tsEl.value = r.timestamp;

        // Change Button Text
        if (reservationForm) {
            const submitBtn = reservationForm.querySelector('.submit-btn');
            if (submitBtn) {
                submitBtn.textContent = '変更を保存する';
                submitBtn.style.background = '#3182ce';
            }
        }
    };

    // Safe Delete (Admin/Manual)
    const deleteReservation = (dateStr, index) => {
        if (!confirm('本当にこの予約を削除しますか？')) return;

        // Optimistic UI update or Wait? Better wait for safety.
        fetchFromGas('reservations').then(fetchedData => {
            let currentReservations = fetchedData || {};
            if (currentReservations[dateStr] && currentReservations[dateStr][index]) {
                currentReservations[dateStr].splice(index, 1);
                if (currentReservations[dateStr].length === 0) {
                    delete currentReservations[dateStr];
                }

                pushDataToGas('reservations', currentReservations).then(() => {
                    localStorage.setItem('miyamoto_reservations', JSON.stringify(currentReservations));
                    renderDashboard();
                    renderCalendar(currentDate);
                    // If in admin daily modal, refresh list
                    if (adminDayModal.classList.contains('show')) {
                        renderAdminReservationsList(dateStr);
                    }
                    alert('予約を削除しました');
                });
            } else {
                alert('予約が見つかりませんでした。既に削除されている可能性があります。');
                // Sync anyway
                syncDataWithGas(true);
            }
        });
    };

    const getOpenSlots = () => {
        const data = localStorage.getItem('miyamoto_open_slots');
        return data ? JSON.parse(data) : {};
    };

    const toggleOpenSlot = (dateStr, slot) => {
        const open = getOpenSlots();
        if (!open[dateStr]) {
            open[dateStr] = [];
        }

        const index = open[dateStr].indexOf(slot);
        if (index === -1) {
            open[dateStr].push(slot); // Add to open list (Make Available)
        } else {
            open[dateStr].splice(index, 1); // Remove from open list (Make Unavailable)
        }

        // Cleanup if empty
        if (open[dateStr].length === 0) {
            delete open[dateStr];
        }

        localStorage.setItem('miyamoto_open_slots', JSON.stringify(open));
        pushDataToGas('open_slots', open);
        renderCalendar(currentDate);
        renderDashboard();
    };

    const getAvailableSlots = (dateStr) => {
        const reservations = getReservations();
        const openSlotsMap = getOpenSlots();

        const daysReservations = reservations[dateStr] || [];
        const daysOpen = openSlotsMap[dateStr] || []; // Default is empty (No slots available)

        const bookedTimes = daysReservations.map(r => r.timeSlot);

        // Available = In Open List AND Not Booked
        return daysOpen.filter(slot => !bookedTimes.includes(slot));
    };

    const getDateConfig = () => JSON.parse(localStorage.getItem('miyamoto_date_config')) || {};
    const saveDateConfig = (c) => {
        localStorage.setItem('miyamoto_date_config', JSON.stringify(c));
        pushDataToGas('date_config', c);
        renderCalendar(currentDate);
    };

    // --- Helper Functions ---
    const toLocalYMD = (date) => {
        const offset = date.getTimezoneOffset() * 60000;
        const localDate = new Date(date.getTime() - offset);
        return localDate.toISOString().split('T')[0];
    };
    // Calendar Render Logic
    const renderCalendar = (date) => {
        calendarGrid.innerHTML = '';
        const year = date.getFullYear();
        const month = date.getMonth();

        // Update Header
        const monthNames = ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"];
        currentMonthDisplay.textContent = `${year}年 ${monthNames[month]}`;

        // Day Headers
        const days = ["日", "月", "火", "水", "木", "金", "土"];
        days.forEach(day => {
            const el = document.createElement('div');
            el.className = 'calendar-cell header-cell';
            el.textContent = day;
            calendarGrid.appendChild(el);
        });

        // Date Logic
        const firstDayOfMonth = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        // Empty cells for previous month
        for (let i = 0; i < firstDayOfMonth; i++) {
            const el = document.createElement('div');
            el.className = 'calendar-cell empty-cell';
            calendarGrid.appendChild(el);
        }

        // Days
        const today = new Date();

        for (let i = 1; i <= daysInMonth; i++) {
            const d = new Date(year, month, i);
            const dateStr = toLocalYMD(d);
            const el = document.createElement('div');
            el.className = 'calendar-cell';

            const isToday = toLocalYMD(new Date()) === dateStr;
            if (isToday) {
                el.classList.add('is-today');
            }



            // Render Date Number
            const numberEl = document.createElement('span');
            numberEl.className = 'date-number';
            numberEl.textContent = i;
            el.appendChild(numberEl);

            // Check if past
            if (d < new Date(today.setHours(0, 0, 0, 0))) {
                el.classList.add('past-date');
            } else {
                // Availability Logic
                const reservations = getReservations();
                const openSlotsMap = getOpenSlots();

                const daysReservations = reservations[dateStr] || [];
                const daysOpen = openSlotsMap[dateStr] || [];

                // Calculate available slots considering 'open' policy
                // A slot is available if:
                // 1. It is in daysOpen
                // 2. AND (It is NOT in bookedTimes OR It IS in bookedTimes but is 'open')

                let availableCount = 0;
                daysOpen.forEach(slot => {
                    const resInSlot = daysReservations.filter(r => r.timeSlot === slot);
                    if (resInSlot.length === 0) {
                        availableCount++; // Completely free
                    } else {
                        // Check if all reservations in this slot are open
                        const allOpen = resInSlot.every(r => r.privacyType === 'open');
                        if (allOpen) {
                            availableCount++; // Still available for joining
                        }
                    }
                });

                // Status Dots
                const statusContainer = document.createElement('div');
                statusContainer.className = 'availability-indicator';

                if (daysOpen.length === 0) {
                    // No slots defined for this day -> Inactive (Gray)
                    statusContainer.innerHTML = '<span class="dot inactive"></span>';
                } else if (availableCount <= 0) {
                    // Slots defined but all booked -> Full (Red)
                    statusContainer.innerHTML = '<span class="dot full"></span>';
                } else if (availableCount <= 2) {
                    statusContainer.innerHTML = '<span class="dot few"></span>';
                } else {
                    statusContainer.innerHTML = '<span class="dot available"></span>';
                }
                el.appendChild(statusContainer);

                // Booking Count Badge (New Feature)
                // Booking Count Badge (Modified)
                if (daysReservations.length > 0) {
                    // Count unique bookings by timestamp
                    const uniqueBookings = {};
                    daysReservations.forEach(r => {
                        const key = r.timestamp || (r.timeSlot + r.name);
                        if (!uniqueBookings[key]) {
                            uniqueBookings[key] = r;
                        }
                    });
                    const uniqueResList = Object.values(uniqueBookings);
                    uniqueResList.sort((a, b) => a.timeSlot.localeCompare(b.timeSlot));

                    const earliestTime = uniqueResList[0].timeSlot.split(' - ')[0];

                    const countBadge = document.createElement('div');
                    countBadge.className = 'booking-count-badge';
                    countBadge.textContent = `${earliestTime} (${uniqueResList.length}件)`;
                    el.appendChild(countBadge);
                }

                // Remaining Slots Badge (New Feature)
                if (availableCount > 0) {
                    const remainingBadge = document.createElement('div');
                    remainingBadge.className = 'remaining-count-badge';
                    remainingBadge.textContent = `残${availableCount}枠`;
                    el.appendChild(remainingBadge);
                }

                // Tooltip (Visualization of All Slots)
                const tooltip = document.createElement('div');
                tooltip.className = 'cell-tooltip';

                let tooltipHtml = '<div class="tooltip-title">予約状況</div><div class="tooltip-grid">';

                // Reuse existing variables daysReservations, daysOpen, bookedTimes
                timeSlots.forEach(slot => {
                    let className = 'tooltip-slot';
                    // Compatibility: Check exact match OR legacy "HH:MM - HH:MM" format
                    const isOpen = daysOpen.some(s => s === slot || s.startsWith(slot + ' '));
                    const isBooked = daysReservations.some(r => (r.timeSlot === slot || r.timeSlot.startsWith(slot + ' ')) && r.privacyType !== 'open'); // Booked if private
                    const hasOpenBooking = daysReservations.some(r => (r.timeSlot === slot || r.timeSlot.startsWith(slot + ' ')) && r.privacyType === 'open'); // Has open booking

                    if (isBooked) {
                        className += ' booked';
                    } else if (hasOpenBooking) {
                        className += ' shared'; // Indicate shared slot
                    } else if (!isOpen) {
                        // Not open means 'Blocked' in this context
                        className += ' blocked';
                    } else {
                        className += ' available';
                    }

                    // 15-minute slot handling
                    // const simpleTime = slot.split(' - ')[0]; // OLD
                    const simpleTime = slot; // NEW: slot is just "HH:MM"
                    tooltipHtml += `<div class="${className}">${simpleTime}</div>`;
                });
                tooltipHtml += '</div>';

                tooltip.innerHTML = tooltipHtml;
                el.appendChild(tooltip);

                // Add Click Event
                el.addEventListener('click', () => {
                    if (el.classList.contains('past-date')) return;

                    if (!isAdminMode) {
                        // Check Same Day Policy for THIS date
                        const dateConfig = getDateConfig();
                        const todayStr = toLocalYMD(new Date());

                        // If checking for Today, see if it is allowed
                        if (dateStr === todayStr) {
                            const config = dateConfig[dateStr] || {};
                            // Default to true. If explicitly false, block.
                            if (config.allowSameDay === false) {
                                alert('本日の当日予約は受け付けていません。');
                                return;
                            }
                        }
                        openBookingModal(d, dateStr);
                    } else {
                        openAdminModal(d, dateStr);
                    }
                });
            }

            calendarGrid.appendChild(el);
        }
    };

    const openBookingModal = (dateObj, dateStr) => {
        resetEditMode(); // Ensure clean state
        reservationForm.reset();
        modalDateTitle.textContent = `${dateObj.getMonth() + 1}月${dateObj.getDate()}日の予約`;
        modalDateTitle.dataset.date = dateStr;

        // Reset View
        bookingScheduleView.style.display = 'block';
        bookingFormContainer.style.display = 'none';

        // Render Schedule
        renderScheduleList(dateStr);

        reservationModal.classList.add('show');
    };

    const renderScheduleList = (dateStr) => {
        dailyScheduleList.innerHTML = '';
        const reservations = getReservations();
        const openSlotsMap = getOpenSlots();

        const daysReservations = reservations[dateStr] || [];
        const daysOpen = openSlotsMap[dateStr] || [];

        // Create a map for quick lookup of reservations by timeSlot
        const reservationMap = {};
        daysReservations.forEach(r => {
            if (!reservationMap[r.timeSlot]) reservationMap[r.timeSlot] = [];
            reservationMap[r.timeSlot].push(r);
        });

        let lastGroup = null;

        timeSlots.forEach(slot => {
            // Group Header Logic
            const hour = parseInt(slot.split(':')[0], 10);
            const currentGroup = hour < 12 ? '午前' : '午後';

            if (currentGroup !== lastGroup) {
                lastGroup = currentGroup;
                const header = document.createElement('div');
                header.innerHTML = `<span style="background:#edf2f7; padding:2px 8px; border-radius:4px; font-size:0.85rem; font-weight:bold; color:#4a5568;">${currentGroup}</span>`;
                header.style.margin = '1rem 0 0.5rem';
                dailyScheduleList.appendChild(header);
            }
            const slotDiv = document.createElement('div');
            slotDiv.className = 'schedule-item';

            // Analyze status of this slot
            // Compatibility: Check exact match OR legacy "HH:MM - HH:MM" format
            const resInThisSlot = daysReservations.filter(r => r.timeSlot === slot || r.timeSlot.startsWith(slot + ' '));
            const isBooked = resInThisSlot.length > 0;
            const isFullyBlocked = isBooked && resInThisSlot.some(r => r.privacyType !== 'open');
            const isOpenSlot = daysOpen.some(s => s === slot || s.startsWith(slot + ' '));

            if (!isOpenSlot) {
                // Not an open slot at all
                slotDiv.classList.add('blocked');
                slotDiv.innerHTML = `
                    <div class="time">${slot}</div>
                    <div class="status"><span class="badge blocked">✕</span></div>
                `;
            } else if (isFullyBlocked) {
                // Completely blocked (Private booking exists)
                slotDiv.classList.add('booked');
                // Show who booked it (first one)
                const mainRes = resInThisSlot.find(r => r.privacyType !== 'open') || resInThisSlot[0];

                // Check if cancelable
                // Check if cancelable/viewable
                let actionHtml = '';
                if (currentUserAccount) {
                    const isOwner = mainRes.studentId === currentUserAccount.studentId;
                    const isAttendee = mainRes.additionalAttendees && Array.isArray(mainRes.additionalAttendees) && mainRes.additionalAttendees.some(a => a.id === currentUserAccount.studentId);
                    const isAdmin = currentUserAccount.status === 'faculty' || currentUserAccount.status === 'admin';

                    if (isOwner || isAttendee || isAdmin) {
                        // Allow clicking the row to see details (and Edit)
                        slotDiv.style.cursor = 'pointer';
                        slotDiv.title = 'クリックして詳細を確認・修正';
                        slotDiv.classList.add('clickable-res'); // For potential CSS usage

                        // Inline hover effect for immediate feedback
                        const originalBg = slotDiv.style.backgroundColor;
                        slotDiv.addEventListener('mouseenter', () => slotDiv.style.opacity = '0.8');
                        slotDiv.addEventListener('mouseleave', () => slotDiv.style.opacity = '1');

                        slotDiv.addEventListener('click', () => showReservationDetails(mainRes, dateStr));

                        // Show Edit & Cancel Buttons
                        const editBtnHtml = `<button class="slot-edit-btn" style="margin-left:auto; margin-right:5px; z-index:10; padding:4px 10px; background:#3182ce; color:white; border:none; border-radius:4px; font-size:0.8rem; cursor:pointer;">詳細/修正</button>`;
                        const cancelBtnHtml = `<button class="slot-cancel-btn" data-date="${dateStr}" data-timestamp="${mainRes.timestamp}" style="z-index:10; padding:4px 10px; background:#e53e3e; color:white; border:none; border-radius:4px; font-size:0.8rem; cursor:pointer;">予約取消</button>`;

                        actionHtml = `<div style="display:flex; align-items:center;">${editBtnHtml}${cancelBtnHtml}</div>`;
                    }
                }

                if (actionHtml) {
                    // Layout with buttons and name below (similar to Shared view)
                    slotDiv.innerHTML = `
                        <div class="time">${slot}</div>
                        <div class="status" style="flex:1; display:flex; justify-content:space-between; align-items:center;">
                            <div style="display:flex; align-items:center;"><span class="badge booked">予約済</span></div>
                            <div style="display:flex; flex-direction:column; align-items:flex-end; gap:4px;">
                                ${actionHtml}
                                <span class="booker-name" style="font-size:0.75rem; color:#2d3748;">${mainRes.name} 様</span>
                            </div>
                        </div>
                     `;
                } else {
                    // Standard view for others
                    slotDiv.innerHTML = `
                        <div class="time">${slot}</div>
                        <div class="status" style="flex:1; display:flex; align-items:center; gap:10px;">
                            <span class="badge booked">予約済</span>
                            <span class="booker-name">${mainRes.name} 様</span>
                        </div>
                     `;
                }

                // Attach event for edit
                const editBtn = slotDiv.querySelector('.slot-edit-btn');
                if (editBtn) {
                    editBtn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        showReservationDetails(mainRes, dateStr);
                    });
                }

                // Attach event for cancel
                const cancelBtn = slotDiv.querySelector('.slot-cancel-btn');
                if (cancelBtn) {
                    cancelBtn.addEventListener('click', (e) => {
                        e.stopPropagation(); // Stop bubbling to prevent other clicks if any
                        if (confirm('この予約を取り消しますか？')) {
                            cancelReservation(cancelBtn.dataset.date, cancelBtn.dataset.timestamp);
                            // Refresh modal
                            setTimeout(() => renderScheduleList(dateStr), 100);
                        }
                    });
                }

            } else if (isBooked) {
                // Available but has existing OPEN bookings
                slotDiv.classList.add('available'); // It's still available!
                slotDiv.style.borderLeft = '4px solid #ecc94b'; // Yellow-ish for shared

                // Check cancelable for ANY of the open bookings I might be part of
                let myRes = null;
                if (currentUserAccount) {
                    myRes = resInThisSlot.find(r =>
                        r.studentId === currentUserAccount.studentId ||
                        (r.additionalAttendees && r.additionalAttendees.some(a => a.id === currentUserAccount.studentId))
                    );
                }

                let buttonHtml = `<button class="select-slot-btn" style="background:#d97706; color:white; font-weight:bold; border:none; padding:6px 14px; border-radius:6px; cursor:pointer; font-size:0.85rem; box-shadow: 0 2px 4px rgba(0,0,0,0.2); transition: background 0.2s;">予約する (同席)</button>`;

                if (myRes) {
                    const editBtnHtml = `<button class="slot-edit-btn" style="background:#3182ce; color:white; font-weight:bold; border:none; padding:6px 14px; border-radius:6px; cursor:pointer; font-size:0.85rem; box-shadow: 0 2px 4px rgba(0,0,0,0.2); transition: background 0.2s; z-index:10; margin-right:5px;">詳細/修正</button>`;
                    const cancelBtnHtml = `<button class="slot-cancel-btn" data-date="${dateStr}" data-timestamp="${myRes.timestamp}" style="background:#e53e3e; color:white; font-weight:bold; border:none; padding:6px 14px; border-radius:6px; cursor:pointer; font-size:0.85rem; box-shadow: 0 2px 4px rgba(0,0,0,0.2); transition: background 0.2s; z-index:10;">予約取消</button>`;
                    buttonHtml = `<div style="display:flex;">${editBtnHtml}${cancelBtnHtml}</div>`;

                    // Click on ROW opens details for MY reservation
                    slotDiv.style.cursor = 'pointer';
                    slotDiv.title = 'クリックして詳細を確認・修正';
                    slotDiv.addEventListener('mouseenter', () => slotDiv.style.backgroundColor = '#fefcbf'); // Highlight for shared
                    slotDiv.addEventListener('mouseleave', () => slotDiv.style.backgroundColor = '');

                    slotDiv.addEventListener('click', () => showReservationDetails(myRes, dateStr));
                }

                const names = resInThisSlot.map(r => r.name + " 様").join(', ');
                slotDiv.innerHTML = `
                    <div class="time">${slot}</div>
                    <div style="flex:1; display:flex; flex-direction:column; align-items:flex-end; gap:4px;">
                        ${buttonHtml}
                        <span style="font-size:0.75rem; color:#744210;">先約: ${names}</span>
                    </div>
                `;

                if (myRes) {
                    // Edit Button
                    const editBtn = slotDiv.querySelector('.slot-edit-btn');
                    if (editBtn) {
                        editBtn.addEventListener('click', (e) => {
                            e.stopPropagation();
                            showReservationDetails(myRes, dateStr);
                        });
                    }

                    // Cancel Button
                    const cancelBtn = slotDiv.querySelector('.slot-cancel-btn');
                    if (cancelBtn) {
                        cancelBtn.addEventListener('click', (e) => {
                            e.stopPropagation();
                            if (confirm('この予約を取り消しますか？')) {
                                cancelReservationSafe(dateStr, myRes.timestamp);
                                setTimeout(() => renderScheduleList(dateStr), 100);
                            }
                        });
                    }
                } else {
                    // Booking Logic (Join open slot)
                    const bookBtn = slotDiv.querySelector('.select-slot-btn');
                    if (bookBtn) {
                        bookBtn.addEventListener('click', (e) => {
                            e.stopPropagation(); // Stop row click if any
                            moveToBookingForm(slot);
                            const privacyRadios = document.getElementsByName('privacyType');
                            privacyRadios.forEach(r => {
                                if (r.value === 'open') r.checked = true;
                            });
                        });
                    }
                }

            } else {
                // Completely Free
                slotDiv.classList.add('available');
                slotDiv.innerHTML = `
                    <div class="time">${slot}</div>
                    <div style="flex:1; text-align:right;">
                        <button class="select-slot-btn" style="background:var(--color-primary); color:white; font-weight:bold; border:none; padding:6px 14px; border-radius:6px; cursor:pointer; font-size:0.85rem; box-shadow: 0 2px 4px rgba(0,0,0,0.1); transition: background 0.2s;">予約する</button>
                    </div>
                `;
                slotDiv.addEventListener('click', () => {
                    moveToBookingForm(slot);
                    // Reset Privacy
                    const privacyRadios = document.getElementsByName('privacyType');
                    privacyRadios.forEach(r => {
                        if (r.value === 'private') r.checked = true;
                    });
                });
            }
            dailyScheduleList.appendChild(slotDiv);
        });
    };

    const moveToBookingForm = (slot) => {
        timeSlotInput.value = slot; // Set hidden input
        selectedTimeDisplay.value = `${modalDateTitle.dataset.date}  ${slot} `;

        // Transition
        bookingScheduleView.style.display = 'none';
        bookingFormContainer.style.display = 'block';
        autoFillPersonalInfo(); // Pre-fill on move
    };

    backToScheduleBtn.addEventListener('click', () => {
        bookingFormContainer.style.display = 'none';
        bookingScheduleView.style.display = 'block';
    });

    // Admin Management Modal
    const openAdminModal = (dateObj, dateStr) => {
        adminDateTitle.textContent = `${dateObj.getMonth() + 1}月${dateObj.getDate()} 日の設定`;
        adminDateTitle.dataset.date = dateStr;

        // 1. Render Slots Checkboxes
        adminTimeSlots.innerHTML = '';
        const openSlotsMap = getOpenSlots();
        const daysOpen = openSlotsMap[dateStr] || [];

        // Permission Check
        const isFaculty = currentAdminUser && currentAdminUser.status === 'faculty';
        const isAdmin = currentAdminUser && currentAdminUser.status === 'admin';
        const isSystemAdmin = !currentAdminUser; // Fallback master account
        const canEdit = isFaculty || isAdmin || isSystemAdmin;

        // --- Daily Batch Controls Setup ---
        if (canEdit && dailyBatchStartTime && dailyBatchEndTime) {
            dailyBatchStartTime.innerHTML = '';
            dailyBatchEndTime.innerHTML = '';
            dailyBatchApplyBtn.disabled = false;
            dailyBatchApplyBtn.style.opacity = '1';

            // Helper for Time Calculation
            const getEndTime = (startTime) => {
                const [h, m] = startTime.split(':').map(Number);
                let endM = m + 15;
                let endH = h;
                if (endM >= 60) {
                    endM -= 60;
                    endH++;
                }
                return `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`;
            };

            timeSlots.forEach((slot, index) => {
                const start = slot;
                const end = getEndTime(slot);

                const optStart = document.createElement('option');
                optStart.value = index;
                optStart.textContent = start;
                dailyBatchStartTime.appendChild(optStart);

                const optEnd = document.createElement('option');
                optEnd.value = index;
                optEnd.textContent = end;
                if (index === timeSlots.length - 1) optEnd.selected = true;
                dailyBatchEndTime.appendChild(optEnd);
            });
            // Show container
            dailyBatchStartTime.parentElement.parentElement.style.display = 'block';
        } else {
            // Hide container if no permission
            if (dailyBatchStartTime) dailyBatchStartTime.parentElement.parentElement.style.display = 'none';
        }
        // ----------------------------------

        // Controls Container
        const controlsContainer = document.createElement('div');
        // Added grid-column: 1 / -1 to make it span full width in the grid
        controlsContainer.style.cssText = 'grid-column: 1 / -1; display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem; padding: 0.5rem; background: #f7fafc; border-radius: 4px; border: 1px solid #edf2f7; flex-wrap: wrap; gap: 8px;';

        const notice = document.createElement('div');
        notice.style.cssText = 'color: #4a5568; font-size: 0.85rem; display: flex; align-items: center; gap: 6px;';
        if (!canEdit) {
            notice.innerHTML = '<i class="fas fa-lock"></i> 教員・管理者のみ変更可能';
        } else {
            notice.innerHTML = '<i class="fas fa-info-circle" style="color:#4299e1;"></i> <span style="white-space:nowrap;">チェックを入れた枠が「予約可能」になります。</span>';
        }
        controlsContainer.appendChild(notice);

        // --- Clear All Button ---
        if (canEdit) {
            const clearBtn = document.createElement('button');
            clearBtn.textContent = 'すべてのチェックを外す';
            clearBtn.style.cssText = 'padding: 4px 10px; font-size: 0.8rem; background: #e53e3e; color: white; border: none; border-radius: 4px; cursor: pointer; white-space: nowrap;';
            clearBtn.addEventListener('click', () => {
                const checkboxes = adminTimeSlots.querySelectorAll('input[type="checkbox"].slot-checkbox');
                checkboxes.forEach(cb => {
                    cb.checked = false;
                    // Trigger change event to update state immediately
                    cb.dispatchEvent(new Event('change'));
                });
            });
            controlsContainer.appendChild(clearBtn);
        }

        adminTimeSlots.appendChild(controlsContainer);

        // Date-Specific Settings (Same Day Booking)
        if (canEdit) {
            const dateConfig = getDateConfig();
            const currentConfig = dateConfig[dateStr] || {};
            const isAllowed = currentConfig.allowSameDay !== false; // Default true

            const settingsDiv = document.createElement('div');
            // Added grid-column: 1 / -1 to make it span full width
            settingsDiv.style.gridColumn = '1 / -1';
            settingsDiv.style.marginBottom = '1rem';
            settingsDiv.style.textAlign = 'right'; // Align to right or left as preferred

            const sameDayLabel = document.createElement('label');
            sameDayLabel.className = 'slot-checkbox-label';
            sameDayLabel.style.fontWeight = 'bold';
            sameDayLabel.style.display = 'inline-flex'; // Fix display
            sameDayLabel.style.width = 'auto'; // Auto width
            sameDayLabel.innerHTML = `
                <input type="checkbox" id="adminSameDayToggle">
                <div style="margin-left:8px;">当日予約を許可 <span style="font-weight:normal; font-size:0.85rem; color:#718096;">(この日のみ)</span></div>
            `;
            const sameDayCheckbox = sameDayLabel.querySelector('#adminSameDayToggle');
            sameDayCheckbox.checked = isAllowed;

            sameDayCheckbox.addEventListener('change', () => {
                if (!dateConfig[dateStr]) dateConfig[dateStr] = {};
                dateConfig[dateStr].allowSameDay = sameDayCheckbox.checked;
                saveDateConfig(dateConfig);
                toast.textContent = '設定を保存しました';
                toast.className = 'toast show success';
                setTimeout(() => toast.className = 'toast', 3000);
            });

            settingsDiv.appendChild(sameDayLabel);
            adminTimeSlots.appendChild(settingsDiv);
        }

        // Group slots by AM/PM
        const amSlots = [];
        const pmSlots = [];
        timeSlots.forEach((slot, index) => {
            const hour = parseInt(slot.split(':')[0], 10);
            if (hour < 12) amSlots.push({ slot, index });
            else pmSlots.push({ slot, index });
        });

        const renderSlotGroup = (groupSlots, title) => {
            const groupHeader = document.createElement('h5');
            groupHeader.textContent = title;
            groupHeader.style.cssText = 'width: 100%; margin: 1rem 0 0.5rem; color: #2c5282; border-bottom: 1px solid #e2e8f0; padding-bottom: 0.25rem;';
            adminTimeSlots.appendChild(groupHeader);

            const gridContainer = document.createElement('div');
            gridContainer.className = 'admin-slots-grid';
            // Adjust grid for more items (4 columns)
            gridContainer.style.gridTemplateColumns = 'repeat(auto-fill, minmax(80px, 1fr))';

            groupSlots.forEach(({ slot, index }) => {
                const label = document.createElement('label');
                label.className = 'slot-checkbox-label';
                label.style.fontSize = '0.8rem'; // Slightly smaller font
                if (!canEdit) {
                    label.style.opacity = '0.6';
                    label.style.cursor = 'not-allowed';
                }

                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.className = 'slot-checkbox';

                // Compatibility check: Match exact slot OR legacy format starting with slot
                const isChecked = daysOpen.some(openSlot => openSlot === slot || openSlot.startsWith(slot + ' '));
                checkbox.checked = isChecked;

                checkbox.disabled = !canEdit;

                checkbox.addEventListener('change', () => {
                    const newDaysOpen = getOpenSlots()[dateStr] || [];
                    if (checkbox.checked) {
                        if (!newDaysOpen.includes(slot)) newDaysOpen.push(slot);
                    } else {
                        // Remove exact or legacy matches
                        const removeIdx = newDaysOpen.findIndex(s => s === slot || s.startsWith(slot + ' '));
                        if (removeIdx !== -1) newDaysOpen.splice(removeIdx, 1);
                    }
                    // Sort slots
                    newDaysOpen.sort();

                    const openSlots = getOpenSlots();
                    openSlots[dateStr] = newDaysOpen;
                    saveOpenSlots(openSlots);

                    renderCalendar(currentDate); // Refresh UI
                });

                checkbox.dataset.index = index;

                label.appendChild(checkbox);
                label.appendChild(document.createTextNode(slot)); // Just display start time
                gridContainer.appendChild(label);
            });
            adminTimeSlots.appendChild(gridContainer);
        };

        if (amSlots.length > 0) renderSlotGroup(amSlots, '午前 (AM)');
        if (pmSlots.length > 0) renderSlotGroup(pmSlots, '午後 (PM)');

        // 2. Render Existing Reservations
        renderAdminReservationsList(dateStr);

        adminDayModal.classList.add('show');
    };

    const renderAdminReservationsList = (dateStr) => {
        adminReservationsList.innerHTML = '';
        const reservations = getReservations();
        let dayReservations = reservations[dateStr] || [];

        // Sort by time
        dayReservations.sort((a, b) => a.timeSlot.localeCompare(b.timeSlot));

        if (dayReservations.length === 0) {
            adminReservationsList.innerHTML = '<li style="color:#aaa; font-style:italic;">予約はありません</li>';
            return;
        }

        const MAX_SHOW = 3;
        const hasMore = dayReservations.length > MAX_SHOW;

        dayReservations.forEach((res, index) => {
            const li = createReservationListItem(res, dateStr, index, () => {
                renderAdminReservationsList(dateStr);
            });

            // Hide items beyond limit
            if (index >= MAX_SHOW) {
                li.style.display = 'none';
                li.classList.add('admin-res-hidden');
            }

            adminReservationsList.appendChild(li);
        });

        if (hasMore) {
            const btnLi = document.createElement('li');
            btnLi.style.cssText = 'list-style:none; padding:0; border:none; background:none; text-align: center; margin-top: 8px;';

            const showMoreBtn = document.createElement('button');
            showMoreBtn.textContent = `すべて表示 (${dayReservations.length}件)`;
            showMoreBtn.style.cssText = 'width:100%; padding:8px; background:#edf2f7; color:#4a5568; border:none; border-radius:4px; font-size:0.85rem; cursor:pointer; font-weight:bold; transition: background 0.2s;';

            showMoreBtn.addEventListener('mouseenter', () => showMoreBtn.style.background = '#e2e8f0');
            showMoreBtn.addEventListener('mouseleave', () => showMoreBtn.style.background = '#edf2f7');

            let expanded = false;
            showMoreBtn.addEventListener('click', () => {
                const hiddenItems = adminReservationsList.querySelectorAll('.admin-res-hidden');
                if (!expanded) {
                    hiddenItems.forEach(item => item.style.display = 'flex'); // Use flex as createReservationListItem sets layout
                    showMoreBtn.textContent = '折りたたむ';
                    expanded = true;
                } else {
                    hiddenItems.forEach(item => item.style.display = 'none');
                    showMoreBtn.textContent = `すべて表示 (${dayReservations.length}件)`;
                    expanded = false;
                }
            });

            btnLi.appendChild(showMoreBtn);
            adminReservationsList.appendChild(btnLi);
        }
    };

    const createReservationListItem = (res, dateStr, index, callback) => {
        const li = document.createElement('li');
        li.className = 'reservation-item';
        // Use Flexbox to separate content and delete button
        li.style.cssText = 'display: flex; justify-content: space-between; align-items: flex-start; padding: 10px; border-bottom: 1px solid #edf2f7; cursor: pointer; transition: background 0.2s;';
        li.title = 'クリックして詳細を確認';

        li.addEventListener('mouseenter', () => li.style.background = '#f7fafc');
        li.addEventListener('mouseleave', () => li.style.background = 'transparent');

        li.innerHTML = `
            <div class="reservation-info" style="flex:1;">
                <span class="reservation-time" style="font-weight:bold; color:#2c5282;">${res.timeSlot}</span>
                <span style="font-weight:500;">${res.name} <span style="font-size:0.9em; color:#718096;">(${res.studentId})</span></span>
                <div style="font-size:0.8rem; color:#718096; margin-top:2px;">${res.email || 'No Email'}</div>
                <div style="font-size:0.8rem; margin-top:4px;">
                    <span style="background:#e6fffa; color:#2c7a7b; padding:1px 6px; border-radius:4px; margin-right:4px;">${translateFormat(res.format)}</span>
                    <span style="background:#fffaf0; color:#9c4221; padding:1px 6px; border-radius:4px;">${translateType(res.type)}</span>
                     ${res.privacyType === 'open' ? '<span style="background:#feebc8; color:#744210; padding:1px 6px; border-radius:4px; margin-left:4px;">同席可</span>' : ''}
                </div>
            </div>
            <button class="delete-btn" style="margin-left: 10px; color: #e53e3e; background: none; border: 1px solid #fed7d7; padding: 4px 8px; border-radius: 4px; font-size: 0.8rem; cursor: pointer; white-space: nowrap;">削除</button>
        `;

        // Click to View Details
        li.addEventListener('click', () => {
            showReservationDetails(res, dateStr);
        });

        // Delete Button Logic
        const delBtn = li.querySelector('.delete-btn');
        delBtn.addEventListener('mouseenter', () => {
            delBtn.style.background = '#fed7d7';
        });
        delBtn.addEventListener('mouseleave', () => {
            delBtn.style.background = 'none';
        });
        delBtn.addEventListener('click', (e) => {
            e.stopPropagation(); // Stop bubbling to standard click
            if (confirm(`【確認】\n${res.name} さんの予約を削除してもよろしいですか？\nこの操作は取り消せません。`)) {
                deleteReservation(dateStr, index);
                callback(); // Update List
                renderCalendar(currentDate); // Refresh main cal
            }
        });
        return li;
    };

    // All Reservations Logic
    if (allReservationsBtn) {
        allReservationsBtn.addEventListener('click', () => {
            // Reset view to Future when opening
            showingPastReservations = false;
            renderAllReservations();
            allReservationsModal.classList.add('show');
        });
    }

    let showingPastReservations = false;
    const togglePastReservationsBtn = document.getElementById('togglePastReservationsBtn');

    if (togglePastReservationsBtn) {
        togglePastReservationsBtn.addEventListener('click', () => {
            showingPastReservations = !showingPastReservations;
            renderAllReservations();

            // Update button text
            if (showingPastReservations) {
                togglePastReservationsBtn.innerHTML = '<i class="fas fa-calendar-alt"></i> 現在の予約を表示';
            } else {
                togglePastReservationsBtn.innerHTML = '<i class="fas fa-history"></i> 過去の予約を表示';
            }
        });
    }

    const renderAllReservations = () => {
        allReservationsList.innerHTML = '';
        const reservations = getReservations();
        let allRes = [];

        // Flatten
        Object.keys(reservations).forEach(dateStr => {
            reservations[dateStr].forEach((res, index) => {
                allRes.push({ ...res, dateStr, originalIndex: index });
            });
        });

        // Filter based on toggle
        const todayStr = toLocalYMD(new Date());
        if (showingPastReservations) {
            allRes = allRes.filter(r => r.dateStr < todayStr);
        } else {
            allRes = allRes.filter(r => r.dateStr >= todayStr);
        }

        // Sort by Date
        // DESC for past, ASC for future
        if (showingPastReservations) {
            allRes.sort((a, b) => new Date(b.dateStr + ' ' + b.timeSlot.split(' - ')[0]) - new Date(a.dateStr + ' ' + a.timeSlot.split(' - ')[0]));
        } else {
            allRes.sort((a, b) => new Date(a.dateStr + ' ' + a.timeSlot.split(' - ')[0]) - new Date(b.dateStr + ' ' + b.timeSlot.split(' - ')[0]));
        }

        if (allRes.length === 0) {
            allReservationsList.innerHTML = '<li style="color:#aaa; font-style:italic;">予約はありません</li>';
            return;
        }

        // Group by Date for cleaner view
        let lastDate = '';
        allRes.forEach(res => {
            // Check if date changed
            if (res.dateStr !== lastDate) {
                lastDate = res.dateStr;
                const d = new Date(res.dateStr);
                const dayName = ["日", "月", "火", "水", "木", "金", "土"][d.getDay()];

                const dateHeader = document.createElement('div');
                dateHeader.style.cssText = 'background: #edf2f7; padding: 6px 10px; margin-top: 12px; margin-bottom: 6px; border-radius: 4px; font-weight: 700; color: #2d3748; font-size: 0.95rem; border-left: 4px solid var(--color-primary);';
                dateHeader.textContent = `${res.dateStr} (${dayName})`;
                allReservationsList.appendChild(dateHeader);
            }

            // Re-find index (naive but safe given structure)
            const currentReservations = getReservations();
            const idx = currentReservations[res.dateStr].findIndex(r => r.timestamp === res.timestamp);

            if (idx !== -1) {
                const li = createReservationListItem(res, res.dateStr, idx, () => {
                    renderAllReservations(); // Refresh self
                });
                // Slightly indent list items
                li.style.marginLeft = '0.5rem';
                allReservationsList.appendChild(li);
            }
        });
    };

    if (copyAllDataBtn) {
        copyAllDataBtn.addEventListener('click', () => {
            const reservations = getReservations();
            const text = JSON.stringify(reservations, null, 2);
            navigator.clipboard.writeText(text).then(() => {
                alert('予約データをクリップボードにコピーしました（JSON形式）');
            });
        });
    }

    const translateType = (type) => {
        const types = { 'research': '研究相談', 'report': '進捗報告', 'other': 'その他' };
        return types[type] || type;
    };

    const translateFormat = (fmt) => {
        const formats = { 'presential': '対面', 'remote': 'リモート' };
        return formats[fmt] || fmt || '対面'; // Default to presential for old data
    };

    const translateStatus = (status) => {
        const statuses = { 'admin': 'システム管理者', 'faculty': '教員', 'student_undergrad': '学部生', 'student_master': '院生' };
        return statuses[status] || status;
    };

    // Owner Management Logic
    if (ownerManagementBtn) {
        ownerManagementBtn.addEventListener('click', () => {
            renderOwnerList();
            ownerManagementModal.classList.add('show');
        });
    }

    let editingOwnerIndex = -1; // State to track editing

    const renderOwnerList = () => {
        if (!ownerList) return;
        ownerList.innerHTML = '';
        const owners = getOwners();

        if (owners.length === 0) {
            ownerList.innerHTML = '<li style="color:#aaa; font-style:italic;">登録されたオーナーはいません</li>';
            return;
        }

        // Permission Logic
        // System Admin (null currentAdminUser) or Faculty/Admin Role -> Full Access
        const isSystemAdmin = !currentAdminUser;
        const isFaculty = currentAdminUser && currentAdminUser.status === 'faculty';
        const isAdmin = currentAdminUser && currentAdminUser.status === 'admin';
        const hasFullAccess = isSystemAdmin || isFaculty || isAdmin;

        owners.forEach((owner, index) => {
            const li = document.createElement('li');
            li.className = 'reservation-item';

            // Check if this owner is the current user (Self)
            // Use precise matching if possible, falling back to name+email
            let isSelf = false;
            if (currentAdminUser) {
                isSelf = (owner.email === currentAdminUser.email && owner.name === currentAdminUser.name);
            }

            // Determine Button Visibility
            const canEdit = hasFullAccess || isSelf;
            const canDelete = hasFullAccess; // Students cannot delete anyone (even themselves, to be safe/simple)

            let buttonsHtml = '';
            if (canEdit) {
                buttonsHtml += `<button class="owner-action-btn edit"><i class="fas fa-edit"></i> 編集</button>`;
            }
            if (canDelete) {
                buttonsHtml += `<button class="owner-action-btn delete"><i class="fas fa-trash-alt"></i> 削除</button>`;
            }

            li.innerHTML = `
                <div class="reservation-info">
                    <span style="font-weight:600; color:var(--color-primary);">${owner.name}</span>
                    <span style="font-size:0.85em; background:#edf2f7; padding:2px 6px; border-radius:4px; margin-left:6px;">${translateStatus(owner.status)}</span><br>
                    <span style="font-size:0.85em; color:#666;">${owner.email}</span>
                    ${owner.notify ? '<span style="font-size:0.8em; color:var(--color-success); margin-left:4px;"><i class="fas fa-bell"></i> 通知ON</span>' : '<span style="font-size:0.8em; color:#a0aec0; margin-left:4px;"><i class="fas fa-bell-slash"></i> 通知OFF</span>'}
                </div>
                <div class="reservation-actions">
                    ${buttonsHtml}
                </div>
            `;

            // Delete Event
            if (canDelete) {
                const delBtn = li.querySelector('.owner-action-btn.delete');
                if (delBtn) {
                    delBtn.addEventListener('click', () => {
                        if (confirm(`${owner.name} さんを削除してもよろしいですか？`)) {
                            owners.splice(index, 1);
                            saveOwners(owners);
                            renderOwnerList();
                        }
                    });
                }
            }

            // Edit Event
            if (canEdit) {
                const editBtn = li.querySelector('.owner-action-btn.edit');
                if (editBtn) {
                    editBtn.addEventListener('click', () => {
                        startEditOwner(index, owner);
                    });
                }
            }

            ownerList.appendChild(li);
        });
    };

    const startEditOwner = (index, owner) => {
        editingOwnerIndex = index;

        // Populate Form
        document.getElementById('ownerName').value = owner.name;
        document.getElementById('ownerStatus').value = owner.status;
        document.getElementById('ownerEmail').value = owner.email;
        document.getElementById('ownerPassword').value = owner.password || '';
        document.getElementById('ownerNotify').checked = owner.notify !== false;

        // Change UI to Edit Mode
        const submitBtn = addOwnerForm.querySelector('button[type="submit"]');
        submitBtn.textContent = '更新する';
        submitBtn.style.background = '#3182ce';

        // Add Cancel Button if not exists
        let cancelBtn = document.getElementById('cancelOwnerEditBtn');
        if (!cancelBtn) {
            cancelBtn = document.createElement('button');
            cancelBtn.id = 'cancelOwnerEditBtn';
            cancelBtn.type = 'button';
            cancelBtn.textContent = 'キャンセル';
            cancelBtn.style.cssText = 'padding: 0.5rem; font-size: 0.9rem; background: #718096; color: white; border: none; border-radius: 4px; margin-left: 10px; cursor: pointer;';
            cancelBtn.addEventListener('click', cancelEditOwner);
            addOwnerForm.querySelector('.actions') ?
                addOwnerForm.querySelector('.actions').appendChild(cancelBtn) : // Fallback if structure differs
                submitBtn.parentNode.insertBefore(cancelBtn, submitBtn.nextSibling); // Just append next to submit
        }
        // Ensure Cancel button is visible (if we were already in edit mode)
        cancelBtn.style.display = 'inline-block';

        // Scroll to top of modal to show form
        ownerManagementModal.querySelector('.modal-content').scrollTop = 0;
    };

    const cancelEditOwner = () => {
        editingOwnerIndex = -1;
        addOwnerForm.reset();
        document.getElementById('ownerNotify').checked = true;

        const submitBtn = addOwnerForm.querySelector('button[type="submit"]');
        submitBtn.textContent = '追加する';
        submitBtn.style.background = ''; // Revert to CSS default

        const cancelBtn = document.getElementById('cancelOwnerEditBtn');
        if (cancelBtn) cancelBtn.style.display = 'none';
    };

    if (addOwnerForm) {
        addOwnerForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const name = document.getElementById('ownerName').value;
            const status = document.getElementById('ownerStatus').value;
            const email = document.getElementById('ownerEmail').value;
            const password = document.getElementById('ownerPassword').value;
            const notify = document.getElementById('ownerNotify').checked;

            const owners = getOwners();

            if (editingOwnerIndex >= 0) {
                // UPDATE Existing
                if (editingOwnerIndex < owners.length) {
                    owners[editingOwnerIndex] = { name, status, email, password, notify };
                    saveOwners(owners);

                    // If editing self, update the current session reference lightly
                    if (currentAdminUser && currentAdminUser.name === owners[editingOwnerIndex].name) { // Heuristic check
                        // If we track index, this would be safer. 
                        // For now, just copy the props to ensure UI stays consistent until reload
                        Object.assign(currentAdminUser, owners[editingOwnerIndex]);
                        updateAdminUI(); // Name might have changed
                    }

                    alert(`${name} さんの情報を更新しました。`);
                }
                cancelEditOwner(); // Exit edit mode
            } else {
                // CREATE New
                const newOwner = { name, status, email, password, notify };
                owners.push(newOwner);
                saveOwners(owners);

                addOwnerForm.reset();
                document.getElementById('ownerNotify').checked = true;
                alert(`${newOwner.name} さんを追加しました。\n初期パスワード: ${newOwner.password}`);
            }

            renderOwnerList();
        });
    }

    // Batch Registration Logic
    if (batchRegistrationBtn) {
        batchRegistrationBtn.addEventListener('click', () => {
            // Populate Time Selects
            batchStartTime.innerHTML = '';
            batchEndTime.innerHTML = '';
            timeSlots.forEach((slot, index) => {
                const start = slot;
                // Calculate end time dynamically for 15-min slots
                const [h, m] = start.split(':').map(Number);
                let endM = m + 15;
                let endH = h;
                if (endM >= 60) {
                    endM -= 60;
                    endH++;
                }
                const end = `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`;

                const optStart = document.createElement('option');
                optStart.value = index; // Use index for ease
                optStart.textContent = start;
                batchStartTime.appendChild(optStart);

                const optEnd = document.createElement('option');
                optEnd.value = index;
                optEnd.textContent = end;
                if (index === timeSlots.length - 1) optEnd.selected = true; // Default to last
                batchEndTime.appendChild(optEnd);
            });

            // Set default dates (Today ~ 1 month later)
            const today = new Date();
            batchStartDate.value = toLocalYMD(today);
            const nextMonth = new Date(today);
            nextMonth.setMonth(today.getMonth() + 1);
            batchEndDate.value = toLocalYMD(nextMonth);

            batchRegistrationModal.classList.add('show');
        });
    }

    // Daily Batch Apply Logic
    if (dailyBatchApplyBtn) {
        dailyBatchApplyBtn.addEventListener('click', () => {
            const dateStr = adminDateTitle.dataset.date;
            if (!dateStr) return;

            const startIndex = parseInt(dailyBatchStartTime.value);
            const endIndex = parseInt(dailyBatchEndTime.value);

            if (startIndex > endIndex) {
                alert('終了時間は開始時間より後に設定してください。');
                return;
            }

            const openSlots = getOpenSlots();

            // Overwrite: Create a fresh array for this date with exactly the specified range
            const newRangeSlots = [];
            for (let i = startIndex; i <= endIndex; i++) {
                newRangeSlots.push(timeSlots[i]);
            }
            openSlots[dateStr] = newRangeSlots;

            localStorage.setItem('miyamoto_open_slots', JSON.stringify(openSlots));

            // 1. Update UI immediately (Local)
            renderCalendar(currentDate);
            renderDashboard();
            openAdminModal(new Date(dateStr), dateStr);
            showToast('予約枠を更新しました');

            // 2. Sync to GAS in the background (Non-blocking)
            pushDataToGas('open_slots', openSlots);
        });
    }

    // Dynamic Attendee Fields
    if (attendeesInput) {
        attendeesInput.addEventListener('input', () => {
            const count = parseInt(attendeesInput.value) || 1;
            additionalAttendeesContainer.innerHTML = '';

            if (count > 1) {
                const users = getUsers();
                // Filter out current user if logged in
                const otherUsers = currentUserAccount ? users.filter(u => u.studentId !== currentUserAccount.studentId) : users;

                for (let i = 1; i < count; i++) {
                    const div = document.createElement('div');
                    div.style.marginBottom = '1.5rem';
                    div.style.padding = '1rem';
                    div.style.backgroundColor = '#f8fafc';
                    div.style.borderRadius = '8px';
                    div.style.border = '1px solid #e2e8f0';
                    div.style.position = 'relative';

                    let userOptions = '<option value="">登録ユーザーから選択 (任意)</option>';
                    otherUsers.forEach(u => {
                        userOptions += `<option value="${u.studentId}">${u.name} (${u.studentId})</option>`;
                    });

                    div.innerHTML = `
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.8rem;">
                            <h5 style="font-size: 0.9rem; color: #4a5568; margin: 0;">参加者 ${i + 1}</h5>
                            <select class="user-picker" style="font-size: 0.75rem; padding: 4px 8px; border-radius: 6px; border: 1px solid #cbd5e0; background: white; cursor: pointer;">
                                ${userOptions}
                            </select>
                        </div>
                        <div class="form-group" style="margin-bottom: 0.5rem;">
                            <input type="text" class="add-name" placeholder="氏名" required style="width: 100%; padding: 10px; border: 1px solid #e2e8f0; border-radius: 8px;">
                        </div>
                        <div class="form-group" style="margin-bottom: 0.5rem;">
                            <input type="text" class="add-id" placeholder="学籍番号" required style="width: 100%; padding: 10px; border: 1px solid #e2e8f0; border-radius: 8px;">
                        </div>
                        <div class="form-group" style="margin-bottom: 0;">
                            <input type="email" class="add-email" placeholder="メールアドレス (任意)" style="width: 100%; padding: 10px; border: 1px solid #e2e8f0; border-radius: 8px;">
                        </div>
                    `;

                    const picker = div.querySelector('.user-picker');
                    const nameInp = div.querySelector('.add-name');
                    const idInp = div.querySelector('.add-id');
                    const emailInp = div.querySelector('.add-email');

                    picker.addEventListener('change', (e) => {
                        const selectedId = e.target.value;
                        if (selectedId) {
                            const user = users.find(u => u.studentId === selectedId);
                            if (user) {
                                nameInp.value = user.name;
                                idInp.value = user.studentId;
                                // Only fill email if they want notifications
                                emailInp.value = user.notify !== false ? user.email : '';

                                // Visual feedback
                                [nameInp, idInp, emailInp].forEach(inp => {
                                    if (inp.value) inp.style.backgroundColor = '#f0fff4';
                                    else inp.style.backgroundColor = '';
                                });
                            }
                        } else {
                            nameInp.value = '';
                            idInp.value = '';
                            emailInp.value = '';
                            [nameInp, idInp, emailInp].forEach(inp => inp.style.backgroundColor = '');
                        }
                    });

                    additionalAttendeesContainer.appendChild(div);
                }
            }
        });
    }

    if (batchRegistrationForm) {
        batchRegistrationForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const startDate = new Date(batchStartDate.value);
            const endDate = new Date(batchEndDate.value);
            const startIndex = parseInt(batchStartTime.value);
            const endIndex = parseInt(batchEndTime.value);

            if (startDate > endDate) {
                alert('終了日は開始日より後に設定してください。');
                return;
            }

            if (startIndex > endIndex) {
                alert('終了時間は開始時間より後に設定してください。');
                return;
            }

            const selectedDays = Array.from(document.querySelectorAll('input[name="batchDay"]:checked')).map(cb => parseInt(cb.value));

            if (selectedDays.length === 0) {
                alert('曜日を少なくとも1つ選択してください。');
                return;
            }

            const openSlots = getOpenSlots();

            // Iterate Dates
            for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
                if (selectedDays.includes(d.getDay())) {
                    const dateStr = toLocalYMD(d);

                    // Overwrite: Reset this date to exactly the specified range
                    const newRangeSlots = [];
                    for (let i = startIndex; i <= endIndex; i++) {
                        newRangeSlots.push(timeSlots[i]);
                    }
                    openSlots[dateStr] = newRangeSlots;
                }
            }

            localStorage.setItem('miyamoto_open_slots', JSON.stringify(openSlots));

            // 1. Update UI immediately and close modal
            renderCalendar(currentDate);
            renderDashboard();
            batchRegistrationModal.classList.remove('show');
            showToast('一括更新を完了しました');

            // 2. Sync to GAS in the background
            pushDataToGas('open_slots', openSlots).catch(err => {
                console.error('Background sync failed:', err);
                if (syncDataBtn) syncDataBtn.classList.add('sync-error');
            });
        });
    }

    // Form Submit
    // Form Submit
    reservationForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const datesStr = modalDateTitle.dataset.date;
        const durationSteps = parseInt(document.getElementById('duration').value); // 1=30m, 2=60m...
        const startTimeSlot = document.getElementById('timeSlot').value; // e.g., "10:00 - 10:30"

        // Find start index
        const startIndex = timeSlots.indexOf(startTimeSlot);
        if (startIndex === -1) {
            alert('不正な時間枠です。');
            return;
        }

        // Calculate needed slots
        const neededSlots = [];
        for (let i = 0; i < durationSteps; i++) {
            if (startIndex + i >= timeSlots.length) {
                alert('営業時間外の枠が含まれるため予約できません。');
                return;
            }
            neededSlots.push(timeSlots[startIndex + i]);
        }

        // Calculate End Time Display (e.g. "10:00 - 11:30")
        const firstSlotTime = neededSlots[0];
        const lastSlotTime = neededSlots[neededSlots.length - 1];

        // Helper to get 15 min later
        const getEndTimeForCalc = (t) => {
            const [h, m] = t.split(':').map(Number);
            let endM = m + 15;
            let endH = h;
            if (endM >= 60) { endM -= 60; endH++; }
            return `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`;
        };
        const endTime = getEndTimeForCalc(lastSlotTime);
        const displayTimeRange = `${firstSlotTime} - ${endTime}`;

        // Collect Additional Attendees
        const additionalAttendees = [];
        const additionalElements = additionalAttendeesContainer.querySelectorAll('div[style*="margin-bottom: 1.5rem"]');
        additionalElements.forEach(el => {
            const name = el.querySelector('.add-name').value;
            const id = el.querySelector('.add-id').value;
            const email = el.querySelector('.add-email').value;
            if (name) { // Name is required, email is optional
                additionalAttendees.push({ name, id, email });
            }
        });

        const formData = {
            name: document.getElementById('name').value,
            studentId: document.getElementById('studentId').value,
            // email: document.getElementById('email').value, // Duplicated in source, removed
            email: document.getElementById('email').value,
            format: document.getElementById('format').value,
            timeSlot: displayTimeRange,
            type: document.getElementById('type').value,
            attendees: document.getElementById('attendees').value,
            additionalAttendees: additionalAttendees,
            privacyType: document.querySelector('input[name="privacyType"]:checked').value, // 'private' or 'open'
            remarks: '',
            timestamp: new Date().toISOString(),
            rawSlots: neededSlots
        };

        const reservations = getReservations();
        const openSlotsMap = getOpenSlots();
        const dayOpenSlots = openSlotsMap[datesStr] || [];
        const dayReservations = reservations[datesStr] || [];

        // Check availability for ALL slots
        const isEditMode = document.getElementById('editMode') ? document.getElementById('editMode').value === 'true' : false;
        const originalTs = document.getElementById('originalTimestamp') ? document.getElementById('originalTimestamp').value : '';

        // Initialize Checks
        let collision = false;
        let notOpen = false;
        let privacyError = false;

        for (const slot of neededSlots) {
            // Check availability (Exact match OR Legacy "HH:MM - HH:MM")
            const isOpen = dayOpenSlots.some(s => s === slot || s.startsWith(slot + ' '));

            if (!isOpen) {
                notOpen = true;
                break;
            }

            const existingRes = dayReservations.filter(r => r.timeSlot === slot);

            if (existingRes.length > 0) {
                // Filter out SELF if editing
                const others = isEditMode ? existingRes.filter(r => {
                    const key = r.timestamp || (r.timeSlot + r.name);
                    return key !== originalTs;
                }) : existingRes;

                if (others.length > 0) {
                    if (others.some(r => r.privacyType !== 'open')) {
                        collision = true;
                        break;
                    }
                    if (formData.privacyType === 'private') {
                        privacyError = true;
                        break;
                    }
                }
            }
        }

        if (notOpen) {
            alert('申し訳ありません、選択された時間帯の一部が予約受付していない枠です。');
            return;
        }
        if (collision) {
            // Generic message
            alert('申し訳ありません、選択された時間帯の一部が既に「予約済み（個別）」で埋まっています。');
            return;
        }
        if (privacyError) {
            alert('この時間帯は「同席可（オープン枠）」として予約されています。\n個別面談を入れることはできません。「同席を許可」を選択するか、別の時間帯を選んでください。');
            return;
        }

        // If Edit Mode: Delete old first
        if (isEditMode && originalTs) {
            if (reservations[datesStr]) {
                reservations[datesStr] = reservations[datesStr].filter(r => {
                    const key = r.timestamp || (r.timeSlot + r.name);
                    return key !== originalTs;
                });
            }
        }

        // Disable button to prevent double-submit
        const submitBtn = reservationForm.querySelector('.submit-btn');
        const originalBtnText = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.textContent = '保存中...';

        // SAFE SAVE: Fetch latest data first
        // SAFE SAVE: Use Server-Side Transaction

        // Prepare Notification Data
        const owners = getOwners();
        const ownerEmails = owners.filter(o => o.notify && o.email).map(o => o.email).join(',');

        let studentEmails = [];
        if (formData.email && formData.email.trim() !== '') studentEmails.push(formData.email);
        additionalAttendees.forEach(a => { if (a.email) studentEmails.push(a.email); });
        const allStudentEmails = studentEmails.join(',');

        let attendeesStr = `${formData.name} (${formData.studentId})`;
        if (additionalAttendees.length > 0) {
            attendeesStr += '\n';
            additionalAttendees.forEach((a, idx) => { attendeesStr += `参加者${idx + 1}: ${a.name} (${a.id})\n`; });
        }

        const formatDate = (dStr) => { const d = new Date(dStr); return `${d.getMonth() + 1}月${d.getDate()}日`; };
        const mailSubject = `【面談予約完了】宮本研面談予約 (${formatDate(datesStr)})`;
        const mailContent = `以下の内容で面談予約を受け付けました。

日時: ${formatDate(datesStr)} ${formData.timeSlot}
氏名: ${formData.name}
形式: ${formData.format === 'presential' ? '対面' : 'リモート'}
内容: ${formData.type === 'research' ? '研究相談' : (formData.type === 'report' ? '進捗報告' : 'その他')}
備考: ${formData.remarks || 'なし'}

参加者:
${attendeesStr}

--------------------------------------------------
本メールは送信専用です。
`;

        const notificationData = {
            to: allStudentEmails,
            cc: ownerEmails,
            subject: mailSubject,
            body: mailContent
        };

        const payload = {
            action: 'makeReservation',
            date: datesStr,
            newSlots: neededSlots,
            formData: formData,
            originalTimestamp: (isEditMode && originalTs) ? originalTs : null,
            notification: notificationData
        };

        const transactionUrl = `${GAS_API_URL}${GAS_API_URL.includes('?') ? '&' : '?'}cb=${Date.now()}`;

        fetch(transactionUrl, {
            method: 'POST',
            redirect: 'follow', // Important for GAS Web App
            headers: { 'Content-Type': 'text/plain' },
            body: JSON.stringify(payload)
        })
            .then(response => response.json())
            .then(result => {
                if (result.success) {
                    // Success! Update local data
                    // Result.updatedReservations contains the FULL reservations map (or at least the updated structure logic from GAS)
                    // GAS returns the full map.
                    const newReservationsAll = result.updatedReservations;

                    localStorage.setItem('miyamoto_reservations', JSON.stringify(newReservationsAll));

                    renderCalendar(currentDate);
                    renderDashboard();

                    reservationForm.reset();
                    additionalAttendeesContainer.innerHTML = '';
                    reservationModal.classList.remove('show');
                    resetEditMode();

                    showResultModal(formData, datesStr);
                } else {
                    alert('予約に失敗しました: ' + (result.error || '不明なエラー'));
                    syncDataWithGas();
                }
            })
            .catch(err => {
                console.error('Booking Transaction Failed:', err);
                alert('サーバー通信でエラーが発生しました。\nネットワーク接続を確認してください。');
            })
            .finally(() => {
                submitBtn.disabled = false;
                submitBtn.textContent = originalBtnText;
            });
    });

    const resetEditMode = () => {
        const modeEl = document.getElementById('editMode');
        if (modeEl) modeEl.value = 'false';
        const tsEl = document.getElementById('originalTimestamp');
        if (tsEl) tsEl.value = '';
        const dur = document.getElementById('duration');
        if (dur) dur.disabled = false;

        if (reservationForm) {
            const submitBtn = reservationForm.querySelector('.submit-btn');
            if (submitBtn) {
                submitBtn.textContent = '予約を確定する';
                submitBtn.style.background = 'var(--color-primary)';
            }
        }
    };

    // Notification Logic
    // Notification Function
    const sendBookingNotification = (formData, datesStr, additionalAttendees) => {
        const owners = getOwners();
        const ownerEmails = owners.filter(o => o.notify && o.email).map(o => o.email).join(',');

        let studentEmails = [];
        if (formData.email && formData.email.trim() !== '') {
            studentEmails.push(formData.email);
        }
        additionalAttendees.forEach(a => {
            if (a.email && a.email.trim() !== '') {
                studentEmails.push(a.email);
            }
        });
        const allStudentEmails = studentEmails.join(',');

        const formatDate = (dateStr) => {
            const d = new Date(dateStr);
            return `${d.getMonth() + 1}月${d.getDate()}日`;
        };

        let attendeesStr = `${formData.name} (${formData.studentId})`;
        if (additionalAttendees.length > 0) {
            attendeesStr += '\n';
            additionalAttendees.forEach((a, idx) => {
                attendeesStr += `参加者${idx + 1}: ${a.name} (${a.id})\n`;
            });
        }

        const mailSubject = `【面談予約完了】宮本研面談予約 (${formatDate(datesStr)})`;
        const mailContent = `以下の内容で面談予約を受け付けました。

日時: ${formatDate(datesStr)} ${formData.timeSlot}
氏名: ${formData.name}
形式: ${formData.format === 'presential' ? '対面' : 'リモート'}
内容: ${formData.type === 'research' ? '研究相談' : (formData.type === 'report' ? '進捗報告' : 'その他')}
備考: ${formData.remarks || 'なし'}

参加者:
${attendeesStr}

--------------------------------------------------
本メールは送信専用です。
`;

        // Send to GAS for emailing
        // Send to GAS for emailing
        const payload = {
            action: 'send_email',
            to: allStudentEmails,
            cc: ownerEmails,
            subject: mailSubject,
            body: mailContent
        };

        // Use no-cors or standard fetch. Assuming GAS endpoint handles 'send_email'
        fetch(GAS_API_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: { 'Content-Type': 'text/plain' },
            body: JSON.stringify(payload)
        }).catch(e => console.error('Email send failed', e));
    };


    const showToast = (msg) => {
        toast.textContent = msg;
        toast.className = 'toast show';
        setTimeout(() => { toast.className = toast.className.replace('show', ''); }, 3000);
    };

    // Toggle Admin Mode
    adminToggleBtn.addEventListener('click', () => {
        if (isAdminMode) {
            // Turn OFF
            isAdminMode = false;
            currentAdminUser = null;
            updateAdminUI();
            renderCalendar(currentDate);
            renderDashboard();
            showToast('管理者モードを終了しました。');
        } else {
            // Turn ON -> Prompt Password
            passwordForm.reset();

            // Populate User Select
            adminUserSelect.innerHTML = '';
            const owners = getOwners();

            if (owners.length === 0) {
                const opt = document.createElement('option');
                opt.value = 'system';
                opt.textContent = 'システム管理者 (初期設定)';
                adminUserSelect.appendChild(opt);
            } else {
                owners.forEach((owner, idx) => {
                    const opt = document.createElement('option');
                    opt.value = idx;
                    opt.textContent = `${owner.name} (${translateStatus(owner.status)})`;
                    adminUserSelect.appendChild(opt);
                });
            }

            passwordModal.classList.add('show');
            setTimeout(() => adminPasswordInput.focus(), 100);
        }
    });

    // Password Login Submit
    passwordForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const input = adminPasswordInput.value;
        const val = adminUserSelect.value;
        let correctPassword = '';
        let targetUser = null;

        if (val === 'system') {
            correctPassword = getStoredPassword();
            targetUser = null;
        } else {
            const owners = getOwners();
            const owner = owners[parseInt(val)];
            // Fallback to default if no password set (legacy support)
            correctPassword = owner.password || DEFAULT_PASSWORD;
            targetUser = owner;
        }

        if (input === correctPassword) {
            currentAdminUser = targetUser;
            isAdminMode = true;
            passwordModal.classList.remove('show');
            updateAdminUI();
            renderCalendar(currentDate);
            renderDashboard();
            const userName = currentAdminUser ? currentAdminUser.name : '管理者';
            showToast(`${userName} としてログインしました。`);
        } else {
            alert('パスワードが違います。');
            adminPasswordInput.value = '';
            adminPasswordInput.focus();
        }
    });

    // Change Password UI
    changePasswordBtn.addEventListener('click', () => {
        changePasswordForm.reset();
        changePasswordModal.classList.add('show');
    });

    // Change Password Submit
    changePasswordForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const current = currentPasswordInput.value;
        const newPwd = newPasswordInput.value;

        // Determine which password to check
        let stored = '';
        if (currentAdminUser) {
            stored = currentAdminUser.password || DEFAULT_PASSWORD;
        } else {
            stored = getStoredPassword();
        }

        if (current !== stored) {
            alert('現在のパスワードが間違っています。');
            return;
        }

        if (newPwd.length < 4) {
            alert('新しいパスワードは4文字以上にしてください。');
            return;
        }

        // Save new password
        if (currentAdminUser) {
            const owners = getOwners();
            // Find current user in the fresh list (by name/email or index if we tracked it completely, but index is tricky if deleted)
            // Ideally we track index or ID. Since we don't have ID, match by name/email for now or better, store index in currentAdminUser temporarily
            // For simplicity, let's look up by properties
            const idx = owners.findIndex(o => o.name === currentAdminUser.name && o.email === currentAdminUser.email);
            if (idx !== -1) {
                owners[idx].password = newPwd;
                saveOwners(owners);
                currentAdminUser.password = newPwd; // Update session
            }
        } else {
            setStoredPassword(newPwd);
        }

        changePasswordModal.classList.remove('show');
        showToast('パスワードを変更しました。');
    });

    const updateAdminUI = () => {
        if (isAdminMode) {
            adminToggleBtn.textContent = '管理者モード: ON';
            adminToggleBtn.classList.add('active');

            if (allReservationsBtn) allReservationsBtn.style.display = 'inline-block';
            if (typeof batchRegistrationBtn !== 'undefined' && batchRegistrationBtn) batchRegistrationBtn.style.display = 'inline-block';
            if (ownerManagementBtn) ownerManagementBtn.style.display = 'none'; // Kept in menu
            if (typeof userManagementBtn !== 'undefined' && userManagementBtn) userManagementBtn.style.display = 'none'; // Kept in menu

            if (adminMenuBtn) adminMenuBtn.style.display = 'inline-block';
            if (adminQuickActions) adminQuickActions.style.display = 'block';
            document.body.classList.add('admin-mode');
        } else {
            if (adminToggleBtn) {
                adminToggleBtn.textContent = '管理者モード: OFF';
                adminToggleBtn.classList.remove('active');
            }
            if (allReservationsBtn) allReservationsBtn.style.display = 'none';
            if (typeof batchRegistrationBtn !== 'undefined' && batchRegistrationBtn) batchRegistrationBtn.style.display = 'none';
            if (adminMenuBtn) adminMenuBtn.style.display = 'none';
            if (adminQuickActions) adminQuickActions.style.display = 'none';
            document.body.classList.remove('admin-mode');
        }
    };

    // Navigation Events
    prevMonthBtn.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() - 1);
        renderCalendar(currentDate);
    });

    nextMonthBtn.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() + 1);
        renderCalendar(currentDate);
    });

    window.addEventListener('click', (e) => {
        if (e.target === reservationModal) reservationModal.classList.remove('show');
        if (e.target === adminDayModal) adminDayModal.classList.remove('show');
        if (e.target === passwordModal) passwordModal.classList.remove('show');
        if (e.target === changePasswordModal) changePasswordModal.classList.remove('show');
        if (e.target === allReservationsModal) allReservationsModal.classList.remove('show');
        if (e.target === ownerManagementModal) ownerManagementModal.classList.remove('show');
    });

    // --- User Account Logic ---
    const loginOpenBtn = document.getElementById('loginOpenBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const accountModal = document.getElementById('accountModal');
    const tabLogin = document.getElementById('tabLogin');
    const tabRegister = document.getElementById('tabRegister');
    const loginView = document.getElementById('loginView');
    const registerView = document.getElementById('registerView');
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const userInfoDisplay = document.getElementById('userInfoDisplay');
    const loggedInUserName = document.getElementById('loggedInUserName');

    const updateAccountUI = () => {
        if (currentUserAccount) {
            loginOpenBtn.style.display = 'none';
            userInfoDisplay.style.display = 'block';
            loggedInUserName.textContent = `${currentUserAccount.name} さん`;
        } else {
            loginOpenBtn.style.display = 'block';
            userInfoDisplay.style.display = 'none';
        }
    };

    const autoFillPersonalInfo = () => {
        if (currentUserAccount) {
            const nameInput = document.getElementById('name');
            const studentIdInput = document.getElementById('studentId');
            const emailInput = document.getElementById('email');

            if (nameInput) {
                nameInput.value = currentUserAccount.name;
                nameInput.style.backgroundColor = '#f0fff4';
            }
            if (studentIdInput) {
                studentIdInput.value = currentUserAccount.studentId;
                studentIdInput.style.backgroundColor = '#f0fff4';
            }
            if (emailInput) {
                if (currentUserAccount.notify !== false) {
                    emailInput.value = currentUserAccount.email;
                    emailInput.style.backgroundColor = '#f0fff4';
                } else {
                    emailInput.value = '';
                    emailInput.style.backgroundColor = '';
                }
            }
        }
    };

    const resetAutoFillBackground = () => {
        ['name', 'studentId', 'email'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.style.backgroundColor = '';
        });
    };

    if (loginOpenBtn) {
        loginOpenBtn.addEventListener('click', () => accountModal.classList.add('show'));
    }

    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            currentUserAccount = null;
            localStorage.removeItem('miyamoto_current_user');
            updateAccountUI();
            resetAutoFillBackground();
            renderCalendar(currentDate);
            renderDashboard();
            showToast('ログアウトしました');
        });
    }

    if (tabLogin && tabRegister) {
        tabLogin.addEventListener('click', () => {
            tabLogin.classList.add('active');
            tabRegister.classList.remove('active');
            loginView.style.display = 'block';
            registerView.style.display = 'none';
        });
        tabRegister.addEventListener('click', () => {
            tabRegister.classList.add('active');
            tabLogin.classList.remove('active');
            registerView.style.display = 'block';
            loginView.style.display = 'none';
        });
    }

    if (registerForm) {
        registerForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const users = getUsers();
            const sid = document.getElementById('regStudentId').value;

            if (users.some(u => u.studentId === sid)) {
                alert('この学籍番号は既に登録されています。');
                return;
            }

            const newUser = {
                name: document.getElementById('regName').value,
                studentId: sid,
                email: document.getElementById('regEmail').value,
                password: document.getElementById('regPassword').value,
                grade: document.getElementById('regGrade').value, // Capture Grade
                notify: document.getElementById('regNotify').checked,
                joinedAt: new Date().toISOString()
            };

            users.push(newUser);
            saveUsers(users);

            currentUserAccount = newUser;
            localStorage.setItem('miyamoto_current_user', JSON.stringify(newUser));

            accountModal.classList.remove('show');
            updateAccountUI();
            renderCalendar(currentDate);
            renderDashboard();
            showToast('ユーザー登録が完了しました');
        });
    }

    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const sid = document.getElementById('loginStudentId').value;
            const pwd = document.getElementById('loginPassword').value;

            const users = getUsers();
            const user = users.find(u => u.studentId === sid && u.password === pwd);

            if (user) {
                currentUserAccount = user;
                localStorage.setItem('miyamoto_current_user', JSON.stringify(user));
                accountModal.classList.remove('show');
                updateAccountUI();
                renderCalendar(currentDate);
                renderDashboard();
                showToast(`ようこそ、${user.name} さん`);
            } else {
                alert('学籍番号またはパスワードが正しくありません。');
            }
        });
    }

    // Load Session
    const savedUser = localStorage.getItem('miyamoto_current_user');
    if (savedUser) {
        try { currentUserAccount = JSON.parse(savedUser); } catch (e) { }
        updateAccountUI();
    }

    // User Settings Modal Logic
    const userSettingsBtn = document.getElementById('userSettingsBtn');
    const userSettingsModal = document.getElementById('userSettingsModal');
    const userSettingsNotify = document.getElementById('userSettingsNotify');
    const saveUserSettingsBtn = document.getElementById('saveUserSettingsBtn');

    // Profile Edit Elements
    const editUserEmail = document.getElementById('editUserEmail');
    const editUserCurrentPwd = document.getElementById('editUserCurrentPwd');
    const editUserNewPwd = document.getElementById('editUserNewPwd');

    if (userSettingsBtn) {
        userSettingsBtn.addEventListener('click', () => {
            if (currentUserAccount) {
                // Auto-fill Settings Form
                if (userSettingsNotify) userSettingsNotify.checked = currentUserAccount.notify !== false;
                if (editUserEmail) editUserEmail.value = currentUserAccount.email || '';
                if (editUserCurrentPwd) editUserCurrentPwd.value = '';
                if (editUserNewPwd) editUserNewPwd.value = '';

                // Fill Grade
                const editUserGrade = document.getElementById('editUserGrade');
                if (editUserGrade) {
                    editUserGrade.value = currentUserAccount.grade || 'B3'; // Default to B3 if old data
                }

                userSettingsModal.classList.add('show');
            }
        });
    }

    if (saveUserSettingsBtn) {
        saveUserSettingsBtn.addEventListener('click', () => {
            if (!currentUserAccount) return;

            const newEmail = editUserEmail ? editUserEmail.value.trim() : '';
            const currentPwd = editUserCurrentPwd ? editUserCurrentPwd.value : '';
            const newPwd = editUserNewPwd ? editUserNewPwd.value : '';
            const newNotify = userSettingsNotify ? userSettingsNotify.checked : true;

            if (!newEmail) {
                alert('メールアドレスを入力してください。');
                return;
            }

            // Check password change
            if (currentPwd || newPwd) {
                if (currentPwd !== currentUserAccount.password) {
                    alert('現在のパスワードが正しくありません。');
                    return;
                }
                if (!newPwd || newPwd.length < 4) {
                    alert('新しいパスワードは4文字以上で入力してください。');
                    return;
                }
                // Apply new password
                currentUserAccount.password = newPwd;
            }

            // Update other fields
            currentUserAccount.email = newEmail;
            currentUserAccount.notify = newNotify;

            const editUserGrade = document.getElementById('editUserGrade');
            if (editUserGrade) {
                currentUserAccount.grade = editUserGrade.value;
            }

            // Update in User List
            const users = getUsers();
            const idx = users.findIndex(u => u.studentId === currentUserAccount.studentId);
            if (idx !== -1) {
                users[idx] = currentUserAccount; // Update entire object
                saveUsers(users);

                // Sync to GAS (Background)
                pushDataToGas('users', users);
            }

            // Update Session
            localStorage.setItem('miyamoto_current_user', JSON.stringify(currentUserAccount));
            userSettingsModal.classList.remove('show');
            showToast('設定を保存しました');
        });
    }

    // Account Deletion (Self)
    const deleteAccountBtn = document.getElementById('deleteAccountBtn');
    if (deleteAccountBtn) {
        deleteAccountBtn.addEventListener('click', () => {
            if (confirm('本当にアカウントを削除しますか？\nこの操作は取り消せません。')) {
                if (currentUserAccount) {
                    const users = getUsers();
                    const newUsers = users.filter(u => u.studentId !== currentUserAccount.studentId);
                    saveUsers(newUsers);

                    // Logout
                    currentUserAccount = null;
                    localStorage.removeItem('miyamoto_current_user');

                    userSettingsModal.classList.remove('show');
                    updateAccountUI();
                    resetAutoFillBackground();
                    showToast('アカウントを削除しました');
                }
            }
        });
    }

    // Admin User Management Logic
    let currentUserSortKey = 'count'; // Default sort
    let currentUserSortOrder = 'desc';

    const renderUserList = () => {
        if (!userManagementList) return;
        userManagementList.innerHTML = '';
        const users = getUsers();

        if (users.length === 0) {
            userManagementList.innerHTML = '<li style="text-align:center; color:#718096; padding:1rem;">登録ユーザーはいません</li>';
            return;
        }

        // Calculate stats
        const reservations = getReservations();
        const userStats = {}; // { studentId: count }

        Object.values(reservations).forEach(dayList => {
            dayList.forEach(res => {
                const sid = res.studentId;
                if (!userStats[sid]) userStats[sid] = 0;
                userStats[sid]++;
            });
        });

        // Add count to user objects for sorting
        const usersWithCount = users.map(u => ({
            ...u,
            reservationCount: userStats[u.studentId] || 0
        }));

        // Grade Weights for Sorting
        const gradeWeight = { 'B3': 1, 'B4': 2, 'M1': 3, 'M2': 4, 'D': 5, 'Other': 99 };

        // Sort Logic
        usersWithCount.sort((a, b) => {
            let valA = a[currentUserSortKey === 'count' ? 'reservationCount' : currentUserSortKey];
            let valB = b[currentUserSortKey === 'count' ? 'reservationCount' : currentUserSortKey];

            // Handle Nulls
            if (valA === undefined || valA === null) valA = '';
            if (valB === undefined || valB === null) valB = '';

            let comparison = 0;

            if (currentUserSortKey === 'grade') {
                const wA = gradeWeight[valA] || 99;
                const wB = gradeWeight[valB] || 99;
                comparison = wA - wB;
            } else if (typeof valA === 'number' && typeof valB === 'number') {
                comparison = valA - valB;
            } else {
                comparison = String(valA).localeCompare(String(valB));
            }

            return currentUserSortOrder === 'asc' ? comparison : -comparison;
        });

        usersWithCount.forEach(user => {
            const li = document.createElement('li');
            li.className = 'user-list-grid user-list-item'; // Use CSS classes for grid layout

            // Layout typically: Name | ID | Grade | Email | Count | Action
            // We need to update CSS Grid columns in next step or rely on flex if it breaks.
            // Current CSS defines specific columns? Let's check style.css later or adjust inline.
            // Actually, we should update the header in HTML as well (done in previous step).
            // We need to make sure the item structure matches the header.

            // Helper for Grade Display
            const gradeMap = { 'B3': 'B3', 'B4': 'B4', 'M1': 'M1', 'M2': 'M2', 'D': 'D', 'Other': '他' };
            const gradeDisplay = gradeMap[user.grade] || '-';

            // Name
            const nameDiv = document.createElement('div');
            nameDiv.textContent = user.name;
            nameDiv.style.fontWeight = '500';

            // Student ID
            const idDiv = document.createElement('div');
            idDiv.textContent = user.studentId;

            // Grade (New Column)
            const gradeDiv = document.createElement('div');
            gradeDiv.textContent = gradeDisplay;
            gradeDiv.style.textAlign = 'center';

            // Email (with special styling)
            const emailDiv = document.createElement('div');
            emailDiv.textContent = user.email;
            emailDiv.className = 'user-email-col';

            // Count
            const countDiv = document.createElement('div');
            countDiv.innerHTML = `<span style="background:#ebf8ff; color:#2b6cb0; padding:2px 8px; border-radius:12px; font-weight:bold;">${user.reservationCount}件</span>`;
            countDiv.style.textAlign = 'center';

            // Action
            const actionDiv = document.createElement('div');
            actionDiv.style.textAlign = 'center';
            const deleteBtn = document.createElement('button');
            deleteBtn.innerHTML = '<i class="fas fa-trash-alt"></i>';
            deleteBtn.className = 'delete-btn';
            deleteBtn.style.color = '#e53e3e';
            deleteBtn.style.padding = '4px 8px';
            deleteBtn.onclick = () => {
                if (confirm(`${user.name} (${user.studentId}) を削除してもよろしいですか？`)) {
                    const currentUsers = getUsers();
                    const updatedUsers = currentUsers.filter(u => u.studentId !== user.studentId);
                    saveUsers(updatedUsers);
                    // Force refresh list logic here since renderUserList is inside another scope or we can just reload modal content
                    // Ideally we call the same logic that built this list.
                    // For now, let's remove the li directly to reflect change instantly
                    li.remove();
                    showToast(`${user.name} を削除しました`);
                }
            };
            actionDiv.appendChild(deleteBtn);

            li.appendChild(nameDiv);
            li.appendChild(idDiv);
            li.appendChild(gradeDiv); // Add Grade
            li.appendChild(emailDiv);
            li.appendChild(countDiv);
            li.appendChild(actionDiv);
            userManagementList.appendChild(li);
        });

        // Update Sort Headers UI
        document.querySelectorAll('.sortable-header').forEach(header => {
            const key = header.dataset.sort;
            const icon = header.querySelector('i');
            if (key === currentUserSortKey) {
                header.style.color = 'var(--color-primary)';
                icon.className = currentUserSortOrder === 'asc' ? 'fas fa-sort-up' : 'fas fa-sort-down';
            } else {
                header.style.color = '';
                icon.className = 'fas fa-sort';
            }
        });
    };

    // Sort Event Listeners
    document.querySelectorAll('.sortable-header').forEach(header => {
        header.addEventListener('click', () => {
            const key = header.dataset.sort;
            if (currentUserSortKey === key) {
                // Toggle order
                currentUserSortOrder = currentUserSortOrder === 'asc' ? 'desc' : 'asc';
            } else {
                // New key, default to asc (except count, maybe default to desc? let's stick to asc for consistency or desc for numbers)
                // For logic simple: Default ASC.
                currentUserSortKey = key;
                currentUserSortOrder = 'asc';
                if (key === 'count') currentUserSortOrder = 'desc'; // Exception: usually want high count first
            }
            renderUserList();
        });
    });

    if (userManagementBtn) {
        userManagementBtn.addEventListener('click', () => {
            renderUserList();
            userManagementModal.classList.add('show');
        });
    }

    // Close User Management Modal (added to shared close handler already? check index.html modal ID placement)
    // Actually need to add userManagementModal to the closing list if not already
    // (Added in HTML structure, checking JS close handler)

    // Admin Menu Logic
    if (adminMenuBtn) {
        adminMenuBtn.addEventListener('click', () => {
            adminMenuModal.classList.add('show');
        });
    }

    // Connect Menu Buttons (User/Owner/System only)
    if (menuOwnerManagementBtn) {
        menuOwnerManagementBtn.addEventListener('click', () => {
            adminMenuModal.classList.remove('show');
            renderOwnerList();
            ownerManagementModal.classList.add('show');
        });
    }
    if (menuUserManagementBtn) {
        menuUserManagementBtn.addEventListener('click', () => {
            adminMenuModal.classList.remove('show');
            renderUserList();
            userManagementModal.classList.add('show');
            // Background update to fetch latest reservation counts
            syncDataWithGas(true).then(renderUserList);
        });
    }

    // Force Push (Initialize Server)
    const menuForcePushBtn = document.getElementById('menuForcePushBtn');
    if (menuForcePushBtn) {
        menuForcePushBtn.addEventListener('click', async () => {
            if (!confirm('【警告】\n現在あなたのブラウザに保存されているデータで、サーバー上の全データを上書きします。\n\n他の人が登録した予約がサーバーにあっても消えてしまいます。\n\n「あなたの手元のデータが一番正しい」という確信がある場合のみ実行してください。\nよろしいですか？')) {
                return;
            }
            if (!confirm('本当に実行しますか？取り消しはできません。')) {
                return;
            }

            adminMenuModal.classList.remove('show');
            showSyncing('サーバーデータを初期化中...');

            try {
                // 1. Owners (Individual Passwords)
                const owners = getOwners();
                if (owners.length > 0) {
                    await pushDataToGas('owners', owners);
                }

                // 2. Global Admin Password
                const globalPwd = localStorage.getItem('miyamoto_admin_password');
                if (globalPwd) {
                    await pushDataToGas('admin_password', globalPwd);
                }

                // 3. Reservations
                const reservations = JSON.parse(localStorage.getItem('miyamoto_reservations') || '{}');
                await pushDataToGas('reservations', reservations);

                // 4. Users
                const users = JSON.parse(localStorage.getItem('miyamoto_users') || '[]');
                await pushDataToGas('users', users);

                // 5. Open Slots
                const openSlots = JSON.parse(localStorage.getItem('miyamoto_open_slots') || '{}');
                await pushDataToGas('open_slots', openSlots);

                // 6. Date Config
                const dateConfig = JSON.parse(localStorage.getItem('miyamoto_date_config') || '{}');
                await pushDataToGas('date_config', dateConfig);

                hideSyncing();
                showToast('サーバーデータを現在の手元のデータで上書きしました');
            } catch (e) {
                console.error(e);
                hideSyncing();
                showToast('エラーが発生しました');
            }
        });
    }
    if (menuChangePasswordBtn) {
        menuChangePasswordBtn.addEventListener('click', () => {
            adminMenuModal.classList.remove('show');
            changePasswordModal.classList.add('show');
        });
    }

    // Initial Render (Immediate from LocalStorage)
    renderCalendar(currentDate);
    renderDashboard();

    // Start Sync (Background - Silent) and Refresh UI
    syncDataWithGas(true).then(() => {
        // Re-render to ensure fresh data from server is displayed
        renderCalendar(currentDate);
        renderDashboard();
    });

    // Manual Sync Button
    if (syncDataBtn) {
        syncDataBtn.addEventListener('click', () => {
            syncDataWithGas().then(() => {
                showToast('データを最新の状態に更新しました');
            });
        });
    }

    // Result Notification Logic (Toast)
    // Replaces Result Modal with a simple Toast notification
    const showResultModal = (formData, datesStr) => {
        // Close the reservation modal immediately
        if (reservationModal) reservationModal.classList.remove('show');

        // Show non-blocking toast
        showToast('予約が完了しました');
    };

    // --- Student History / Archive Logic (Robust Version) ---

    // Define elements inside the scope to ensure they are fetched after DOM is ready
    const menuStudentHistoryBtnRef = document.getElementById('menuStudentHistoryBtn');
    const studentHistoryModalRef = document.getElementById('studentHistoryModal');
    const historyStudentSelectRef = document.getElementById('historyStudentSelect');
    const studentHistoryContentRef = document.getElementById('studentHistoryContent');
    let historySortKey = 'studentId';
    let historySortOrder = 'asc';

    console.log('History Feature Init:', {
        btn: !!menuStudentHistoryBtnRef,
        modal: !!studentHistoryModalRef,
        select: !!historyStudentSelectRef
    });

    const openStudentHistoryModal = () => {
        console.log('openStudentHistoryModal called');
        const modal = document.getElementById('studentHistoryModal');
        const content = document.getElementById('studentHistoryContent');

        if (!modal) {
            console.error('History modal elements missing');
            return;
        }

        // Populate Sidebar List
        const sidebarList = document.getElementById('studentListSidebar');
        if (!sidebarList) return;

        sidebarList.innerHTML = '';

        // 1. Join Reservations and User Data
        const reservations = getReservations() || {};
        const users = getUsers() || [];
        const studentMap = new Map(); // id -> {name, grade, lastDate}

        // Initialize with registered users (ensures we have grade info if they are registered)
        users.forEach(u => {
            if (u.studentId) {
                studentMap.set(u.studentId, {
                    name: u.name,
                    grade: u.grade || 'Other',
                    lastDate: ''
                });
            }
        });

        // Scan actual reservations (to pick up students who might not be in the users list yet - guest bookings)
        Object.values(reservations).forEach(dayList => {
            if (!Array.isArray(dayList)) return;
            dayList.forEach(r => {
                if (r.studentId && r.name && !studentMap.has(r.studentId)) {
                    studentMap.set(r.studentId, {
                        name: r.name,
                        grade: 'Other', // Unknown if not registered
                        lastDate: r.timestamp || ''
                    });
                }
            });
        });

        // Build List Items for Sorting
        const studentList = Array.from(studentMap.entries()).map(([id, info]) => ({
            id,
            ...info
        }));

        // Grade Weights for Sorting
        const gradeWeight = { 'B3': 1, 'B4': 2, 'M1': 3, 'M2': 4, 'D': 5, 'Other': 99 };

        studentList.sort((a, b) => {
            let valA = a[historySortKey === 'studentId' ? 'id' : historySortKey];
            let valB = b[historySortKey === 'studentId' ? 'id' : historySortKey];

            if (historySortKey === 'grade') {
                valA = gradeWeight[valA] || 99;
                valB = gradeWeight[valB] || 99;
            }

            let comparison = 0;
            if (typeof valA === 'number' && typeof valB === 'number') {
                comparison = valA - valB;
            } else {
                comparison = String(valA).localeCompare(String(valB));
            }

            return historySortOrder === 'asc' ? comparison : -comparison;
        });

        if (studentList.length === 0) {
            sidebarList.innerHTML = '<div style="padding:10px; color:#aaa; font-size:0.9rem;">学生が見つかりません</div>';
        }

        studentList.forEach(student => {
            const li = document.createElement('li');
            li.style.cssText = 'padding: 10px; cursor: pointer; border-bottom: 1px solid #f7fafc; transition: background 0.2s; font-size: 0.9rem; position: relative;';

            const gradeBadge = student.grade && student.grade !== 'Other' ?
                `<span style="font-size: 0.65rem; background: #edf2f7; padding: 2px 4px; border-radius: 4px; margin-left: 4px; color: #4a5568;">${student.grade}</span>` : '';

            li.innerHTML = `
                <div style="font-weight:bold; color:#2d3748;">${student.name}${gradeBadge}</div>
                <div style="font-size:0.8rem; color:#718096;">${student.id}</div>
            `;

            li.addEventListener('mouseenter', () => {
                if (!li.classList.contains('active')) li.style.background = '#ebf8ff';
            });
            li.addEventListener('mouseleave', () => {
                if (!li.classList.contains('active')) li.style.background = 'transparent';
            });

            li.addEventListener('click', () => {
                // Remove active class from all
                Array.from(sidebarList.children).forEach(child => {
                    child.classList.remove('active');
                    child.style.background = 'transparent';
                    child.style.borderLeft = 'none';
                });

                // Set active to clicked
                li.classList.add('active');
                li.style.background = '#ebf8ff';
                li.style.borderLeft = '3px solid #3182ce';

                renderStudentHistory(student.id);
            });

            sidebarList.appendChild(li);
        });

        // Update Sort Buttons UI
        document.querySelectorAll('.student-sort-btn').forEach(btn => {
            const key = btn.dataset.key;
            const icon = btn.querySelector('i');
            if (key === historySortKey) {
                btn.style.color = '#3182ce';
                btn.style.fontWeight = 'bold';
                icon.className = historySortOrder === 'asc' ? 'fas fa-sort-up' : 'fas fa-sort-down';
            } else {
                btn.style.color = '';
                btn.style.fontWeight = '';
                icon.className = 'fas fa-sort';
            }
        });

        // Search Filter Logic
        const searchInput = document.getElementById('studentSearchInput');
        if (searchInput) {
            searchInput.value = ''; // Reset
            searchInput.oninput = () => {
                const term = searchInput.value.toLowerCase();
                Array.from(sidebarList.children).forEach(li => {
                    const text = li.textContent.toLowerCase();
                    li.style.display = text.includes(term) ? 'block' : 'none';
                });
            };
        }

        if (content) content.innerHTML = '<div style="text-align:center; color:#718096; padding: 20px; margin-top: 2rem;"><i class="fas fa-arrow-left"></i> 左のリストから学生を選択してください</div>';
        if (document.getElementById('studentFutureContent')) document.getElementById('studentFutureContent').innerHTML = '';
        if (document.getElementById('studentFutureSection')) document.getElementById('studentFutureSection').style.display = 'none';

        modal.classList.add('show');

        if (adminMenuModal) adminMenuModal.classList.remove('show');
    };

    // History Sort Event Listeners
    document.querySelectorAll('.student-sort-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const key = btn.dataset.key;
            if (historySortKey === key) {
                historySortOrder = historySortOrder === 'asc' ? 'desc' : 'asc';
            } else {
                historySortKey = key;
                historySortOrder = 'asc';
            }
            openStudentHistoryModal();
        });
    });

    // Button Bindings to Open Modal
    if (menuStudentHistoryBtnRef) {
        menuStudentHistoryBtnRef.addEventListener('click', openStudentHistoryModal);
    }
    if (sidebarStudentHistoryBtn) {
        sidebarStudentHistoryBtn.addEventListener('click', openStudentHistoryModal);
    }

    const renderStudentHistory = (studentId) => {
        const historyContent = document.getElementById('studentHistoryContent');
        const futureContent = document.getElementById('studentFutureContent');
        const futureSection = document.getElementById('studentFutureSection');

        if (!historyContent) return;

        // Reset
        historyContent.innerHTML = '';
        if (futureContent) futureContent.innerHTML = '';
        if (futureSection) futureSection.style.display = 'none';

        if (!studentId) {
            historyContent.innerHTML = '<div style="text-align:center; color:#718096; padding: 20px;">学生を選択すると情報が表示されます</div>';
            return;
        }

        const reservations = getReservations() || {};
        let allReservations = [];

        Object.keys(reservations).forEach(dateStr => {
            const dayList = reservations[dateStr];
            if (Array.isArray(dayList)) {
                dayList.forEach(r => {
                    if (String(r.studentId) === String(studentId)) {
                        allReservations.push({ ...r, date: dateStr });
                    }
                });
            }
        });

        if (allReservations.length === 0) {
            historyContent.innerHTML = '<div style="text-align:center; padding:20px;">この学生の予約データはありません。</div>';
            return;
        }

        // Split Future / Past
        const now = new Date();
        let futureList = [];
        let pastList = [];

        allReservations.forEach(r => {
            // Simple approach: Parsing time slot "10:00 - 10:30"
            const startTimeStr = r.timeSlot.split(' - ')[0];
            // Construct Date object carefully
            const rDateParts = r.date.split('-'); // YYYY-MM-DD
            if (rDateParts.length === 3) {
                const rDateTime = new Date(Number(rDateParts[0]), Number(rDateParts[1]) - 1, Number(rDateParts[2]));
                const timeParts = startTimeStr.split(':');
                if (timeParts.length === 2) {
                    rDateTime.setHours(Number(timeParts[0]), Number(timeParts[1]));
                }

                if (rDateTime >= now) {
                    futureList.push(r);
                } else {
                    pastList.push(r);
                }
            } else {
                // Fallback
                pastList.push(r);
            }
        });

        // Sort
        futureList.sort((a, b) => new Date(a.date) - new Date(b.date)); // ASC (Upcoming first)
        pastList.sort((a, b) => new Date(b.date) - new Date(a.date)); // DESC (Latest past first)

        // Helper to render card
        const createCard = (r, isFuture = false) => {
            const dateObj = new Date(r.date.replace(/-/g, '/')); // Use / for local time parsing
            const weekdays = ['日', '月', '火', '水', '木', '金', '土'];
            const dayName = weekdays[dateObj.getDay()];
            const dateDisplay = `${dateObj.getFullYear()}/${dateObj.getMonth() + 1}/${dateObj.getDate()}(${dayName})`;
            const styleBorder = isFuture ? 'border-left: 5px solid #3182ce;' : '';
            const bg = isFuture ? '#ebf8ff' : 'white';
            const icon = isFuture ? '<i class="fas fa-hourglass-half" style="color:#3182ce; margin-right:4px;"></i>' : '';

            // Prepare data for attribute
            const safeData = encodeURIComponent(JSON.stringify(r));

            return `
                <div style="background:${bg}; border:1px solid #e2e8f0; border-radius:8px; padding:1rem; margin-bottom:1rem; box-shadow:0 1px 2px rgba(0,0,0,0.05); ${styleBorder} position:relative;">
                     <button class="open-detail-trigger" data-res="${safeData}" data-date="${r.date}"
                        style="position:absolute; top:10px; right:10px; background:white; border:1px solid #cbd5e0; color:#4a5568; border-radius:4px; padding:4px 10px; cursor:pointer; font-size:0.8rem; box-shadow:0 1px 2px rgba(0,0,0,0.05); z-index:5;">
                        <i class="fas fa-edit"></i> 詳細・編集
                    </button>
                    <div style="display:flex; flex-direction:column; gap:4px; margin-bottom:0.5rem; border-bottom:1px solid #edf2f7; padding-bottom:0.8rem; padding-right: 110px;">
                        <div style="font-weight:bold; color:#2b6cb0; font-size: 1.05rem;">
                            ${dateDisplay} <span style="margin-left:8px;">${r.timeSlot}</span>
                        </div>
                        <div style="font-size:0.9rem; color:#4a5568;">
                            <span style="font-weight:bold; color:#2d3748; margin-right:6px;">[${translateFormat(r.format)}]</span>
                            <span>${translateType(r.type)}</span>
                        </div>
                    </div>
                    
                    <div style="font-size:0.9rem; margin-bottom:0.5rem;">
                        <strong>備考:</strong> ${r.remarks || 'なし'}
                    </div>
                    
                    <!-- Memos -->
                    <div style="display:grid; gap:10px; margin-top:10px;">
                        ${createNoteHtml('学生メモ', r.noteStudent, '#f7fafc', '#cbd5e0', '#718096')}
                        ${createNoteHtml('共有議事録・フィードバック', r.noteShared, '#fffaf0', '#ed8936', '#dd6b20')}
                        ${createNoteHtml('教員メモ (非公開)', r.noteFaculty, '#fff5f5', '#fc8181', '#e53e3e')}
                    </div>
                </div>
            `;
        };

        const createNoteHtml = (title, content, bg, bo, tc) => {
            if (!content) return '';
            const isLong = content.length > 100;
            // Use <br> for newlines in preview if needed, but textContent handles it safely? No, we use innerHTML with checks usually.
            // But here we want simple truncation.
            const shortContent = isLong ? content.substring(0, 100) + '...' : content;

            return `
            <div style="background:${bg}; padding:8px; border-radius:4px; border-left:3px solid ${bo};">
                <div style="font-size:0.8rem; font-weight:bold; color:${tc}; margin-bottom:2px;">${title}</div>
                ${isLong ? `
                    <div class="note-container">
                        <div class="note-short" style="font-size:0.9rem; white-space:pre-wrap; overflow-wrap: break-word; word-break: break-word;">${shortContent}</div>
                        <div class="note-full" style="display:none; font-size:0.9rem; white-space:pre-wrap; overflow-wrap: break-word; word-break: break-word;">${content}</div>
                        <button class="toggle-note-btn" style="border:none; background:none; color:#3182ce; font-size:0.8rem; cursor:pointer; padding:0; margin-top:4px; text-decoration: underline;">もっと見る</button>
                    </div>
                ` : `
                    <div style="font-size:0.9rem; white-space:pre-wrap; overflow-wrap: break-word; word-break: break-word;">${content}</div>
                `}
            </div>`;
        };

        // Render Future
        if (futureList.length > 0 && futureContent && futureSection) {
            futureSection.style.display = 'block';
            futureContent.innerHTML = futureList.map(r => createCard(r, true)).join('');
        }

        // Render Past
        if (pastList.length > 0) {
            historyContent.innerHTML = '<div class="history-timeline">' + pastList.map(r => createCard(r, false)).join('') + '</div>';
        } else {
            historyContent.innerHTML = '<div style="text-align:center; padding:10px; color:#a0aec0;">過去の履歴はありません。</div>';
        }

        // Attach Event Listeners
        const container = document.getElementById('studentInfoContainer');
        if (container) {
            container.querySelectorAll('.open-detail-trigger').forEach(btn => {
                btn.onclick = (e) => {
                    e.stopPropagation();
                    try {
                        const raw = decodeURIComponent(btn.getAttribute('data-res'));
                        const rData = JSON.parse(raw);
                        const dateStr = btn.getAttribute('data-date');

                        if (typeof showReservationDetails === 'function') {
                            showReservationDetails(rData, dateStr);
                        }

                        // Watch for Modal Close to Refresh List
                        const checkClose = setInterval(() => {
                            const modal = document.getElementById('reservationDetailsModal');
                            if (modal && !modal.classList.contains('show')) {
                                clearInterval(checkClose);
                                // Refresh logic
                                // Sidebar is now the source of truth, but we need to know who was selected.
                                // We can check the active sidebar item.
                                const activeItem = document.querySelector('#studentListSidebar li.active');
                                if (activeItem) {
                                    // The ID is in the second div of the li
                                    const idDiv = activeItem.querySelectorAll('div')[1];
                                    if (idDiv) {
                                        const id = idDiv.textContent;
                                        setTimeout(() => renderStudentHistory(id), 100);
                                    }
                                }
                            }
                        }, 500);

                    } catch (err) {
                        console.error('Error opening details', err);
                    }
                };
            });

            // Toggle Note Listeners
            container.querySelectorAll('.toggle-note-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const parent = btn.parentElement;
                    const short = parent.querySelector('.note-short');
                    const full = parent.querySelector('.note-full');

                    if (full.style.display === 'none') {
                        full.style.display = 'block';
                        short.style.display = 'none';
                        btn.textContent = '閉じる';
                    } else {
                        full.style.display = 'none';
                        short.style.display = 'block';
                        btn.textContent = 'もっと見る';
                    }
                });
            });
        }
    };

    const renderMyPage = () => {
        if (!currentUserAccount) return;
        const studentId = currentUserAccount.studentId;

        const myPageStudentId = document.getElementById('myPageStudentId');
        const myPageStudentName = document.getElementById('myPageStudentName');
        const futureListEl = document.getElementById('myPageFutureList');
        const pastListEl = document.getElementById('myPagePastList');
        const futureSection = document.getElementById('myPageFutureSection');

        if (myPageStudentId) myPageStudentId.textContent = `学籍番号: ${studentId} `;
        if (myPageStudentName) myPageStudentName.textContent = currentUserAccount.name;

        // Fetch and Filter
        const reservations = getReservations() || {};
        let allRes = [];
        Object.keys(reservations).forEach(dateStr => {
            const list = reservations[dateStr];
            if (Array.isArray(list)) {
                list.forEach(r => {
                    if (String(r.studentId) === String(studentId)) {
                        allRes.push({ ...r, date: dateStr });
                    }
                });
            }
        });

        // Current time for splitting
        const now = new Date();
        let futureList = [];
        let pastList = [];

        allRes.forEach(r => {
            const startTimeStr = r.timeSlot.split(' - ')[0];
            const dateParts = r.date.split('-');
            const rDateTime = new Date(Number(dateParts[0]), Number(dateParts[1]) - 1, Number(dateParts[2]));
            const timeParts = startTimeStr.split(':');
            if (timeParts.length === 2) rDateTime.setHours(Number(timeParts[0]), Number(timeParts[1]));

            if (rDateTime >= now) futureList.push(r);
            else pastList.push(r);
        });

        futureList.sort((a, b) => new Date(a.date) - new Date(b.date));
        pastList.sort((a, b) => new Date(b.date) - new Date(a.date));

        // Card Helper (Internal to renderMyPage to avoid conflicts)
        const createMyCard = (r, isFuture = false) => {
            const dateObj = new Date(r.date.replace(/-/g, '/'));
            const weekdays = ['日', '月', '火', '水', '木', '金', '土'];
            const dayName = weekdays[dateObj.getDay()];
            const dateDisplay = `${dateObj.getFullYear()} /${dateObj.getMonth() + 1}/${dateObj.getDate()} (${dayName})`;
            const styleBorder = isFuture ? 'border-left: 5px solid #3182ce;' : '';
            const bg = isFuture ? '#ebf8ff' : 'white';
            const safeData = encodeURIComponent(JSON.stringify(r));

            return `
                <div style="background:${bg}; border:1px solid #e2e8f0; border-radius:8px; padding:1rem; margin-bottom:1rem; box-shadow:0 1px 2px rgba(0,0,0,0.05); ${styleBorder} position:relative; display: flex; flex-direction: column;">
                    
                    <div style="display:flex; flex-direction:column; gap:4px; margin-bottom:0.5rem; border-bottom:1px solid #edf2f7; padding-bottom:0.8rem;">
                        <div style="font-weight:bold; color:#2b6cb0; font-size: 1.05rem;">
                            ${dateDisplay} <span style="margin-left:8px;">${r.timeSlot}</span>
                        </div>
                        <div style="font-size:0.9rem; color:#4a5568;">
                            <span style="font-weight:bold; color:#2d3748; margin-right:6px;">[${translateFormat(r.format)}]</span>
                            <span>${translateType(r.type)}</span>
                        </div>
                    </div>
                    ${r.remarks ? `<div style="font-size:0.85rem; color:#4a5568; margin-bottom:10px;"><strong>備考:</strong> ${r.remarks}</div>` : ''}

                    <div style="display:grid; gap:8px; margin-bottom: 10px;">
                        ${createNoteHtmlWithToggle('マイメモ (自分用)', r.noteStudent, '#f7fafc', '#cbd5e0', '#718096')}
                        ${createNoteHtmlWithToggle('共有議事録・フィードバック', r.noteShared, '#fffaf0', '#ed8936', '#dd6b20')}
                    </div>

                    <div style="text-align: right; margin-top: auto;">
                         <button class="open-detail-student-trigger" data-res="${safeData}" data-date="${r.date}"
                            style="background:white; border:1px solid #cbd5e0; color:#4a5568; border-radius:4px; padding:6px 14px; cursor:pointer; font-size:0.85rem; box-shadow: 0 1px 2px rgba(0,0,0,0.05);">
                            <i class="fas fa-edit"></i> 詳細・メモ編集
                        </button>
                    </div>
                </div>
            `;
        };

        const createNoteHtmlWithToggle = (title, content, bg, bo, tc) => {
            if (!content) return '';
            const isLong = content.length > 100;
            const shortContent = isLong ? content.substring(0, 100) + '...' : content;

            return `
            <div style="background:${bg}; padding:8px; border-radius:4px; border-left:3px solid ${bo};">
                <div style="font-size:0.8rem; font-weight:bold; color:${tc}; margin-bottom:2px;">${title}</div>
                ${isLong ? `
                    <div class="note-container">
                        <div class="note-short" style="font-size:0.85rem; white-space:pre-wrap; overflow-wrap: break-word; word-break: break-word;">${shortContent}</div>
                        <div class="note-full" style="display:none; font-size:0.85rem; white-space:pre-wrap; overflow-wrap: break-word; word-break: break-word;">${content}</div>
                        <button class="toggle-note-btn" style="border:none; background:none; color:#3182ce; font-size:0.8rem; cursor:pointer; padding:0; margin-top:4px; text-decoration: underline;">もっと見る</button>
                    </div>
                ` : `
                    <div style="font-size:0.85rem; white-space:pre-wrap; overflow-wrap: break-word; word-break: break-word;">${content}</div>
                `}
            </div>`;
        };

        // Render
        if (futureList.length > 0) {
            if (futureSection) futureSection.style.display = 'block';
            if (futureListEl) futureListEl.innerHTML = futureList.map(r => createMyCard(r, true)).join('');
        } else {
            if (futureSection) futureSection.style.display = 'none';
        }

        if (pastListEl) {
            if (pastList.length > 0) {
                pastListEl.innerHTML = pastList.map(r => createMyCard(r, false)).join('');
            } else {
                pastListEl.innerHTML = '<div style="text-align:center; padding:20px; color:#a0aec0;">過去の履歴はありません。</div>';
            }
        }

        // Attach Listeners
        const currentModal = document.getElementById('myPageModal');
        if (currentModal) {
            currentModal.querySelectorAll('.open-detail-student-trigger').forEach(btn => {
                btn.onclick = () => {
                    const rData = JSON.parse(decodeURIComponent(btn.getAttribute('data-res')));
                    const dateStr = btn.getAttribute('data-date');
                    if (typeof showReservationDetails === 'function') {
                        showReservationDetails(rData, dateStr);
                    }

                    // Refresh on Close
                    const checkClose = setInterval(() => {
                        const detModal = document.getElementById('reservationDetailsModal');
                        if (detModal && !detModal.classList.contains('show')) {
                            clearInterval(checkClose);
                            renderMyPage();
                        }
                    }, 500);
                };
            });

            // Toggle Note Listeners for My Page
            currentModal.querySelectorAll('.toggle-note-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const parent = btn.parentElement;
                    const short = parent.querySelector('.note-short');
                    const full = parent.querySelector('.note-full');

                    if (full.style.display === 'none') {
                        full.style.display = 'block';
                        short.style.display = 'none';
                        btn.textContent = '閉じる';
                    } else {
                        full.style.display = 'none';
                        short.style.display = 'block';
                        btn.textContent = 'もっと見る';
                    }
                });
            });
        }
    };

    const openMyPageModal = () => {
        if (myPageModal) {
            renderMyPage();
            myPageModal.classList.add('show');
        }
    };

    // Events for My Page
    if (myPageBtn) {
        myPageBtn.addEventListener('click', openMyPageModal);
    }
    if (myPageSettingsBtn) {
        myPageSettingsBtn.addEventListener('click', () => {
            if (myPageModal) myPageModal.classList.remove('show');
            // Trigger user settings btn if it exists, otherwise show modal directly
            if (userSettingsBtn) {
                userSettingsBtn.click();
            } else {
                const settModal = document.getElementById('userSettingsModal');
                if (settModal) settModal.classList.add('show');
            }
        });
    }

    if (sidebarAllReservationsBtn) {
        sidebarAllReservationsBtn.addEventListener('click', () => {
            if (allReservationsBtn) allReservationsBtn.click();
        });
    }

    // --- Past Data Cleanup Functionality ---










    // --- Past Data Cleanup Functionality ---
    const cleanupDataBtn = document.getElementById('cleanupDataBtn');
    if (cleanupDataBtn) {
        cleanupDataBtn.addEventListener('click', () => {
            if (!confirm('【警告】1年以上前の予約データをシステムから削除してもよろしいですか？\n' +
                '削除されたデータは復元できません。\n' +
                '※この操作は、システムの動作を軽くするために行います。')) {
                return;
            }

            cleanupDataBtn.disabled = true;
            cleanupDataBtn.textContent = '現在データを整理中...';

            fetchFromGas('reservations').then(fetchedData => {
                const currentReservations = fetchedData || {};
                const now = new Date();
                const oneYearAgo = new Date();
                oneYearAgo.setFullYear(now.getFullYear() - 1);

                let deletedCount = 0;
                let keptCount = 0;

                // CSV Content Buffer
                let csvContent = "\ufeff日付,時間帯,氏名,学籍番号,形式,内容,備考\n";

                Object.keys(currentReservations).forEach(dateStr => {
                    const dateObj = new Date(dateStr);

                    if (dateObj < oneYearAgo) {
                        // Archive (Add to CSV)
                        const list = currentReservations[dateStr];
                        if (list && list.length > 0) {
                            list.forEach(r => {
                                const row = [
                                    dateStr,
                                    `"${r.timeSlot}"`,
                                    `"${r.name}"`,
                                    `"${r.studentId}"`,
                                    r.format,
                                    r.type,
                                    `"${(r.remarks || '').replace(/"/g, '""')}"`
                                ];
                                csvContent += row.join(",") + "\n";
                                deletedCount++;
                            });
                        }
                        // Delete from object
                        delete currentReservations[dateStr];
                    } else {
                        keptCount += (currentReservations[dateStr] || []).length;
                    }
                });

                if (deletedCount === 0) {
                    alert('削除対象となる1年以上前のデータはありませんでした。');
                    cleanupDataBtn.disabled = false;
                    cleanupDataBtn.innerHTML = '<i class="fas fa-archive"></i> 過去データの整理';
                    return;
                }

                // Generate CSV Download
                const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                const link = document.createElement("a");
                const url = URL.createObjectURL(blob);
                link.setAttribute("href", url);
                link.setAttribute("download", `reservations_archive_${now.toISOString().split('T')[0]}.csv`);
                link.style.visibility = 'hidden';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);

                // Save cleaned data
                pushDataToGas('reservations', currentReservations).then(() => {
                    localStorage.setItem('miyamoto_reservations', JSON.stringify(currentReservations));
                    alert(`整理が完了しました。\n削除件数: ${deletedCount}件\n(CSVファイルとしてダウンロードされました)`);

                    cleanupDataBtn.disabled = false;
                    cleanupDataBtn.innerHTML = '<i class="fas fa-archive"></i> 過去データの整理';
                });

            }).catch(err => {
                console.error('Cleanup Failed:', err);
                alert('データ整理中にエラーが発生しました。');
                cleanupDataBtn.disabled = false;
                cleanupDataBtn.innerHTML = '<i class="fas fa-archive"></i> 過去データの整理';
            });
        });
    }

    // --- Notification Settings UI ---
    const notificationSettingsBtn = document.getElementById('notificationSettingsBtn');
    const notificationSettingsModal = document.getElementById('notificationSettingsModal');
    const enableNotificationsBtn = document.getElementById('enableNotificationsBtn');
    const disableNotificationsBtn = document.getElementById('disableNotificationsBtn');
    const notificationStatusText = document.getElementById('notificationStatusText');

    // Update notification status display
    const updateNotificationStatus = () => {
        if (!notificationManager) {
            notificationStatusText.textContent = '通知機能は利用できません';
            notificationStatusText.style.color = '#718096';
            return;
        }

        // Check Safari installation status
        const safariStatus = notificationManager.getSafariInstallStatus();
        const safariGuide = document.getElementById('safariInstallGuide');
        const safariMessage = document.getElementById('safariInstallMessage');
        const safariInstructions = document.getElementById('safariInstallInstructions');

        if (safariStatus.needsInstall) {
            // Show Safari installation guide
            safariGuide.style.display = 'block';
            safariMessage.textContent = safariStatus.message;
            safariInstructions.innerHTML = safariStatus.instructions
                .map(instruction => `<li>${instruction}</li>`)
                .join('');

            notificationStatusText.innerHTML = '<i class="fas fa-exclamation-triangle" style="color: #4299e1;"></i> Safari/iOSでは追加の設定が必要です';
            notificationStatusText.style.color = '#2c5282';
            enableNotificationsBtn.style.display = 'none';
            disableNotificationsBtn.style.display = 'none';
            return;
        } else {
            safariGuide.style.display = 'none';
        }

        const status = notificationManager.getPermissionStatus();
        const hasToken = localStorage.getItem('miyamoto_fcm_token');

        if (status === 'granted' && hasToken) {
            notificationStatusText.innerHTML = '<i class="fas fa-check-circle" style="color: #48bb78;"></i> 通知が有効です';
            notificationStatusText.style.color = '#22543d';
            enableNotificationsBtn.style.display = 'none';
            disableNotificationsBtn.style.display = 'block';
        } else if (status === 'denied') {
            notificationStatusText.innerHTML = '<i class="fas fa-times-circle" style="color: #f56565;"></i> 通知が拒否されています<br><small>ブラウザの設定から許可してください</small>';
            notificationStatusText.style.color = '#742a2a';
            enableNotificationsBtn.style.display = 'none';
            disableNotificationsBtn.style.display = 'none';
        } else if (status === 'granted' && !hasToken) {
            // Permission granted but token removed (user disabled)
            notificationStatusText.innerHTML = '<i class="fas fa-bell-slash" style="color: #a0aec0;"></i> 通知は無効です';
            notificationStatusText.style.color = '#4a5568';
            enableNotificationsBtn.style.display = 'block';
            disableNotificationsBtn.style.display = 'none';
        } else {
            notificationStatusText.innerHTML = '<i class="fas fa-bell-slash" style="color: #a0aec0;"></i> 通知は無効です';
            notificationStatusText.style.color = '#4a5568';
            enableNotificationsBtn.style.display = 'block';
            disableNotificationsBtn.style.display = 'none';
        }
    };

    // Open notification settings modal
    if (notificationSettingsBtn) {
        notificationSettingsBtn.addEventListener('click', () => {
            if (notificationSettingsModal) {
                notificationSettingsModal.classList.add('show');
                updateNotificationStatus();
            }
        });
    }

    // Enable notifications
    if (enableNotificationsBtn) {
        enableNotificationsBtn.addEventListener('click', async () => {
            if (!notificationManager) {
                alert('通知機能が利用できません。');
                return;
            }

            if (!notificationManager.isSupported()) {
                alert('お使いのブラウザは通知機能に対応していません。');
                return;
            }

            // Check if user is logged in
            if (!currentUserAccount || !currentUserAccount.studentId) {
                alert('通知を有効にするには、ログインが必要です。');
                return;
            }

            enableNotificationsBtn.disabled = true;
            enableNotificationsBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 設定中...';

            try {
                const success = await notificationManager.requestPermission();

                if (success) {
                    alert('通知が有効になりました！\n予約の前日と1時間前に通知が届きます。');
                    updateNotificationStatus();
                } else {
                    alert('通知の許可が得られませんでした。\nブラウザの設定を確認してください。');
                }
            } catch (error) {
                console.error('Error enabling notifications:', error);
                alert('通知の設定中にエラーが発生しました。');
            } finally {
                enableNotificationsBtn.disabled = false;
                enableNotificationsBtn.innerHTML = '<i class="fas fa-bell"></i> 通知を有効にする';
            }
        });
    }

    // Disable notifications
    if (disableNotificationsBtn) {
        disableNotificationsBtn.addEventListener('click', async () => {
            if (!notificationManager) {
                return;
            }

            if (confirm('通知を無効にしますか？')) {
                disableNotificationsBtn.disabled = true;
                disableNotificationsBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 処理中...';

                try {
                    await notificationManager.unsubscribe();
                    alert('通知が無効になりました。');
                    updateNotificationStatus();
                } catch (error) {
                    console.error('Error disabling notifications:', error);
                    alert('通知の無効化中にエラーが発生しました。');
                } finally {
                    disableNotificationsBtn.disabled = false;
                    disableNotificationsBtn.innerHTML = '<i class="fas fa-bell-slash"></i> 通知を無効にする';
                }
            }
        });
    }

});
