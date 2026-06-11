export function renderCalendar(currentDisplayDate) {
    let grid = document.getElementById('calendarGridDates');
    if (!grid) return;
    grid.innerHTML = "";
    
    let year = currentDisplayDate.getFullYear();
    let month = currentDisplayDate.getMonth();
    let daysInMonth = new Date(year, month + 1, 0).getDate();
    
    for (let i = 1; i <= daysInMonth; i++) {
        let dayEl = document.createElement('div');
        dayEl.innerText = i;
        dayEl.className = "calendar-day"; // Định nghĩa style trong style.css
        grid.appendChild(dayEl);
    }
}

export function triggerStreakCheckin() {
    alert('Điểm danh thành công! Streak của bạn đã tăng.');
}