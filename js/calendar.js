// ====================================================================
// CALENDAR.JS
// ====================================================================

let currentDisplayDate = new Date();

// ====================================================================
// USER DATA
// ====================================================================

function getUserData() {

    let data = JSON.parse(
        localStorage.getItem("FMN_CALENDAR")
    );

    if (!data) {

        data = {
            streak: 0,
            checkedDates: [],
            studyStats: {}
        };

        localStorage.setItem(
            "FMN_CALENDAR",
            JSON.stringify(data)
        );
    }

    return data;
}

function saveUserData(data) {

    localStorage.setItem(
        "FMN_CALENDAR",
        JSON.stringify(data)
    );
}

// ====================================================================
// CALENDAR
// ====================================================================

function renderCalendar() {

    const grid =
        document.getElementById(
            "calendarGridDates"
        );

    if (!grid) return;

    grid.innerHTML = "";

    const year =
        currentDisplayDate.getFullYear();

    const month =
        currentDisplayDate.getMonth();

    const monthNames = [
        "January","February","March",
        "April","May","June",
        "July","August","September",
        "October","November","December"
    ];

    document.getElementById(
        "calendarHeaderTitle"
    ).textContent =
        `${monthNames[month]} ${year}`;

    const firstDay =
        new Date(year, month, 1).getDay();

    const daysInMonth =
        new Date(year, month + 1, 0).getDate();

    const data =
        getUserData();

    // ô trống đầu tháng

    for(let i = 0; i < firstDay; i++){

        const empty =
            document.createElement("div");

        empty.className =
            "calendar-empty";

        grid.appendChild(empty);
    }

    // ngày trong tháng

    for(let day = 1; day <= daysInMonth; day++){

        const dayBox =
            document.createElement("div");

        dayBox.className =
            "calendar-day";

        dayBox.textContent = day;

        const dateString =
            `${year}-${month+1}-${day}`;

        if(
            data.checkedDates.includes(
                dateString
            )
        ){
            dayBox.classList.add(
                "checked-day"
            );
        }

        const today =
            new Date();

        if(
            day === today.getDate() &&
            month === today.getMonth() &&
            year === today.getFullYear()
        ){
            dayBox.classList.add(
                "today"
            );
        }

        dayBox.addEventListener(
            "click",
            () => showDayDetail(dateString)
        );

        grid.appendChild(dayBox);
    }
}

// ====================================================================
// DETAIL
// ====================================================================

function showDayDetail(dateString){

    const data =
        getUserData();

    const stat =
        data.studyStats[dateString] || {
            decks: 0,
            cards: 0,
            minutes: 0
        };

    document.getElementById(
        "detailDate"
    ).textContent =
        dateString;

    document.getElementById(
        "detailCheckin"
    ).textContent =
        data.checkedDates.includes(dateString)
        ? "Đã điểm danh"
        : "Chưa điểm danh";

    document.getElementById(
        "detailDecks"
    ).textContent =
        stat.decks;

    document.getElementById(
        "detailCards"
    ).textContent =
        stat.cards;

    document.getElementById(
        "detailTime"
    ).textContent =
        stat.minutes + " phút";
}

// ====================================================================
// STREAK
// ====================================================================

function updateStreakDisplay(){

    const data =
        getUserData();

    const streakEl =
        document.getElementById(
            "streakCount"
        );

    if(streakEl){
        streakEl.textContent =
            data.streak;
    }
}

function triggerStreakCheckin(){

    const data =
        getUserData();

    const today =
        new Date();

    const dateString =
        `${today.getFullYear()}-${today.getMonth()+1}-${today.getDate()}`;

    if(
        data.checkedDates.includes(
            dateString
        )
    ){
        alert(
            "Hôm nay bạn đã điểm danh rồi 🔥"
        );
        return;
    }

    data.checkedDates.push(
        dateString
    );

    data.streak++;

    saveUserData(data);

    updateStreakDisplay();

    renderCalendar();

    alert(
        `Điểm danh thành công! 🔥\nStreak: ${data.streak} ngày`
    );
}

// ====================================================================
// MONTH
// ====================================================================

function changeMonth(step){

    currentDisplayDate.setMonth(
        currentDisplayDate.getMonth()
        + step
    );

    renderCalendar();
}

// ====================================================================
// INIT
// ====================================================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        renderCalendar();

        updateStreakDisplay();

        document
            .getElementById(
                "btnStreakCheck"
            )
            ?.addEventListener(
                "click",
                triggerStreakCheckin
            );

        document
            .getElementById(
                "prevMonth"
            )
            ?.addEventListener(
                "click",
                () => changeMonth(-1)
            );

        document
            .getElementById(
                "nextMonth"
            )
            ?.addEventListener(
                "click",
                () => changeMonth(1)
            );

    }
);