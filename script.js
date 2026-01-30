document.addEventListener('DOMContentLoaded', () => {
    // State
    let currentDate = new Date();
    let isAdminMode = false;
    let currentAdminUser = null; // Stores the currently logged in owner object
    const DEFAULT_PASSWORD = 'admin'; // Initial password

    const timeSlots = [
        "08:30 - 09:00",
        "09:00 - 09:30",
        "09:30 - 10:00",
        "10:00 - 10:30",
        "10:30 - 11:00",
        "11:00 - 11:30",
        "11:30 - 12:00",
        "12:00 - 12:30",
        "12:30 - 13:00",
        "13:00 - 13:30",
        "13:30 - 14:00",
        "14:00 - 14:30",
        "14:30 - 15:00",
        "15:00 - 15:30",
        "15:30 - 16:00",
        "16:00 - 16:30",
        "16:30 - 17:00",
        "17:00 - 17:30",
        "17:30 - 18:00",
        "18:00 - 18:30",
        "18:30 - 19:00",
        "19:00 - 19:30",
        "19:30 - 20:00"
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

    // DOM Elements - Batch Registration Modal
    const batchRegistrationBtn = document.getElementById('batchRegistrationBtn');
    const batchRegistrationModal = document.getElementById('batchRegistrationModal');
    const batchRegistrationForm = document.getElementById('batchRegistrationForm');
    const batchStartDate = document.getElementById('batchStartDate');
    const batchEndDate = document.getElementById('batchEndDate');
    const batchStartTime = document.getElementById('batchStartTime');
    const batchEndTime = document.getElementById('batchEndTime');

    // Close buttons
    document.querySelectorAll('.closeModal').forEach(btn => {
        btn.addEventListener('click', () => {
            reservationModal.classList.remove('show');
            adminDayModal.classList.remove('show');
            passwordModal.classList.remove('show');
            changePasswordModal.classList.remove('show');
            allReservationsModal.classList.remove('show');
            ownerManagementModal.classList.remove('show');
            batchRegistrationModal.classList.remove('show');
        });
    });

    // Local Storage Helpers
    const getStoredPassword = () => {
        return localStorage.getItem('miyamoto_admin_password') || DEFAULT_PASSWORD;
    };

    // --- Synchronization & Storage Helpers ---

    // GAS API Endpoint (Same as email but handles more actions now)
    const GAS_API_URL = 'https://script.google.com/macros/s/AKfycbzk7nfo9fH9-8UW1Cbyy2SvPjREjqOJKPFQ-phv16Lhe2IYTOkCba3lOfhNJWEmeJn5/exec';

    // Show sync status
    const showSyncing = (msg = '同期中...') => {
        toast.textContent = msg;
        toast.className = 'toast show';
    };
    const hideSyncing = () => {
        toast.className = 'toast';
    };

    // Save to GAS
    const pushDataToGas = async (key, data) => {
        try {
            await fetch(GAS_API_URL, {
                method: 'POST',
                mode: 'no-cors',
                headers: { 'Content-Type': 'text/plain' },
                body: JSON.stringify({ action: 'saveData', key: key, data: JSON.stringify(data) })
            });
        } catch (err) {
            console.error('GAS Save failed:', err);
        }
    };

    // Fetch all data from GAS on load
    const syncDataWithGas = async () => {
        showSyncing();
        try {
            // Use a small timeout or handle potential CORS/Network issues
            const controller = new AbortController();
            const id = setTimeout(() => controller.abort(), 8000); // 8 sec timeout

            const response = await fetch(GAS_API_URL, {
                signal: controller.signal
            });
            clearTimeout(id);

            if (!response.ok) throw new Error('Network response was not ok');

            const remoteData = await response.json();

            // Validate data structure before saving
            if (remoteData && typeof remoteData === 'object') {
                if (remoteData.reservations) localStorage.setItem('miyamoto_reservations', remoteData.reservations);
                if (remoteData.open_slots) localStorage.setItem('miyamoto_open_slots', remoteData.open_slots);
                if (remoteData.date_config) localStorage.setItem('miyamoto_date_config', remoteData.date_config);
                if (remoteData.owners) localStorage.setItem('miyamoto_owners', remoteData.owners);
                if (remoteData.admin_password) localStorage.setItem('miyamoto_admin_password', remoteData.admin_password);

                // Refresh UI with new data
                renderCalendar(currentDate);
                renderDashboard();
            }
            hideSyncing();
        } catch (err) {
            console.warn('Sync failed (using local data):', err);
            hideSyncing();
            // Do not alert error to user as it might be a temporary CORS issue
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

    const setStoredPassword = (pwd) => {
        localStorage.setItem('miyamoto_admin_password', pwd);
        pushDataToGas('admin_password', pwd);
    };

    const saveOwners = (owners) => {
        localStorage.setItem('miyamoto_owners', JSON.stringify(owners));
        pushDataToGas('owners', owners);
    };

    const saveReservation = (dateStr, data) => {
        const reservations = getReservations();
        if (!reservations[dateStr]) {
            reservations[dateStr] = [];
        }
        reservations[dateStr].push(data);
        localStorage.setItem('miyamoto_reservations', JSON.stringify(reservations));
        pushDataToGas('reservations', reservations);
        renderDashboard();
    };

    // --- Dashboard Logic ---
    const renderDashboard = () => {
        if (!dashboardTodayList || !dashboardWeekList) return;

        const reservations = getReservations();
        const today = new Date();
        const todayStr = toLocalYMD(today);

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

                // Show attendee count if > 1
                let countStr = '';
                if (r.attendees > 1) countStr = ` <span style="font-size:0.75rem; color:#718096;">(${r.attendees}名)</span>`;

                item.innerHTML = `
                    <div style="font-weight:700; color:#2d3748;">
                        ${r.timeSlot.split(' - ')[0]} - ${r.timeSlot.split(' - ')[1]}
                        ${tag}
                    </div>
                    <div style="font-size:0.8rem;">${r.name} 様${countStr}</div>
                `;
                dashboardTodayList.appendChild(item);
            });
        }

        // Render Week (Tomorrow to +7 days)
        dashboardWeekList.innerHTML = '';
        let hasWeekRes = false;

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

                const dayHeader = document.createElement('div');
                dayHeader.style.fontSize = '0.85rem';
                dayHeader.style.fontWeight = '700';
                dayHeader.style.color = '#718096';
                dayHeader.style.marginTop = '10px';
                dayHeader.style.marginBottom = '4px';
                dayHeader.textContent = `${nextDay.getMonth() + 1}/${nextDay.getDate()} (${dayName})`;
                dashboardWeekList.appendChild(dayHeader);

                dayGroups.forEach(r => {
                    let tag = '';
                    if (r.privacyType === 'open') tag = '<span style="font-size:0.65rem; background:#ecc94b; color:white; padding:1px 3px; border-radius:2px; margin-left:4px;">同席可</span>';

                    const item = document.createElement('div');
                    item.style.marginBottom = '4px';
                    item.style.padding = '4px 8px';
                    item.style.borderLeft = '2px solid #cbd5e0';
                    item.innerHTML = `
                        <span style="font-weight:600; margin-right:6px;">${r.timeSlot}</span>${tag}<br>
                        <span style="font-size:0.8rem;">${r.name} 様</span>
                    `;
                    dashboardWeekList.appendChild(item);
                });
            }
        }

        if (!hasWeekRes) {
            dashboardWeekList.innerHTML = '<div style="color:#a0aec0; font-size:0.8rem;">今週の予約はありません</div>';
        }
    };

    const deleteReservation = (dateStr, index) => {
        const reservations = getReservations();
        if (reservations[dateStr]) {
            reservations[dateStr].splice(index, 1);
            if (reservations[dateStr].length === 0) {
                delete reservations[dateStr];
            }
            localStorage.setItem('miyamoto_reservations', JSON.stringify(reservations));
            pushDataToGas('reservations', reservations);
        }
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
                    // Sort by timeSlot to find the earliest
                    daysReservations.sort((a, b) => a.timeSlot.localeCompare(b.timeSlot));
                    const earliestTime = daysReservations[0].timeSlot.split(' - ')[0]; // "10:00"

                    const countBadge = document.createElement('div');
                    countBadge.className = 'booking-count-badge';

                    if (daysReservations.length === 1) {
                        countBadge.textContent = `${earliestTime} (1件)`;
                    } else {
                        // e.g. "10:00 (2件)"
                        countBadge.textContent = `${earliestTime} (${daysReservations.length}件)`;
                    }
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
                    const isOpen = daysOpen.includes(slot);
                    const isBooked = daysReservations.some(r => r.timeSlot === slot && r.privacyType !== 'open'); // Booked if private
                    const hasOpenBooking = daysReservations.some(r => r.timeSlot === slot && r.privacyType === 'open'); // Has open booking

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
                    // Simplified time display (e.g., "10:00")
                    const simpleTime = slot.split(' - ')[0];
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

        timeSlots.forEach(slot => {
            const slotDiv = document.createElement('div');
            slotDiv.className = 'schedule-item';

            // Analyze status of this slot
            const resInThisSlot = daysReservations.filter(r => r.timeSlot === slot);
            const isBooked = resInThisSlot.length > 0;
            const isFullyBlocked = isBooked && resInThisSlot.some(r => r.privacyType !== 'open');
            const isOpenSlot = daysOpen.includes(slot);

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
                slotDiv.innerHTML = `
                    <div class="time">${slot}</div>
                    <div class="status">
                        <span class="badge booked">予約済</span>
                        <span class="booker-name">${mainRes.name} 様</span>
                    </div>
                 `;
            } else if (isBooked) {
                // Available but has existing OPEN bookings
                slotDiv.classList.add('available'); // It's still available!
                slotDiv.style.borderLeft = '4px solid #ecc94b'; // Yellow-ish for shared

                // Show existing participants
                const names = resInThisSlot.map(r => r.name + " 様").join(', ');
                slotDiv.innerHTML = `
                    <div class="time">${slot}</div>
                    <div style="flex:1; display:flex; flex-direction:column; align-items:flex-end; gap:4px;">
                        <button class="select-slot-btn" style="background:#d97706; color:white; font-weight:bold; border:none; padding:6px 14px; border-radius:6px; cursor:pointer; font-size:0.85rem; box-shadow: 0 2px 4px rgba(0,0,0,0.2); transition: background 0.2s;">予約する (同席)</button>
                        <span style="font-size:0.75rem; color:#744210;">先約: ${names}</span>
                    </div>
                `;

                slotDiv.addEventListener('click', () => {
                    // Pre-fill time and force "Open" mode if necessary
                    document.getElementById('timeSlot').value = slot;
                    selectedTimeDisplay.value = `${dateStr} ${slot}`;

                    // Show Form
                    bookingScheduleView.style.display = 'none';
                    bookingFormContainer.style.display = 'block';

                    // Auto-select "Open" and maybe disable "Private"
                    const privacyRadios = document.getElementsByName('privacyType');
                    privacyRadios.forEach(r => {
                        if (r.value === 'open') r.checked = true;
                    });
                    // Visual cue or alert defined in logic
                });

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
                    document.getElementById('timeSlot').value = slot;
                    selectedTimeDisplay.value = `${dateStr} ${slot}`;

                    // Show Form
                    bookingScheduleView.style.display = 'none';
                    bookingFormContainer.style.display = 'block';

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
        selectedTimeDisplay.value = `${modalDateTitle.dataset.date}  ${slot}`;

        // Transition
        bookingScheduleView.style.display = 'none';
        bookingFormContainer.style.display = 'block';
    };

    backToScheduleBtn.addEventListener('click', () => {
        bookingFormContainer.style.display = 'none';
        bookingScheduleView.style.display = 'block';
    });

    // Admin Management Modal
    const openAdminModal = (dateObj, dateStr) => {
        adminDateTitle.textContent = `${dateObj.getMonth() + 1}月${dateObj.getDate()}日の設定`;
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

            timeSlots.forEach((slot, index) => {
                const start = slot.split(' - ')[0];
                const end = slot.split(' - ')[1];

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

        const notice = document.createElement('div');
        notice.style.cssText = 'color: #718096; font-size: 0.9rem; margin-bottom: 0.5rem; background: #edf2f7; padding: 0.5rem; border-radius: 4px;';
        if (!canEdit) {
            notice.innerHTML = '<i class="fas fa-lock"></i> 予約枠の変更は教員・管理者のみ可能です。';
        } else {
            notice.innerHTML = '<i class="fas fa-info-circle"></i> チェックを入れた枠が「予約可能」になります。';
        }
        adminTimeSlots.appendChild(notice);

        // Date-Specific Settings (Same Day Booking)
        if (canEdit) {
            const dateConfig = getDateConfig();
            const currentConfig = dateConfig[dateStr] || {};
            const isAllowed = currentConfig.allowSameDay !== false; // Default true

            const settingsDiv = document.createElement('div');
            settingsDiv.style.marginBottom = '1rem';
            settingsDiv.style.padding = '8px';
            settingsDiv.style.background = '#fff';
            settingsDiv.style.border = '1px solid #e2e8f0';
            settingsDiv.style.borderRadius = '4px';

            const label = document.createElement('label');
            label.style.display = 'flex';
            label.style.alignItems = 'center';
            label.style.fontWeight = 'bold';
            label.style.cursor = 'pointer';

            const checkbox = document.createElement('checkbox'); // Create standard checkbox if needed, but input is enough
            const input = document.createElement('input');
            input.type = 'checkbox';
            input.checked = isAllowed;
            input.style.marginRight = '8px';

            input.addEventListener('change', () => {
                if (!dateConfig[dateStr]) dateConfig[dateStr] = {};
                dateConfig[dateStr].allowSameDay = input.checked;
                saveDateConfig(dateConfig);
                toast.textContent = '設定を保存しました';
                toast.className = 'toast show success';
                setTimeout(() => toast.className = 'toast', 3000);
            });

            label.appendChild(input);
            label.appendChild(document.createTextNode('当日予約を許可する（この日のみの設定）'));
            settingsDiv.appendChild(label);
            adminTimeSlots.appendChild(settingsDiv);
        }

        timeSlots.forEach((slot, index) => {
            const label = document.createElement('label');
            label.className = 'slot-checkbox-label';
            if (!canEdit) {
                label.style.opacity = '0.6';
                label.style.cursor = 'not-allowed';
            }

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.checked = daysOpen.includes(slot); // Checked means Available (In Open List)
            checkbox.disabled = !canEdit;

            checkbox.addEventListener('change', () => {
                if (!canEdit) return;
                toggleOpenSlot(dateStr, slot);
                renderCalendar(currentDate); // Refresh main cal to show status update
            });

            label.appendChild(checkbox);
            label.appendChild(document.createTextNode(slot));
            adminTimeSlots.appendChild(label);
        });

        // 2. Render Existing Reservations
        renderAdminReservationsList(dateStr);

        adminDayModal.classList.add('show');
    };

    const renderAdminReservationsList = (dateStr) => {
        adminReservationsList.innerHTML = '';
        const reservations = getReservations();
        const dayReservations = reservations[dateStr] || [];

        if (dayReservations.length === 0) {
            adminReservationsList.innerHTML = '<li style="color:#aaa; font-style:italic;">予約はありません</li>';
            return;
        }

        dayReservations.forEach((res, index) => {
            const li = createReservationListItem(res, dateStr, index, () => {
                renderAdminReservationsList(dateStr);
            });
            adminReservationsList.appendChild(li);
        });
    };

    const createReservationListItem = (res, dateStr, index, callback) => {
        const li = document.createElement('li');
        li.className = 'reservation-item';

        li.innerHTML = `
            <div class="reservation-info">
                <span class="reservation-time" style="font-size:0.8em; color:#888;">${dateStr}</span>
                <span class="reservation-time">${res.timeSlot}</span>
                <span>${res.name} (${res.studentId})</span><br>
                <span style="font-size:0.85em; color:#666;">${res.email || 'No Email'}</span><br>
                <span style="font-size:0.85em; font-weight:bold; color:#1a365d;">[${translateFormat(res.format)}]</span>
                <span style="font-size:0.85em; color:#666;">${translateType(res.type)}</span>
            </div>
            <button class="delete-btn">削除</button>
        `;

        li.querySelector('.delete-btn').addEventListener('click', () => {
            if (confirm('この予約を削除してもよろしいですか？')) {
                deleteReservation(dateStr, index);
                callback(); // Update List
                renderCalendar(currentDate); // Refresh main cal
            }
        });
        return li;
    };

    // All Reservations Logic
    allReservationsBtn.addEventListener('click', () => {
        renderAllReservations();
        allReservationsModal.classList.add('show');
    });

    const renderAllReservations = () => {
        allReservationsList.innerHTML = '';
        const reservations = getReservations();
        const allRes = [];

        // Flatten
        Object.keys(reservations).forEach(dateStr => {
            reservations[dateStr].forEach((res, index) => {
                allRes.push({ ...res, dateStr, originalIndex: index });
            });
        });

        // Sort by Date
        allRes.sort((a, b) => new Date(a.dateStr + ' ' + a.timeSlot.split(' - ')[0]) - new Date(b.dateStr + ' ' + b.timeSlot.split(' - ')[0]));

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

    copyAllDataBtn.addEventListener('click', () => {
        const reservations = getReservations();
        const text = JSON.stringify(reservations, null, 2);
        navigator.clipboard.writeText(text).then(() => {
            alert('予約データをクリップボードにコピーしました（JSON形式）');
        });
    });

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

    const renderOwnerList = () => {
        if (!ownerList) return;
        ownerList.innerHTML = '';
        const owners = getOwners();

        if (owners.length === 0) {
            ownerList.innerHTML = '<li style="color:#aaa; font-style:italic;">登録されたオーナーはいません</li>';
            return;
        }

        owners.forEach((owner, index) => {
            const li = document.createElement('li');
            li.className = 'reservation-item';
            li.innerHTML = `
                <div class="reservation-info">
                    <span style="font-weight:600; color:var(--color-primary);">${owner.name}</span>
                    <span style="font-size:0.85em; background:#edf2f7; padding:2px 6px; border-radius:4px; margin-left:6px;">${translateStatus(owner.status)}</span><br>
                    <span style="font-size:0.85em; color:#666;">${owner.email}</span>
                    ${owner.notify ? '<span style="font-size:0.8em; color:var(--color-success); margin-left:4px;"><i class="fas fa-bell"></i> 通知ON</span>' : '<span style="font-size:0.8em; color:#a0aec0; margin-left:4px;"><i class="fas fa-bell-slash"></i> 通知OFF</span>'}
                </div>
                <button class="delete-btn">削除</button>
            `;

            li.querySelector('.delete-btn').addEventListener('click', () => {
                if (confirm(`${owner.name} さんを削除してもよろしいですか？`)) {
                    owners.splice(index, 1);
                    saveOwners(owners);
                    renderOwnerList();
                }
            });
            ownerList.appendChild(li);
        });
    };

    if (addOwnerForm) {
        addOwnerForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const newOwner = {
                name: document.getElementById('ownerName').value,
                status: document.getElementById('ownerStatus').value,
                email: document.getElementById('ownerEmail').value,
                password: document.getElementById('ownerPassword').value, // Capture password
                notify: document.getElementById('ownerNotify').checked
            };

            const owners = getOwners();
            owners.push(newOwner);
            saveOwners(owners);

            addOwnerForm.reset();
            document.getElementById('ownerNotify').checked = true; // reset checkbox to default
            renderOwnerList();
            alert(`${newOwner.name} さんを追加しました。\n初期パスワード: ${newOwner.password}`);
        });
    }

    // Batch Registration Logic
    if (batchRegistrationBtn) {
        batchRegistrationBtn.addEventListener('click', () => {
            // Populate Time Selects
            batchStartTime.innerHTML = '';
            batchEndTime.innerHTML = '';
            timeSlots.forEach((slot, index) => {
                const start = slot.split(' - ')[0];
                const end = slot.split(' - ')[1];

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
            if (!openSlots[dateStr]) openSlots[dateStr] = [];

            let addedCount = 0;
            for (let i = startIndex; i <= endIndex; i++) {
                const slot = timeSlots[i];
                if (!openSlots[dateStr].includes(slot)) {
                    openSlots[dateStr].push(slot);
                    addedCount++;
                }
            }

            if (addedCount > 0) {
                localStorage.setItem('miyamoto_open_slots', JSON.stringify(openSlots));
                renderCalendar(currentDate); // Refresh main cal
                openAdminModal(new Date(dateStr), dateStr); // Re-render this modal to update checkboxes
            }
        });
    }

    // Dynamic Attendee Fields
    if (attendeesInput) {
        attendeesInput.addEventListener('input', () => {
            const count = parseInt(attendeesInput.value) || 1;
            additionalAttendeesContainer.innerHTML = '';

            if (count > 1) {
                for (let i = 1; i < count; i++) {
                    const div = document.createElement('div');
                    div.style.marginBottom = '1.5rem';
                    div.innerHTML = `
                        <h5 style="font-size: 0.9rem; margin-bottom: 0.5rem; color: #4a5568;">参加者 ${i + 1} (学生)</h5>
                        <div class="form-group" style="margin-bottom: 0.5rem;">
                            <input type="text" class="add-name" placeholder="氏名" required style="width: 100%; padding: 8px; border: 1px solid #e2e8f0; border-radius: 6px;">
                        </div>
                        <div class="form-group" style="margin-bottom: 0.5rem;">
                            <input type="text" class="add-id" placeholder="学籍番号" required style="width: 100%; padding: 8px; border: 1px solid #e2e8f0; border-radius: 6px;">
                        </div>
                        <div class="form-group">
                            <input type="email" class="add-email" placeholder="メールアドレス (任意)" style="width: 100%; padding: 8px; border: 1px solid #e2e8f0; border-radius: 6px;">
                        </div>
                    `;
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
            let count = 0;

            // Iterate Dates
            for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
                if (selectedDays.includes(d.getDay())) {
                    const dateStr = toLocalYMD(d);
                    if (!openSlots[dateStr]) openSlots[dateStr] = [];

                    // Add slots in range
                    for (let i = startIndex; i <= endIndex; i++) {
                        const slot = timeSlots[i];
                        if (!openSlots[dateStr].includes(slot)) {
                            openSlots[dateStr].push(slot);
                            count++;
                        }
                    }
                }
            }

            localStorage.setItem('miyamoto_open_slots', JSON.stringify(openSlots));
            renderCalendar(currentDate);
            batchRegistrationModal.classList.remove('show');
            showToast(`${count}枠を追加しました。`);
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
        const firstSlotParts = neededSlots[0].split(' - ');
        const lastSlotParts = neededSlots[neededSlots.length - 1].split(' - ');
        const displayTimeRange = `${firstSlotParts[0]} - ${lastSlotParts[1]}`;

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
        let collision = false;
        let notOpen = false;
        let privacyError = false;

        for (const slot of neededSlots) {
            if (!dayOpenSlots.includes(slot)) {
                notOpen = true; // Not in open hours/slots
                break;
            }

            // Check existing reservations for this slot
            const existingRes = dayReservations.filter(r => r.timeSlot === slot);

            if (existingRes.length > 0) {
                // If any existing reservation is 'private', it's a collision
                if (existingRes.some(r => r.privacyType !== 'open')) {
                    collision = true;
                    break;
                }
                // If all are 'open', but current user wants 'private', it's an error
                if (formData.privacyType === 'private') {
                    privacyError = true; // "Cannot book private in a shared slot"
                    break;
                }
                // Else: User wants 'open', existing are 'open' -> OK to join!
            }
        }

        if (notOpen) {
            alert('申し訳ありません、選択された時間帯の一部が予約受付していない枠です。');
            return;
        }
        if (collision) {
            alert('申し訳ありません、選択された時間帯の一部が既に「予約済み（個別）」で埋まっています。');
            return;
        }
        if (privacyError) {
            alert('選択された時間帯には既に他の予約が入っています。「同席を許可」を選択した場合のみ予約可能です。');
            return;
        }

        // Save Reservation (One entry per slot needed to block the calendar)
        // We act as if the user made 2-4 separate bookings but with same info
        neededSlots.forEach(slot => {
            const slotData = { ...formData, timeSlot: slot, fullRange: displayTimeRange };
            // fullRange can be used for display logic later if we want to show merged
            saveReservation(datesStr, slotData);
        });

        reservationModal.classList.remove('show');
        renderCalendar(currentDate);

        // Notification Logic
        const owners = getOwners();
        // Collect owner emails to CC
        const ownerEmails = owners.filter(o => o.notify && o.email).map(o => o.email).join(',');

        // Prepare Recipient List (Main + Others)
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

        // Build Attendees String
        let attendeesStr = `${formData.name} (${formData.studentId})`;
        if (additionalAttendees.length > 0) {
            attendeesStr += '\n';
            additionalAttendees.forEach((a, idx) => {
                attendeesStr += `参加者${idx + 1}: ${a.name} (${a.id})\n`;
            });
        }

        const mailSubject = `【面談予約完了】宮本研面談予約 (${formatDate(datesStr)})`;
        const mailBody = `
${formData.name} 様
(および参加予定の皆様)

以下の内容で面談予約を受け付けました。

■日時: ${datesStr} ${displayTimeRange} (所要時間: ${durationSteps * 30}分)
■公開設定: ${formData.privacyType === 'open' ? '他の学生の同席を許可' : '個別面談'}
■形式: ${translateFormat(formData.format)}
■内容: ${translateType(formData.type)}
■参加人数: ${formData.attendees}名
■参加者:
${attendeesStr}

※ご都合が悪くなった場合は、速やかにご連絡ください。
※このメールは送信専用アドレスから送信されています。
`;

        // 1. Send Confirmation to All Students (Only if emails exist)
        if (allStudentEmails) {
            fetch(GAS_API_URL, {
                method: 'POST',
                mode: 'no-cors',
                headers: {
                    'Content-Type': 'text/plain'
                },
                body: JSON.stringify({
                    action: 'sendEmail', // Explicit action
                    to: allStudentEmails, // comma-separated list
                    subject: mailSubject,
                    body: mailBody
                })
            }).catch(err => console.error('Student email failed', err));
        }

        // 2. Send Notification to Owners (Separate Mail)
        if (ownerEmails) {
            const ownerSubject = `【新規予約】${formData.name}様 (${datesStr} ${displayTimeRange})`;
            const ownerBody = `
管理者各位

新しい予約が入りました。

■日時: ${datesStr} ${displayTimeRange}  (所要時間: ${durationSteps * 30}分)
■公開設定: ${formData.privacyType === 'open' ? '他の学生の同席を許可' : '個別面談'}
■代表氏名: ${formData.name} (${formData.studentId})
■参加人数: ${formData.attendees}名
■全参加者:
${attendeesStr}

■形式: ${translateFormat(formData.format)}
■内容: ${translateType(formData.type)}
■代表メール: ${formData.email || 'なし'}
■備考: ${formData.remarks || 'なし'}

※オーナー管理画面で設定されたアドレスに送信しています。
`;

            // Allow a small delay to avoid rate limiting or race conditions in GAS (optional but safe)
            setTimeout(() => {
                fetch(GAS_API_URL, {
                    method: 'POST',
                    mode: 'no-cors',
                    headers: {
                        'Content-Type': 'text/plain'
                    },
                    body: JSON.stringify({
                        action: 'sendEmail', // Added missing action
                        to: ownerEmails,
                        subject: ownerSubject,
                        body: ownerBody
                    })
                }).catch(err => console.error('Owner email failed', err));
            }, 500);
        }

        // --- Data Synchronization with GAS and Google Sheets ---
        // This sends the reservation data to Google Apps Script to be recorded in a Google Sheet.
        fetch(GAS_API_URL, {
            method: 'POST',
            mode: 'no-cors', // Required for cross-origin requests to GAS
            headers: {
                'Content-Type': 'text/plain' // GAS expects plain text for simple POSTs
            },
            body: JSON.stringify({
                action: 'recordReservation', // Custom action for GAS to identify
                reservationData: {
                    date: datesStr,
                    timeSlot: displayTimeRange,
                    duration: `${durationSteps * 30}分`,
                    privacyType: formData.privacyType === 'open' ? '同席を許可' : '個別面談',
                    format: translateFormat(formData.format),
                    type: translateType(formData.type),
                    name: formData.name,
                    studentId: formData.studentId,
                    email: formData.email,
                    attendeesCount: formData.attendees,
                    additionalAttendees: additionalAttendees.map(a => `${a.name} (${a.id})`).join(', '),
                    remarks: formData.remarks,
                    timestamp: formData.timestamp,
                    rawSlots: neededSlots.join(', ')
                }
            })
        })
            .then(response => {
                // GAS will return a 200 OK even with no-cors, but we can't read the response body.
                // We just assume it worked if there's no network error.
                console.log('Reservation data sent to Google Sheet via GAS.');
            })
            .catch(error => {
                console.error('Failed to send reservation data to Google Sheet:', error);
                alert('予約データの保存中にエラーが発生しました。管理者にお問い合わせください。');
            });

        // User Feedback
        let alertMsg = `予約が完了しました。\n\n確認メールを ${formData.email} 宛に送信しました。`;
        if (ownerEmails) {
            alertMsg += `\n(教員・管理者にも通知を送信しました)`;
        }
        alert(alertMsg);

        showToast('予約が完了しました');
    });

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

            allReservationsBtn.style.display = 'inline-block';
            ownerManagementBtn.style.display = 'inline-block';

            // Permission Check for Batch Button
            const isFaculty = currentAdminUser && currentAdminUser.status === 'faculty';
            const isAdmin = currentAdminUser && currentAdminUser.status === 'admin';
            const isSystemAdmin = !currentAdminUser;

            if (isFaculty || isAdmin || isSystemAdmin) {
                batchRegistrationBtn.style.display = 'inline-block';
            } else {
                batchRegistrationBtn.style.display = 'none';
            }

            document.body.classList.add('admin-mode');
        } else {
            adminToggleBtn.textContent = '管理者モード: OFF';
            adminToggleBtn.classList.remove('active');
            allReservationsBtn.style.display = 'none';
            ownerManagementBtn.style.display = 'none';
            batchRegistrationBtn.style.display = 'none';
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

    // Initial Render (Immediate from LocalStorage)
    renderCalendar(currentDate);
    renderDashboard();

    // Start Sync (Background)
    syncDataWithGas();
});
