// ======================================
// KHO THE JS
// ======================================

let decks = JSON.parse(localStorage.getItem("decks")) || [];

let activeFilter = "all";
let searchQuery = "";
let sortMode = "default";

let editingId = null;
let deletingId = null;

// ======================================
// INIT
// ======================================

document.addEventListener("DOMContentLoaded", () => {

    loadUserInfo();

    if (decks.length === 0) {
        seedDemoData();
    }

    renderDecks();

    bindEvents();
});

// ======================================
// USER INFO
// ======================================

function loadUserInfo() {

    const currentUser =
        JSON.parse(
            localStorage.getItem("currentUser")
        );

    if (!currentUser) return;

    const nameElements =
        document.querySelectorAll(".user-name");

    nameElements.forEach(el => {
        el.textContent = currentUser.name;
    });

    const userId =
        document.querySelector(".user-id");

    if (userId) {
        userId.textContent =
            `ID: ${currentUser.id || "000001"}`;
    }
}

// ======================================
// DEMO DATA
// ======================================

function seedDemoData() {

    decks = [
        {
            id: 1,
            name: "Giải Tích 1",
            cards: 120,
            desc: "Giới hạn, đạo hàm, tích phân",
            exam: "2026-06-15",
            starred: true,
            icon: "📖"
        },
        {
            id: 2,
            name: "IELTS",
            cards: 250,
            desc: "Vocabulary",
            exam: null,
            starred: false,
            icon: "🗣️"
        }
    ];

    saveDecks();
}

// ======================================
// SAVE
// ======================================

function saveDecks() {

    localStorage.setItem(
        "decks",
        JSON.stringify(decks)
    );
}

// ======================================
// RENDER
// ======================================

function renderDecks() {

    const grid =
        document.getElementById("deckGrid");

    if (!grid) return;

    let filtered = [...decks];

    // search

    if (searchQuery) {

        filtered = filtered.filter(deck =>
            deck.name.toLowerCase()
            .includes(searchQuery.toLowerCase())
        );
    }

    // filter

    if (activeFilter === "starred") {

        filtered =
            filtered.filter(
                deck => deck.starred
            );
    }

    if (activeFilter === "nodate") {

        filtered =
            filtered.filter(
                deck => !deck.exam
            );
    }

    // sort

    if (sortMode === "name") {

        filtered.sort(
            (a, b) =>
            a.name.localeCompare(b.name)
        );
    }

    if (sortMode === "cards") {

        filtered.sort(
            (a, b) =>
            b.cards - a.cards
        );
    }

    grid.innerHTML = "";

    filtered.forEach(deck => {

        grid.innerHTML += `

        <div class="deck-card">

            <div class="deck-card-header">

                <div>
                    <h3>
                        ${deck.icon}
                        ${deck.name}
                    </h3>

                    <small>
                        ${deck.cards} thẻ
                    </small>
                </div>

                <button
                    onclick="toggleStar(${deck.id})">

                    ${deck.starred ? "⭐" : "☆"}

                </button>

            </div>

            <p>
                ${deck.desc}
            </p>

            <div class="deck-card-footer">

                <button
                    onclick="reviewDeck(${deck.id})">
                    Ôn tập
                </button>

                <button
                    onclick="editDeck(${deck.id})">
                    Sửa
                </button>

                <button
                    onclick="deleteDeck(${deck.id})">
                    Xóa
                </button>

            </div>

        </div>
        `;
    });

    updateDeckCount();
}

// ======================================
// COUNT
// ======================================

function updateDeckCount() {

    const label =
        document.getElementById(
            "deckCountLabel"
        );

    if (label) {

        label.textContent =
            `${decks.length} bộ thẻ`;
    }
}

// ======================================
// EVENTS
// ======================================

function bindEvents() {

    document
        .getElementById("searchInput")
        ?.addEventListener("input", e => {

            searchQuery = e.target.value;

            renderDecks();
        });

    document
        .getElementById("sortSelect")
        ?.addEventListener("change", e => {

            sortMode = e.target.value;

            renderDecks();
        });

    document
        .querySelectorAll(".tab-btn")
        .forEach(btn => {

            btn.addEventListener("click", () => {

                document
                .querySelectorAll(".tab-btn")
                .forEach(b =>
                    b.classList.remove("active")
                );

                btn.classList.add("active");

                activeFilter =
                    btn.dataset.filter;

                renderDecks();
            });
        });
}

// ======================================
// STAR
// ======================================

function toggleStar(id) {

    const deck =
        decks.find(
            d => d.id === id
        );

    if (!deck) return;

    deck.starred = !deck.starred;

    saveDecks();

    renderDecks();
}

// ======================================
// REVIEW
// ======================================

function reviewDeck(id) {

    localStorage.setItem(
        "selectedDeck",
        id
    );

    window.location.href =
        "ontap.html";
}

// ======================================
// EDIT
// ======================================

function editDeck(id) {

    editingId = id;

    alert("Mở modal sửa bộ thẻ");
}

// ======================================
// DELETE
// ======================================

function deleteDeck(id) {

    if (
        !confirm(
            "Xóa bộ thẻ này?"
        )
    ) return;

    decks =
        decks.filter(
            deck => deck.id !== id
        );

    saveDecks();

    renderDecks();
}

// ======================================
// CREATE DECK
// ======================================

function createDeck(data) {

    decks.push({

        id: Date.now(),

        name: data.name,

        desc: data.desc,

        cards: data.cards,

        exam: data.exam,

        icon: data.icon,

        starred: false
    });

    saveDecks();

    renderDecks();
}