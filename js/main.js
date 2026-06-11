import { renderCalendar, triggerStreakCheckin } from './calendar.js';
import { initUploadMechanism } from './upload.js';

document.addEventListener('DOMContentLoaded', () => {
    // Khởi tạo các module
    if (document.getElementById('calendarGridDates')) {
        renderCalendar(new Date());
    }
    
    if (document.getElementById('btnStreakCheck')) {
        document.getElementById('btnStreakCheck').addEventListener('click', triggerStreakCheckin);
    }
    
    initUploadMechanism();
    
    // Điều hướng nhanh
    const btnStudy = document.getElementById('btnStartReview');
    if (btnStudy) btnStudy.onclick = () => window.location.href = 'ontap.html';
});

// /js/main.js
import { handleStreakCheck } from './calendar.js';
import { handleFileUpload } from './upload.js';

document.addEventListener('DOMContentLoaded', () => {
    // Điểm danh
    document.getElementById('btn-streak-check').addEventListener('click', handleStreakCheck);
    
    // Upload file
    document.getElementById('btn-create-flashcard').addEventListener('click', () => {
        document.getElementById('file-upload-input').click();
    });
    document.getElementById('file-upload-input').addEventListener('change', handleFileUpload);
    
    // Bắt đầu ôn tập
    document.getElementById('btn-start-review').addEventListener('click', () => {
        window.location.href = 'ontap.html';
    });
});