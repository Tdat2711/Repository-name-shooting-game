// ==========================================================================
// CORE DATA STATE MANAGEMENT (Đồng bộ sâu 2 cấp: Bộ thẻ và Thẻ con)
// ==========================================================================
let Decks = JSON.parse(localStorage.getItem("decks")) || [];
let activeFilter = "all";
let searchQuery = "";
let sortMode = "default";

// Trạng thái điều khiển phân tầng dữ liệu thẻ con
let selectedDeckIdForManager = null; 
let currentEditingDeckId = null;

// ==========================================================================
// KHỞI CHẠY KHÔNG GIAN DỮ LIỆU KHI TẢI TRANG (Hệ thống thời gian thực 2026)
// ==========================================================================
document.addEventListener("DOMContentLoaded", () => {
    initMockUser();
    if (Decks.length === 0) {
        seedRobustDemoData();
    }
    refreshUI();
    registerCoreEvents();
});

function initMockUser() {
    const user = { name: "Trần Minh Long", id: "FMN-2026-88" };
    localStorage.setItem("currentUser", JSON.stringify(user));
    document.querySelector(".user-name").textContent = user.name;
    document.querySelector(".user-id").textContent = `ID: ${user.id}`;
}

// Chèn dữ liệu mẫu phức hợp (Mốc cố định hệ thống: Tháng 06/2026)
function seedRobustDemoData() {
    Decks = [
        {
            id: 1690000000001,
            name: "Cấu Trúc Dữ Liệu Lớp Chất Lượng Cao",
            desc: "Tổng hợp các dạng câu hỏi lý thuyết cây nhị phân AVL, đồ thị b-tree và thuật toán tìm kiếm tối ưu.",
            examDate: "2026-06-18", // Thời gian < 5 ngày so với 15/06/2026 -> Red Zone kích hoạt tự động
            starred: true,
            cards: [
                { id: 1, front: "Độ phức tạp thuật toán tìm kiếm trên cây AVL?", back: "O(log n) trong cả trường hợp xấu nhất.", difficulty: "medium" },
                { id: 2, front: "Cấu trúc dữ liệu nào hoạt động theo cơ chế LIFO?", back: "Ngăn xếp (Stack).", difficulty: "easy" }
            ]
        },
        {
            id: 1690000000002,
            name: "Từ Vựng Tiếng Anh Chuyên Ngành Công Nghệ",
            desc: "Bao gồm các thuật ngữ cốt lõi về Microservices, Cloud Computing và CI/CD Pipeline.",
            examDate: "2026-07-10",
            starred: false,
            cards: [
                { id: 1, front: "Idempotency có nghĩa là gì trong thiết kế API?", back: "Là việc gửi một yêu cầu nhiều lần cấu hình kết quả không thay đổi.", difficulty: "hard" }
            ]
        }
    ];
    saveState();
}

function saveState() {
    localStorage.setItem("decks", JSON.stringify(Decks));
}

function refreshUI() {
    renderDecksGrid();
    // Cập nhật số lượng hiển thị trên sidebar badge
    document.getElementById("sidebarDeckCount").textContent = Decks.length;
}

// ==========================================================================
// RENDER LƯỚI BỘ THẺ VÀ TÍNH TOÁN RED ZONE CHUẨN XÁC
// ==========================================================================
function renderDecksGrid() {
    const grid = document.getElementById("decksGrid");
    grid.innerHTML = "";

    // Thực hiện lọc dữ liệu nâng cao
    let result = Decks.filter(deck => {
        const query = searchQuery.toLowerCase();
        const matchesSearch = deck.name.toLowerCase().includes(query) || deck.desc.toLowerCase().includes(query);
        if (!matchesSearch) return false;

        if (activeFilter === "starred") return deck.starred;
        if (activeFilter === "cram") {
            const rem = getDaysRemaining(deck.examDate);
            return rem !== null && rem <= 5 && rem >= 0;
        }
        return true;
    });

    // Thực hiện sắp xếp dữ liệu cấu trúc
    if (sortMode === "name-asc") result.sort((a, b) => a.name.localeCompare(b.name));
    else if (sortMode === "name-desc") result.sort((a, b) => b.name.localeCompare(a.name));
    else if (sortMode === "cards-desc") result.sort((a, b) => (b.cards?.length || 0) - (a.cards?.length || 0));
    else if (sortMode === "cards-asc") result.sort((a, b) => (a.cards?.length || 0) - (b.cards?.length || 0));
    else if (sortMode === "exam-near") {
        result.sort((a, b) => {
            if (!a.examDate) return 1;
            if (!b.examDate) return -1;
            return new Date(a.examDate) - new Date(b.examDate);
        });
    }

    if (result.length === 0) {
        grid.innerHTML = `
            <div style="grid-column: 1/-1; padding: 60px 20px; text-align: center; font-weight: 800; border: 4px dashed #000; background: #fff;">
                <i class="fa-solid fa-folder-open" style="font-size: 32px; margin-bottom: 12px; display: block;"></i>
                KHÔNG TÌM THẤY BỘ THẺ NÀO THỎA MÃN ĐIỀU KIỆN!
            </div>`;
        return;
    }

    result.forEach(deck => {
        const daysLeft = getDaysRemaining(deck.examDate);
        const isCram = daysLeft !== null && daysLeft <= 5 && daysLeft >= 0;
        const totalCards = deck.cards ? deck.cards.length : 0;

        const card = document.createElement("div");
        card.className = `deck-card ${isCram ? 'red-zone-activated' : ''}`;
        
        card.innerHTML = `
            <div>
                ${isCram ? `<div class="cram-alert-indicator"><i class="fa-solid fa-triangle-exclamation"></i> CRAM MODE ACTIVATED</div>` : ''}
                <div class="card-top-row">
                    <h3 class="deck-main-title">${deck.name}</h3>
                    <div class="dots-menu-box">
                        <button class="dots-trigger-btn" onclick="openContextMenu(event, ${deck.id})">
                            <i class="fa-solid fa-ellipsis-vertical"></i>
                        </button>
                        <div class="dropdown-list-brutal" id="dropdown-${deck.id}">
                            <button class="dropdown-action-item" onclick="toggleStarDeck(event, ${deck.id})">
                                <i class="fa-solid fa-star" style="color: ${deck.starred ? 'var(--brutal-yellow)' : 'inherit'}"></i> 
                                ${deck.starred ? 'Bỏ yêu thích' : 'Yêu thích'}
                            </button>
                            <button class="dropdown-action-item" onclick="openManagerModal(event, ${deck.id})">
                                <i class="fa-solid fa-folder-tree"></i> Quản lý thẻ con
                            </button>
                            <button class="dropdown-action-item" onclick="openEditDeck(event, ${deck.id})">
                                <i class="fa-solid fa-pen-to-square"></i> Sửa thông tin
                            </button>
                            <button class="dropdown-action-item" onclick="deleteDeckItem(event, ${deck.id})">
                                <i class="fa-solid fa-trash-can"></i> Xóa bộ thẻ
                            </button>
                        </div>
                    </div>
                </div>
                <p class="deck-description-text">${deck.desc || 'Không có mô tả chi tiết được thiết lập cho bộ thẻ này.'}</p>
            </div>
            <div class="deck-card-bottom-bar">
                <span class="counter-badge-brutal">${totalCards} Flashcards</span>
                <div class="countdown-timer-box" style="color: ${isCram ? 'var(--brutal-red)' : 'inherit'}">
                    <i class="fa-regular fa-calendar-check"></i>
                    <span>${getCountdownString(daysLeft)}</span>
                </div>
            </div>
        `;

        // Click thẳng vào Card (ngoại trừ menu hành động) sẽ kích hoạt học tập ôn tập
        card.addEventListener("click", (e) => {
            if (!e.target.closest('.dots-menu-box')) {
                localStorage.setItem("selectedDeckId", deck.id);
                window.location.href = "ontap.html";
            }
        });

        grid.appendChild(card);
    });
}

function getDaysRemaining(targetDateStr) {
    if (!targetDateStr) return null;
    const sysDate = new Date("2026-06-15"); // Giả lập dòng thời gian thực 2026 theo yêu cầu kiến trúc
    const targetDate = new Date(targetDateStr);
    const timeDiff = targetDate - sysDate;
    return Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
}

function getCountdownString(days) {
    if (days === null) return "Chưa đặt lịch thi";
    if (days === 0) return "🚨 Hôm nay thi!";
    if (days < 0) return "Đã quá hạn";
    return `Còn ${days} ngày nữa`;
}

// ==========================================================================
// ĐIỀU KHIỂN SỰ KIỆN TOÀN CỤC (GLOBAL EVENT REGISTRATION)
// ==========================================================================
function registerCoreEvents() {
    // Thanh tìm kiếm thời gian thực có nút xóa nhanh
    const searchInput = document.getElementById("searchInput");
    const clearSearchBtn = document.getElementById("clearSearchBtn");
    
    searchInput.addEventListener("input", (e) => {
        searchQuery = e.target.value;
        clearSearchBtn.style.display = searchQuery.length > 0 ? "block" : "none";
        renderDecksGrid();
    });

    clearSearchBtn.addEventListener("click", () => {
        searchInput.value = "";
        searchQuery = "";
        clearSearchBtn.style.display = "none";
        renderDecksGrid();
    });

    // Thay đổi bộ lọc Tab
    document.querySelectorAll(".tab-btn").forEach(tab => {
        tab.addEventListener("click", (e) => {
            document.querySelectorAll(".tab-btn").forEach(t => t.classList.remove("active"));
            e.currentTarget.classList.add("active");
            activeFilter = e.currentTarget.getAttribute("data-filter");
            renderDecksGrid();
        });
    });

    // Chế độ sắp xếp dữ liệu
    document.getElementById("sortSelect").addEventListener("change", (e) => {
        sortMode = e.target.value;
        renderDecksGrid();
    });

    // Gắn sự kiện đóng modal tự động thông qua thuộc tính data-close
    document.querySelectorAll("[data-close]").forEach(closeButton => {
        closeButton.addEventListener("click", () => {
            closeModal(closeButton.getAttribute("data-close"));
        });
    });

    // Mở Modal tạo bộ thẻ
    document.getElementById("btnOpenDeckModal").addEventListener("click", () => {
        currentEditingDeckId = null;
        document.getElementById("deckForm").reset();
        document.getElementById("modalTitle").textContent = "TẠO BỘ THẺ MỚI";
        openModal("deckModal");
    });

    // Xử lý Submit Form tạo mới / chỉnh sửa bộ thẻ chính
    document.getElementById("deckForm").addEventListener("submit", (e) => {
        e.preventDefault();
        const name = document.getElementById("deckName").value.trim();
        const desc = document.getElementById("deckDesc").value.trim();
        const examDate = document.getElementById("deckExamDate").value;

        if (currentEditingDeckId === null) {
            // Thêm bộ thẻ mới hoàn toàn
            const newDeck = {
                id: Date.now(),
                name,
                desc,
                examDate: examDate || null,
                starred: false,
                cards: []
            };
            Decks.push(newDeck);
            pushToast("Đã tạo bộ thẻ mới thành công!");
        } else {
            // Cập nhật cấu trúc bộ thẻ cũ đang sửa
            const d = Decks.find(item => item.id === currentEditingDeckId);
            if (d) {
                d.name = name;
                d.desc = desc;
                d.examDate = examDate || null;
                pushToast("Cập nhật thông tin bộ thẻ thành công!");
            }
        }
        saveState();
        closeModal("deckModal");
        refreshUI();
    });

    // Mở Modal AI Kéo thả
    document.getElementById("btnOpenAiModal").addEventListener("click", () => {
        document.getElementById("aiForm").reset();
        document.getElementById("fileSelectedName").textContent = "";
        openModal("aiModal");
    });

    // Quản lý kéo thả tệp tin nâng cao (Drag-Drop Zone)
    const dropZone = document.getElementById("dropZone");
    const aiFileInput = document.getElementById("aiFileInput");

    dropZone.addEventListener("click", () => aiFileInput.click());
    dropZone.addEventListener("dragover", (e) => { e.preventDefault(); dropZone.classList.add("dragover"); });
    dropZone.addEventListener("dragleave", () => dropZone.classList.remove("dragover"));
    dropZone.addEventListener("drop", (e) => {
        e.preventDefault();
        dropZone.classList.remove("dragover");
        if (e.dataTransfer.files.length > 0) {
            aiFileInput.files = e.dataTransfer.files;
            document.getElementById("fileSelectedName").textContent = `📄 Đã chọn: ${e.dataTransfer.files[0].name}`;
        }
    });
    aiFileInput.addEventListener("change", () => {
        if (aiFileInput.files.length > 0) {
            document.getElementById("fileSelectedName").textContent = `📄 Đã chọn: ${aiFileInput.files[0].name}`;
        }
    });

    // Xử lý Submit Form sinh thẻ bằng AI Assistant
    document.getElementById("aiForm").addEventListener("submit", (e) => {
        e.preventDefault();
        const topic = document.getElementById("aiTopic").value.trim();
        const count = parseInt(document.getElementById("aiCount").value);

        // Giả lập cơ chế sinh chuỗi thẻ thông minh dựa trên phân tích file đầu vào
        const generatedCards = [];
        for (let i = 1; i <= count; i++) {
            generatedCards.push({
                id: Date.now() + i,
                front: `Câu hỏi mẫu AI phân tích số [${i}] thuộc chủ đề: ${topic}?`,
                back: `Đáp án chi tiết trích xuất tự động từ tài liệu tham khảo cho câu hỏi ${i}.`,
                difficulty: "none"
            });
        }

        const aiDeck = {
            id: Date.now(),
            name: `[AI] ${topic}`,
            desc: `Bộ thẻ học thông minh tự sinh tự động bởi AI. Tổng số thẻ trích xuất: ${count}.`,
            examDate: null,
            starred: false,
            cards: generatedCards
        };

        Decks.push(aiDeck);
        saveState();
        closeModal("aiModal");
        refreshUI();
        pushToast(`AI đã xử lý tài liệu và tạo ${count} thẻ con thành công!`);
    });

    // Xử lý Submit lưu thẻ con bên trong Modal Quản lý thẻ con phân tầng
    document.getElementById("cardSubForm").addEventListener("submit", (e) => {
        e.preventDefault();
        const targetDeck = Decks.find(d => d.id === selectedDeckIdForManager);
        if (!targetDeck) return;

        const frontText = document.getElementById("cardFront").value.trim();
        const backText = document.getElementById("cardBack").value.trim();
        const difficulty = document.getElementById("cardDifficulty").value;
        const editingCardId = document.getElementById("editingCardId").value;

        if (!targetDeck.cards) targetDeck.cards = [];

        if (editingCardId === "") {
            // Thêm mới hoàn toàn một thẻ con vào bộ hiện tại
            targetDeck.cards.push({
                id: Date.now(),
                front: frontText,
                back: backText,
                difficulty: difficulty
            });
            pushToast("Đã thêm thẻ con mới thành công.");
        } else {
            // Lưu cập nhật thẻ con hiện có
            const cardItem = targetDeck.cards.find(c => c.id == editingCardId);
            if (cardItem) {
                cardItem.front = frontText;
                cardItem.back = backText;
                cardItem.difficulty = difficulty;
                pushToast("Cập nhật thẻ con thành công.");
            }
        }

        saveState();
        resetCardSubForm();
        renderSubCardsList(targetDeck);
        refreshUI();
    });

    document.getElementById("btnResetCardForm").addEventListener("click", () => {
        resetCardSubForm();
    });

    // Đóng context menu tự động khi nhấp chuột ra ngoài không gian click
    window.addEventListener("click", () => {
        document.querySelectorAll(".dropdown-list-brutal").forEach(menu => menu.classList.remove("active"));
    });
}

// ==========================================================================
// CÁC HÀM TIỆN ÍCH CHO GLOBAL SCOPE (Bắt buộc dùng window.* để tránh lỗi)
// ==========================================================================
window.openContextMenu = function(event, id) {
    event.stopPropagation();
    document.querySelectorAll(".dropdown-list-brutal").forEach(menu => {
        if (menu.id !== `dropdown-${id}`) menu.classList.remove("active");
    });
    document.getElementById(`dropdown-${id}`).classList.toggle("active");
};

window.toggleStarDeck = function(event, id) {
    event.stopPropagation();
    const d = Decks.find(item => item.id === id);
    if (d) {
        d.starred = !d.starred;
        saveState();
        renderDecksGrid();
        pushToast(d.starred ? "Đã thêm bộ thẻ vào danh mục Yêu thích! ⭐" : "Đã loại khỏi danh mục Yêu thích.");
    }
};

window.openEditDeck = function(event, id) {
    event.stopPropagation();
    const d = Decks.find(item => item.id === id);
    if (!d) return;
    currentEditingDeckId = id;

    document.getElementById("modalTitle").textContent = "CHỈNH SỬA THÔNG TIN BỘ THÈ";
    document.getElementById("deckName").value = d.name;
    document.getElementById("deckDesc").value = d.desc;
    document.getElementById("deckExamDate").value = d.examDate || "";

    openModal("deckModal");
};

window.deleteDeckItem = function(event, id) {
    event.stopPropagation();
    if (confirm("CẢNH BÁO: Bạn có chắc chắn muốn xóa toàn bộ bộ thẻ này cùng tất cả các thẻ con bên trong không?")) {
        Decks = Decks.filter(item => item.id !== id);
        saveState();
        refreshUI();
        pushToast("Hệ thống đã xóa bộ thẻ thành công.");
    }
};

// ==========================================================================
// QUẢN LÝ TẦNG DỮ LIỆU THẺ CON (SUB-CARDS LOGIC SPECIALIST)
// ==========================================================================
window.openManagerModal = function(event, deckId) {
    event.stopPropagation();
    const deck = Decks.find(d => d.id === deckId);
    if (!deck) return;

    selectedDeckIdForManager = deckId;
    document.getElementById("managerModalTitle").textContent = `QUẢN LÝ: ${deck.name.toUpperCase()}`;
    document.getElementById("managerModalSubtitle").textContent = deck.desc || "Không có mô tả cấu trúc.";

    resetCardSubForm();
    renderSubCardsList(deck);
    openModal("cardsManagerModal");
};

function renderSubCardsList(deck) {
    const container = document.getElementById("subCardsListContainer");
    const countBadge = document.getElementById("subCardsCount");
    container.innerHTML = "";

    const list = deck.cards || [];
    countBadge.textContent = list.length;

    if (list.length === 0) {
        container.innerHTML = `<div style="text-align:center; font-weight:700; padding:30px; border:3px dashed #000;">Bộ thẻ hiện tại chưa có dữ liệu thẻ con. Hãy thêm thẻ ở khung bên cạnh!</div>`;
        return;
    }

    list.forEach(card => {
        const item = document.createElement("div");
        item.className = "sub-card-item";
        item.innerHTML = `
            <div class="sub-card-main-text">Q: ${escapeHtml(card.front)}</div>
            <div class="sub-card-sub-text">A: ${escapeHtml(card.back)}</div>
            <div class="sub-card-meta">
                <span class="diff-badge ${card.difficulty || 'none'}">${card.difficulty || 'Chưa đặt'}</span>
                <div class="sub-card-actions">
                    <button class="mini-action-btn" title="Sửa thẻ con" onclick="startEditSubCard(${card.id})"><i class="fa-solid fa-marker"></i></button>
                    <button class="mini-action-btn" title="Xóa thẻ con" style="color:var(--brutal-red)" onclick="deleteSubCard(${card.id})"><i class="fa-solid fa-trash-can"></i></button>
                </div>
            </div>
        `;
        container.appendChild(item);
    });
}

window.startEditSubCard = function(cardId) {
    const deck = Decks.find(d => d.id === selectedDeckIdForManager);
    if (!deck || !deck.cards) return;

    const card = deck.cards.find(c => c.id === cardId);
    if (!card) return;

    document.getElementById("cardFormTitle").textContent = "Chỉnh Sửa Thẻ Con";
    document.getElementById("editingCardId").value = card.id;
    document.getElementById("cardFront").value = card.front;
    document.getElementById("cardBack").value = card.back;
    document.getElementById("cardDifficulty").value = card.difficulty || "none";

    document.getElementById("btnSubmitCard").innerHTML = `<i class="fa-solid fa-floppy-disk"></i> CẬP NHẬT THẺ`;
    document.getElementById("btnResetCardForm").style.display = "block";
};

window.deleteSubCard = function(cardId) {
    if (!confirm("Bạn có muốn loại bỏ thẻ con này ra khỏi bộ thẻ?")) return;

    const deck = Decks.find(d => d.id === selectedDeckIdForManager);
    if (!deck || !deck.cards) return;

    deck.cards = deck.cards.filter(c => c.id !== cardId);
    saveState();
    renderSubCardsList(deck);
    refreshUI();
    pushToast("Đã xóa thẻ con.");
};

function resetCardSubForm() {
    document.getElementById("cardFormTitle").textContent = "Thêm Thẻ Mới";
    document.getElementById("editingCardId").value = "";
    document.getElementById("cardSubForm").reset();
    document.getElementById("btnSubmitCard").innerHTML = `<i class="fa-solid fa-plus"></i> LƯU THẺ VÀO BỘ`;
    document.getElementById("btnResetCardForm").style.display = "none";
}

// ==========================================================================
// CÁC HÀM GIAO DIỆN HỖ TRỢ MODALS VÀ TOASTS
// ==========================================================================
function openModal(id) { document.getElementById(id).classList.add("open"); }
function closeModal(id) { document.getElementById(id).classList.remove("open"); }

function pushToast(message) {
    const stack = document.getElementById("toastStack");
    const toast = document.createElement("div");
    toast.className = "toast-brutal";
    toast.innerHTML = `<i class="fa-solid fa-square-check" style="font-size:18px;"></i> <span>${message}</span>`;
    stack.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = "none";
        toast.remove();
    }, 3500);
}

function escapeHtml(text) {
    if (!text) return "";
    return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}