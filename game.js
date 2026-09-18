const levels = [
    {
        name: "LEVEL 01 — INITIALIZE",
        size: 4,
        arrows: [
            "→", "↓", "↓", "←",
            "↑", "→", "←", "↓",
            "↑", "↑", "→", "←",
            "→", "↑", "↑", "←"
        ]
    },

    {
        name: "LEVEL 02 — DEBUG",
        size: 5,
        arrows: [
            "→", "↓", "↓", "←", "↓",
            "↑", "→", "→", "↓", "←",
            "↑", "↑", "←", "↓", "↓",
            "→", "↑", "→", "←", "↑",
            "→", "→", "↑", "↑", "←"
        ]
    },

    {
        name: "LEVEL 03 — BUILD",
        size: 5,
        arrows: [
            "↓", "→", "↓", "←", "↓",
            "↑", "→", "←", "↓", "←",
            "↑", "↑", "→", "←", "↓",
            "→", "↑", "→", "↑", "←",
            "→", "↓", "↑", "→", "←"
        ]
    },

    {
        name: "LEVEL 04 — GUIDE",
        size: 6,
        arrows: [
            "→", "↓", "↓", "←", "↓", "↓",
            "↑", "→", "→", "↓", "←", "↓",
            "↑", "↑", "→", "←", "↓", "↓",
            "→", "↑", "→", "↓", "↑", "←",
            "→", "↓", "↑", "→", "←", "↑",
            "→", "→", "↑", "↓", "↑", "←"
        ]
    },

    {
        name: "LEVEL 05 — 19.09",
        size: 6,
        arrows: [
            "→", "↓", "→", "←", "↓", "↓",
            "↑", "→", "↓", "↓", "←", "↓",
            "↑", "↑", "→", "←", "↓", "←",
            "→", "↑", "→", "↓", "↑", "←",
            "→", "↓", "↑", "→", "←", "↑",
            "→", "→", "↑", "↓", "→", "←"
        ]
    }
];


let currentLevel = 0;
let board = [];
let moves = 0;
let seconds = 0;
let timerInterval = null;
let deferredInstallPrompt = null;


/* =========================
   ELEMENTS
========================= */

const startScreen = document.getElementById("startScreen");
const gameScreen = document.getElementById("gameScreen");
const completeScreen = document.getElementById("completeScreen");
const finalScreen = document.getElementById("finalScreen");

const startBtn = document.getElementById("startBtn");
const restartBtn = document.getElementById("restartBtn");
const hintBtn = document.getElementById("hintBtn");
const nextBtn = document.getElementById("nextBtn");
const playAgainBtn = document.getElementById("playAgainBtn");

const installBtn = document.getElementById("installBtn");

const boardElement = document.getElementById("board");
const levelName = document.getElementById("levelName");
const movesElement = document.getElementById("moves");
const timerElement = document.getElementById("timer");
const messageElement = document.getElementById("message");

const finalMoves = document.getElementById("finalMoves");
const finalTime = document.getElementById("finalTime");


/* =========================
   SCREEN CONTROL
========================= */

function showScreen(screen) {

    document.querySelectorAll(".screen").forEach(s => {
        s.classList.remove("active");
    });

    screen.classList.add("active");
}


/* =========================
   START GAME
========================= */

startBtn.addEventListener("click", () => {
    currentLevel = 0;
    startLevel();
});


function startLevel() {

    showScreen(gameScreen);

    loadLevel();

    startTimer();
}


/* =========================
   LOAD LEVEL
========================= */

function loadLevel() {

    const level = levels[currentLevel];

    levelName.textContent = level.name;

    moves = 0;

    movesElement.textContent = moves;

    messageElement.textContent =
        "Clear the arrows. Think before you move.";

    board = level.arrows.map(direction => ({
        direction,
        removed: false
    }));

    renderBoard();
}


/* =========================
   RENDER BOARD
========================= */

function renderBoard() {

    const level = levels[currentLevel];

    boardElement.innerHTML = "";

    boardElement.style.gridTemplateColumns =
        `repeat(${level.size}, 1fr)`;

    board.forEach((cell, index) => {

        const cellElement = document.createElement("div");

        cellElement.className = "cell";

        if (cell.removed) {
            cellElement.style.visibility = "hidden";
        }

        const arrow = document.createElement("div");

        arrow.className = "arrow";

        arrow.textContent = cell.direction;

        cellElement.appendChild(arrow);

        if (!cell.removed) {

            if (canEscape(index)) {
                cellElement.classList.add("escape");
            } else {
                cellElement.classList.add("blocked");
            }

            cellElement.addEventListener("click", () => {
                moveArrow(index, cellElement);
            });
        }

        boardElement.appendChild(cellElement);
    });
}


/* =========================
   CHECK ESCAPE
========================= */

function canEscape(index) {

    const size = levels[currentLevel].size;

    const row = Math.floor(index / size);
    const col = index % size;

    const direction = board[index].direction;

    let r = row;
    let c = col;

    while (true) {

        if (direction === "↑") r--;
        if (direction === "↓") r++;
        if (direction === "←") c--;
        if (direction === "→") c++;

        // Outside board
        if (
            r < 0 ||
            r >= size ||
            c < 0 ||
            c >= size
        ) {
            return true;
        }

        const nextIndex = r * size + c;

        if (!board[nextIndex].removed) {
            return false;
        }
    }
}


/* =========================
   MOVE ARROW
========================= */

function moveArrow(index, element) {

    if (board[index].removed) return;

    if (!canEscape(index)) {

        messageElement.textContent =
            "PATH BLOCKED — try another arrow.";

        element.animate(
            [
                { transform: "translateX(0)" },
                { transform: "translateX(-5px)" },
                { transform: "translateX(5px)" },
                { transform: "translateX(0)" }
            ],
            {
                duration: 220
            }
        );

        return;
    }

    board[index].removed = true;

    moves++;

    movesElement.textContent = moves;

    element.classList.add("removing");

    messageElement.textContent =
        "PATH CLEAR ✓";

    setTimeout(() => {

        renderBoard();

        checkComplete();

    }, 220);
}


/* =========================
   CHECK COMPLETE
========================= */

function checkComplete() {

    const remaining = board.filter(
        cell => !cell.removed
    ).length;

    if (remaining === 0) {

        stopTimer();

        finalMoves.textContent = moves;

        finalTime.textContent =
            formatTime(seconds);

        setTimeout(() => {

            showScreen(completeScreen);

        }, 350);
    }
}


/* =========================
   NEXT LEVEL
========================= */

nextBtn.addEventListener("click", () => {

    currentLevel++;

    if (currentLevel >= levels.length) {

        showFinal();

        return;
    }

    startLevel();
});


/* =========================
   FINAL
========================= */

function showFinal() {

    stopTimer();

    showScreen(finalScreen);
}


playAgainBtn.addEventListener("click", () => {

    currentLevel = 0;

    startLevel();
});


/* =========================
   RESTART
========================= */

restartBtn.addEventListener("click", () => {

    stopTimer();

    seconds = 0;

    timerElement.textContent = "00:00";

    loadLevel();

    startTimer();
});


/* =========================
   HINT
========================= */

hintBtn.addEventListener("click", () => {

    const available = board
        .map((cell, index) => ({
            cell,
            index
        }))
        .filter(item =>
            !item.cell.removed &&
            canEscape(item.index)
        );

    if (available.length === 0) {

        messageElement.textContent =
            "No clear path. Restart the level.";

        return;
    }

    const chosen =
        available[
            Math.floor(
                Math.random() * available.length
            )
        ];

    const cells =
        boardElement.querySelectorAll(".cell");

    const target =
        cells[chosen.index];

    if (target) {

        target.animate(
            [
                {
                    transform: "scale(1)",
                    boxShadow: "0 0 0 rgba(201,169,110,0)"
                },
                {
                    transform: "scale(1.12)",
                    boxShadow: "0 0 25px rgba(201,169,110,.45)"
                },
                {
                    transform: "scale(1)",
                    boxShadow: "0 0 0 rgba(201,169,110,0)"
                }
            ],
            {
                duration: 800
            }
        );
    }

    messageElement.textContent =
        "HINT: Look at the highlighted arrow.";
});


/* =========================
   TIMER
========================= */

function startTimer() {

    stopTimer();

    seconds = 0;

    timerElement.textContent = "00:00";

    timerInterval = setInterval(() => {

        seconds++;

        timerElement.textContent =
            formatTime(seconds);

    }, 1000);
}


function stopTimer() {

    if (timerInterval) {

        clearInterval(timerInterval);

        timerInterval = null;
    }
}


function formatTime(totalSeconds) {

    const minutes =
        Math.floor(totalSeconds / 60)
            .toString()
            .padStart(2, "0");

    const secs =
        (totalSeconds % 60)
            .toString()
            .padStart(2, "0");

    return `${minutes}:${secs}`;
}


/* =========================
   PWA INSTALL
========================= */

window.addEventListener(
    "beforeinstallprompt",
    event => {

        event.preventDefault();

        deferredInstallPrompt = event;

        installBtn.style.display = "inline-block";
    }
);


installBtn.addEventListener("click", async () => {

    if (!deferredInstallPrompt) {

        messageElement.textContent =
            "Use your browser menu to install the game.";

        return;
    }

    deferredInstallPrompt.prompt();

    const result =
        await deferredInstallPrompt.userChoice;

    if (result.outcome === "accepted") {

        installBtn.textContent =
            "✓ INSTALLED";

    }

    deferredInstallPrompt = null;
});


window.addEventListener(
    "appinstalled",
    () => {

        installBtn.textContent =
            "✓ GAME INSTALLED";

    }
);


/* =========================
   SERVICE WORKER
========================= */

if ("serviceWorker" in navigator) {

    window.addEventListener("load", () => {

        navigator.serviceWorker
            .register("sw.js")
            .then(() => {
                console.log("PWA ready");
            })
            .catch(error => {
                console.log(
                    "Service worker error:",
                    error
                );
            });

    });
}
