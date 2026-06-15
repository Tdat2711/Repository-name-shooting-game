// ==========================================================================
// MAIN.JS
// ==========================================================================

import {
    renderCalendar,
    triggerStreakCheckin
} from './calendar.js';

import {
    initUploadMechanism
} from './upload.js';

document.addEventListener('DOMContentLoaded', () => {

    // ==========================================================
    // Calendar
    // ==========================================================

    if (document.getElementById('calendarGridDates')) {
        renderCalendar();
    }

    // ==========================================================
    // Streak Check-in
    // ==========================================================

    const btnStreak =
        document.getElementById('btnStreakCheck');

    if (btnStreak) {
        btnStreak.addEventListener(
            'click',
            triggerStreakCheckin
        );
    }

    // ==========================================================
    // Upload Flashcard
    // ==========================================================

    if (typeof initUploadMechanism === 'function') {
        initUploadMechanism();
    }

    // ==========================================================
    // Nút Ôn tập nhanh
    // ==========================================================

    const btnReview =
        document.getElementById('btnStartReview');

    if (btnReview) {
        btnReview.addEventListener(
            'click',
            () => {
                window.location.href =
                    'ontap.html';
            }
        );
    }

    // ==========================================================
    // Hiển thị thông tin User
    // ==========================================================

    const currentUser =
        JSON.parse(
            localStorage.getItem(
                'currentUser'
            )
        );

    if (currentUser) {

        const userNames =
            document.querySelectorAll(
                '#userName'
            );

        userNames.forEach(el => {
            el.textContent =
                currentUser.name;
        });

        const userId =
            document.getElementById(
                'userId'
            );

        if (userId) {
            userId.textContent =
                `ID: ${currentUser.id}`;
        }
    }

});