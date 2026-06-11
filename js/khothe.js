// Dữ liệu mẫu (sau này lấy từ C++ API)
let decks = [
    { id: 1, name: "Tiếng Anh", examDate: "2026-06-20", cards: [] }
];

// Hàm tính ngày còn lại
function getDaysRemaining(dateStr) {
    const diff = new Date(dateStr) - new Date();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

// Render lưới bộ thẻ
function renderDecks() {
    const grid = document.getElementById('deck-grid');
    grid.innerHTML = decks.map(d => `
        <div class="deck-card">
            <div class="dots-menu" onclick="toggleMenu(${d.id})">...</div>
            <h3>${d.name}</h3>
            <div class="date-badge">Còn ${getDaysRemaining(d.examDate)} ngày</div>
            <button onclick="openDeck(${d.id})">Vào học</button>
        </div>
    `).join('');
}

// Logic đánh giá độ khó thẻ (khi mở bộ thẻ)
function addCardToDeck(deckId, front, back, difficulty) {
    // difficulty: 'easy', 'medium', 'hard'
    // Lưu vào mảng và update UI
    console.log(`Thêm thẻ vào bộ ${deckId} với độ khó ${difficulty}`);
}

// Thao tác menu 3 chấm
function toggleMenu(id) {
    // Hiển thị/ẩn dropdown: Yêu thích, Chỉnh sửa, Xóa
}