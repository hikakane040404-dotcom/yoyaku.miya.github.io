document.addEventListener('DOMContentLoaded', () => {
    // State
    let currentDate = new Date();
    let isAdminMode = false;
    const DEFAULT_PASSWORD = 'admin'; // Initial password

    const timeSlots = [
        "10:00 - 10:30",
        "10:30 - 11:00",
        "11:00 - 11:30",
        "11:30 - 12:00",
        "13:00 - 13:30",
        "13:30 - 14:00",
        "14:00 - 14:30",
        "14:30 - 15:00",
        "15:00 - 15:30",
        "15:30 - 16:00",
        "16:00 - 16:30",
        "16:30 - 17:00"
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
    const timeSlotSelect = document.getElementById('timeSlot');

    // DOM Elements - Admin Modal
    const adminDayModal = document.getElementById('adminDayModal');
    const adminDateTitle = document.getElementById('adminDateTitle');
    const adminTimeSlots = document.getElementById('adminTimeSlots');
    const adminReservationsList = document.getElementById('adminReservationsList');

    // DOM Elements - Password Modals
    const passwordModal = document.getElementById('passwordModal');
    const passwordForm = document.getElementById('passwordForm');
    const adminPasswordInput = document.getElementById('adminPassword');

    const changePasswordModal = document.getElementById('changePasswordModal');
    const changePasswordForm = document.getElementById('changePasswordForm');
    const currentPasswordInput = document.getElementById('currentPasswordInput');
    const newPasswordInput = document.getElementById('newPasswordInput');

    // DOM Elements - All Reservations Modal
    const allReservationsModal = document.getElementById('allReservationsModal');
    const allReservationsList = document.getElementById('allReservationsList');
    const copyAllDataBtn = document.getElementById('copyAllDataBtn');

    // Close buttons
    document.querySelectorAll('.closeModal').forEach(btn => {
        btn.addEventListener('click', () => {
            reservationModal.classList.remove('show');
            adminDayModal.classList.remove('show');
            passwordModal.classList.remove('show');
            changePasswordModal.classList.remove('show');
            allReservationsModal.classList.remove('show');
        });
    });

    // Local Storage Helpers
    const getStoredPassword = () => {
        return localStorage.getItem('miyamoto_admin_password') || DEFAULT_PASSWORD;
    };

    const setStoredPassword = (pwd) => {
        localStorage.setItem('miyamoto_admin_password', pwd);
    };

    const getReservations = () => {
        const data = localStorage.getItem('miyamoto_reservations');
        return data ? JSON.parse(data) : {};
    };

    const saveReservation = (dateStr, data) => {
        const reservations = getReservations();
        if (!reservations[dateStr]) {
            reservations[dateStr] = [];
        }
        reservations[dateStr].push(data);
        localStorage.setItem('miyamoto_reservations', JSON.stringify(reservations));
    };

    const deleteReservation = (dateStr, index) => {
        const reservations = getReservations();
        if (reservations[dateStr]) {
            reservations[dateStr].splice(index, 1);
            if (reservations[dateStr].length === 0) {
                delete reservations[dateStr];
            }
            localStorage.setItem('miyamoto_reservations', JSON.stringify(reservations));
        }
    };

    const getBlockedSlots = () => {
        const data = localStorage.getItem('miyamoto_blocked');
        return data ? JSON.parse(data) : {};
    };

    const toggleBlockedSlot = (dateStr, slot) => {
        const blocked = getBlockedSlots();
        if (!blocked[dateStr]) {
            blocked[dateStr] = [];
        }

        const index = blocked[dateStr].indexOf(slot);
        if (index === -1) {
            blocked[dateStr].push(slot); // Add to blocked list
        } else {
            blocked[dateStr].splice(index, 1); // Remove from blocked list (make available)
        }

        // Cleanup if empty
        if (blocked[dateStr].length === 0) {
            delete blocked[dateStr];
        }

        localStorage.setItem('miyamoto_blocked', JSON.stringify(blocked));
    };

    const getAvailableSlots = (dateStr) => {
        const reservations = getReservations();
        const blocked = getBlockedSlots();

        const daysReservations = reservations[dateStr] || [];
        const daysBlocked = blocked[dateStr] || [];

        const bookedTimes = daysReservations.map(r => r.timeSlot);
        const blockedTimes = daysBlocked;

        return timeSlots.filter(slot => !bookedTimes.includes(slot) && !blockedTimes.includes(slot));
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
            const dateStr = d.toISOString().split('T')[0];
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
                const availableSlots = getAvailableSlots(dateStr);
                const availableCount = availableSlots.length;

                // Status Dots
                const statusContainer = document.createElement('div');
                statusContainer.className = 'availability-indicator';

                if (availableCount <= 0) {
                    statusContainer.innerHTML = '<span class="dot full"></span>';
                } else if (availableCount <= 2) {
                    statusContainer.innerHTML = '<span class="dot few"></span>';
                } else {
                    statusContainer.innerHTML = '<span class="dot available"></span>';
                }
                el.appendChild(statusContainer);

                // Tooltip (Visualization of All Slots)
                const tooltip = document.createElement('div');
                tooltip.className = 'cell-tooltip';

                let tooltipHtml = '<div class="tooltip-title">予約状況</div><div class="tooltip-grid">';

                const reservations = getReservations();
                const blocked = getBlockedSlots();
                const daysReservations = reservations[dateStr] || [];
                const daysBlocked = blocked[dateStr] || [];
                const bookedTimes = daysReservations.map(r => r.timeSlot);

                timeSlots.forEach(slot => {
                    let className = 'tooltip-slot';
                    if (bookedTimes.includes(slot)) {
                        className += ' booked';
                    } else if (daysBlocked.includes(slot)) {
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
                el.addEventListener('click', () => handleDateClick(d, dateStr));
            }

            calendarGrid.appendChild(el);
        }
    };

    const handleDateClick = (dateObj, dateStr) => {
        if (isAdminMode) {
            openAdminModal(dateObj, dateStr);
        } else {
            openBookingModal(dateObj, dateStr);
        }
    };

    // User Booking Modal
    const openBookingModal = (dateObj, dateStr) => {
        reservationForm.reset();
        modalDateTitle.textContent = `${dateObj.getMonth() + 1}月${dateObj.getDate()}日の予約`;
        modalDateTitle.dataset.date = dateStr;

        timeSlotSelect.innerHTML = '';
        const availableSlots = getAvailableSlots(dateStr);

        if (availableSlots.length === 0) {
            alert('この日は予約可能な枠がありません。');
            return;
        }

        availableSlots.forEach(slot => {
            const opt = document.createElement('option');
            opt.value = slot;
            opt.textContent = slot;
            timeSlotSelect.appendChild(opt);
        });

        reservationModal.classList.add('show');
    };

    // Admin Management Modal
    const openAdminModal = (dateObj, dateStr) => {
        adminDateTitle.textContent = `${dateObj.getMonth() + 1}月${dateObj.getDate()}日の設定`;
        adminDateTitle.dataset.date = dateStr;

        // 1. Render Slots Checkboxes
        adminTimeSlots.innerHTML = '';
        const blocked = getBlockedSlots();
        const daysBlocked = blocked[dateStr] || [];

        timeSlots.forEach(slot => {
            const label = document.createElement('label');
            label.className = 'slot-checkbox-label';

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.checked = !daysBlocked.includes(slot); // Checked means Available
            checkbox.addEventListener('change', () => {
                toggleBlockedSlot(dateStr, slot);
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

        allRes.forEach(res => {
            // Re-find index (naive but safe given structure)
            const currentReservations = getReservations();
            const idx = currentReservations[res.dateStr].findIndex(r => r.timestamp === res.timestamp);

            if (idx !== -1) {
                const li = createReservationListItem(res, res.dateStr, idx, () => {
                    renderAllReservations(); // Refresh self
                });
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

    // Form Submit
    reservationForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const dateStr = modalDateTitle.dataset.date;
        const formData = {
            name: document.getElementById('name').value,
            studentId: document.getElementById('studentId').value,
            email: document.getElementById('email').value,
            format: document.getElementById('format').value,
            timeSlot: document.getElementById('timeSlot').value,
            type: document.getElementById('type').value,
            timestamp: new Date().toISOString()
        };

        const reservations = getReservations();

        // Double check collision
        const bookedTimes = (reservations[dateStr] || []).map(r => r.timeSlot);
        if (bookedTimes.includes(formData.timeSlot)) {
            alert('申し訳ありません、その枠は埋まってしまいました。');
            return;
        }

        saveReservation(dateStr, formData);
        reservationModal.classList.remove('show');
        renderCalendar(currentDate);

        // Simulated Email Notification
        const mailBody = `
件名: 【面談予約完了】宮本研面談予約 (${dateStr})

${formData.name} 様

以下の内容で面談予約を受け付けました。

日時: ${dateStr} ${formData.timeSlot}
形式: ${translateFormat(formData.format)}
内容: ${translateType(formData.type)}

※このメールは送信専用です。
        `;
        alert(`【メール送信シミュレーション】\n\n管理者と予約者(${formData.email})に通知メールを送信しました。\n\n${mailBody}`);

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
            updateAdminUI();
            showToast('管理者モードを終了しました。');
        } else {
            // Turn ON -> Prompt Password
            passwordForm.reset();
            passwordModal.classList.add('show');
            setTimeout(() => adminPasswordInput.focus(), 100);
        }
    });

    // Password Login Submit
    passwordForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const input = adminPasswordInput.value;
        const correct = getStoredPassword();

        if (input === correct) {
            isAdminMode = true;
            passwordModal.classList.remove('show');
            updateAdminUI();
            showToast('管理者モードでログインしました。');
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
        const stored = getStoredPassword();

        if (current !== stored) {
            alert('現在のパスワードが間違っています。');
            return;
        }

        if (newPwd.length < 4) {
            alert('新しいパスワードは4文字以上にしてください。');
            return;
        }

        setStoredPassword(newPwd);
        changePasswordModal.classList.remove('show');
        showToast('パスワードを変更しました。');
    });

    const updateAdminUI = () => {
        if (isAdminMode) {
            adminToggleBtn.textContent = '管理者モード: ON';
            adminToggleBtn.classList.add('active');
            changePasswordBtn.style.display = 'inline-block';
            allReservationsBtn.style.display = 'inline-block';
            document.body.classList.add('admin-mode');
        } else {
            adminToggleBtn.textContent = '管理者モード: OFF';
            adminToggleBtn.classList.remove('active');
            changePasswordBtn.style.display = 'none';
            allReservationsBtn.style.display = 'none';
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
    });

    // Initial Render
    renderCalendar(currentDate);
});
