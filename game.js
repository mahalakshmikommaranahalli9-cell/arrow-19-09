/* =========================================================
   ARROW // 19.09
   Arrow Letter Puzzle Engine
   Uses levels from levels.js
========================================================= */


/* =========================================================
   GAME STATE
========================================================= */

let currentLevel = 0;
let board = [];
let moves = 0;
let seconds = 0;
let timerInterval = null;
let deferredInstallPrompt = null;


/* =========================================================
   ELEMENTS
========================================================= */

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


/* =========================================================
   SCREEN CONTROL
========================================================= */

function showScreen(screen) {

    document.querySelectorAll(".screen").forEach(screenItem => {
        screenItem.classList.remove("active");
    });

    if (screen) {
        screen.classList.add("active");
    }
}


/* =========================================================
   START GAME
========================================================= */

if (startBtn) {

    startBtn.addEventListener("click", () => {

        currentLevel = 0;

        seconds = 0;

        startLevel();

    });

}


/* =========================================================
   START LEVEL
========================================================= */

function startLevel() {

    showScreen(gameScreen);

    loadLevel();

    startTimer();

}


/* =========================================================
   LOAD LEVEL
========================================================= */

function loadLevel() {

    const level = levels[currentLevel];

    if (!level) {
        showFinal();
        return;
    }

    levelName.textContent = level.name;

    moves = 0;

    movesElement.textContent = "0";

    messageElement.textContent =
        "Clear the arrows. Think before you move.";

    /*
       Create board.

       Empty cells are marked as empty.
       Arrow cells become playable pieces.
    */

    board = level.arrows.map(direction => ({

        direction: direction,

        removed: false,

        empty: direction === "" ||
               direction === null ||
               direction === undefined

    }));

    renderBoard();

}


/* =========================================================
   RENDER BOARD
========================================================= */

function renderBoard() {

    const level = levels[currentLevel];

    boardElement.innerHTML = "";

    boardElement.style.gridTemplateColumns =
        `repeat(${level.size}, minmax(0, 1fr))`;

    boardElement.style.gridTemplateRows =
        `repeat(${level.size}, minmax(0, 1fr))`;


    board.forEach((cell, index) => {

        const cellElement =
            document.createElement("div");

        cellElement.className = "cell";


        /* EMPTY CELL */

        if (cell.empty) {

            cellElement.classList.add("empty");

            boardElement.appendChild(cellElement);

            return;
        }


        /* REMOVED ARROW */

        if (cell.removed) {

            cellElement.classList.add("removed");

            boardElement.appendChild(cellElement);

            return;
        }


        /* ARROW */

        const arrow =
            document.createElement("div");

        arrow.className = "arrow";

        arrow.textContent = cell.direction;


        /*
           Add direction class.
           Useful for CSS animation.
        */

        if (cell.direction === "↑") {
            arrow.classList.add("arrow-up");
        }

        if (cell.direction === "↓") {
            arrow.classList.add("arrow-down");
        }

        if (cell.direction === "←") {
            arrow.classList.add("arrow-left");
        }

        if (cell.direction === "→") {
            arrow.classList.add("arrow-right");
        }


        cellElement.appendChild(arrow);


        /*
           Show whether this arrow can currently escape.
        */

        if (canEscape(index)) {

            cellElement.classList.add("escape");

        } else {

            cellElement.classList.add("blocked");

        }


        /*
           Click arrow.
        */

        cellElement.addEventListener(
            "click",
            () => moveArrow(index, cellElement)
        );


        boardElement.appendChild(cellElement);

    });

}


/* =========================================================
   GET POSITION
========================================================= */

function getPosition(index) {

    const size = levels[currentLevel].size;

    return {

        row: Math.floor(index / size),

        col: index % size

    };

}


/* =========================================================
   GET NEXT CELL
========================================================= */

function getNextIndex(index, direction) {

    const size = levels[currentLevel].size;

    const position = getPosition(index);

    let row = position.row;

    let col = position.col;


    if (direction === "↑") {
        row--;
    }

    if (direction === "↓") {
        row++;
    }

    if (direction === "←") {
        col--;
    }

    if (direction === "→") {
        col++;
    }


    /*
       Outside board.
    */

    if (
        row < 0 ||
        row >= size ||
        col < 0 ||
        col >= size
    ) {

        return -1;

    }


    return row * size + col;

}


/* =========================================================
   CHECK ESCAPE
========================================================= */

function canEscape(index) {

    const cell = board[index];

    /*
       Empty or already removed cells
       cannot be played.
    */

    if (
        !cell ||
        cell.empty ||
        cell.removed
    ) {

        return false;

    }


    let currentIndex = index;


    /*
       Follow the arrow until:

       1. It leaves the board → ESCAPE
       2. It hits another active arrow → BLOCKED
    */

    while (true) {

        const nextIndex =
            getNextIndex(
                currentIndex,
                cell.direction
            );


        /*
           Arrow reaches outside board.
        */

        if (nextIndex === -1) {

            return true;

        }


        /*
           If the next cell contains
           an active arrow, path is blocked.
        */

        const nextCell = board[nextIndex];

        if (
            nextCell &&
            !nextCell.empty &&
            !nextCell.removed
        ) {

            return false;

        }


        /*
           Empty/removed cells can be crossed.
        */

        currentIndex = nextIndex;

    }

}


/* =========================================================
   MOVE ARROW
========================================================= */

function moveArrow(index, element) {

    const cell = board[index];

    if (
        !cell ||
        cell.empty ||
        cell.removed
    ) {

        return;

    }


    /*
       BLOCKED ARROW
    */

    if (!canEscape(index)) {

        messageElement.textContent =
            "PATH BLOCKED — clear the arrow ahead first.";

        element.classList.remove("shake");

        /*
           Force browser to restart animation.
        */

        void element.offsetWidth;

        element.classList.add("shake");

        return;

    }


    /*
       VALID MOVE
    */

    cell.removed = true;

    moves++;

    movesElement.textContent = moves;

    messageElement.textContent =
        "PATH CLEAR ✓";


    /*
       Remove animation.
    */

    element.classList.add("removing");


    setTimeout(() => {

        renderBoard();

        checkComplete();

    }, 230);

}


/* =========================================================
   CHECK LEVEL COMPLETE
========================================================= */

function checkComplete() {

    const remaining =
        board.filter(cell =>
            !cell.empty &&
            !cell.removed
        ).length;


    if (remaining !== 0) {

        return;

    }


    stopTimer();


    /*
       Save current level statistics.
    */

    if (finalMoves) {
        finalMoves.textContent = moves;
    }

    if (finalTime) {
        finalTime.textContent = formatTime(seconds);
    }


    /*
       Show completed letter if available.
    */

    const level = levels[currentLevel];


    setTimeout(() => {

        showLevelComplete(level);

    }, 350);

}


/* =========================================================
   LEVEL COMPLETE SCREEN
========================================================= */

function showLevelComplete(level) {

    showScreen(completeScreen);


    /*
       Try to find an existing letter element.
       If it doesn't exist, create one.
    */

    let letterElement =
        document.getElementById("completedLetter");


    if (!letterElement) {

        letterElement =
            document.createElement("div");

        letterElement.id = "completedLetter";

        letterElement.className =
            "completed-letter";

        const completeContent =
            completeScreen.querySelector(
                ".complete-content"
            );

        if (completeContent) {

            completeContent.insertBefore(
                letterElement,
                completeContent.firstChild
            );

        }

    }


    /*
       Show the letter using the
       level's letter property.
    */

    if (level.letter) {

        letterElement.textContent =
            level.letter;

        letterElement.style.display =
            "block";

    } else {

        letterElement.style.display =
            "none";

    }


    /*
       Last level?
    */

    if (currentLevel === levels.length - 1) {

        if (nextBtn) {

            nextBtn.textContent =
                "FINISH →";

        }

    } else {

        if (nextBtn) {

            nextBtn.textContent =
                "NEXT LETTER →";

        }

    }

}


/* =========================================================
   NEXT LEVEL
========================================================= */

if (nextBtn) {

    nextBtn.addEventListener("click", () => {

        currentLevel++;

        if (currentLevel >= levels.length) {

            showFinal();

            return;

        }

        startLevel();

    });

}


/* =========================================================
   FINAL SCREEN
========================================================= */

function showFinal() {

    stopTimer();

    showScreen(finalScreen);


    /*
       Add final name reveal if the
       final screen doesn't already contain one.
    */

    let nameReveal =
        document.getElementById("nameReveal");


    if (!nameReveal) {

        nameReveal =
            document.createElement("div");

        nameReveal.id = "nameReveal";

        nameReveal.className =
            "name-reveal";

        nameReveal.innerHTML = `
            <div class="name-small">
                THE ARROWS REVEALED
            </div>

            <div class="name-main">
                PRUTHVIRAJ
            </div>

            <div class="name-sub">
                CODE BLASTER
            </div>
        `;


        const finalContent =
            finalScreen.querySelector(
                ".final-content"
            );


        if (finalContent) {

            finalContent.insertBefore(
                nameReveal,
                finalContent.firstChild
            );

        }

    }

}


/* =========================================================
   PLAY AGAIN
========================================================= */

if (playAgainBtn) {

    playAgainBtn.addEventListener("click", () => {

        currentLevel = 0;

        seconds = 0;

        startLevel();

    });

}


/* =========================================================
   RESTART
========================================================= */

if (restartBtn) {

    restartBtn.addEventListener("click", () => {

        stopTimer();

        loadLevel();

        startTimer();

    });

}


/* =========================================================
   HINT
========================================================= */

if (hintBtn) {

    hintBtn.addEventListener("click", () => {

        const available =
            board
                .map((cell, index) => ({
                    cell,
                    index
                }))
                .filter(item =>
                    !item.cell.empty &&
                    !item.cell.removed &&
                    canEscape(item.index)
                );


        if (available.length === 0) {

            messageElement.textContent =
                "No clear arrow. Check the paths.";

            return;

        }


        /*
           Pick a random currently
           playable arrow.
        */

        const chosen =
            available[
                Math.floor(
                    Math.random() *
                    available.length
                )
            ];


        const cells =
            boardElement.querySelectorAll(
                ".cell"
            );


        const target =
            cells[chosen.index];


        if (target) {

            target.classList.remove(
                "hint-pulse"
            );

            void target.offsetWidth;

            target.classList.add(
                "hint-pulse"
            );

        }


        messageElement.textContent =
            "HINT — Try the highlighted arrow.";

    });

}


/* =========================================================
   TIMER
========================================================= */

function startTimer() {

    stopTimer();

    seconds = 0;

    timerElement.textContent =
        "00:00";


    timerInterval =
        setInterval(() => {

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


/* =========================================================
   PWA INSTALL
========================================================= */

window.addEventListener(
    "beforeinstallprompt",
    event => {

        event.preventDefault();

        deferredInstallPrompt = event;


        if (installBtn) {

            installBtn.style.display =
                "inline-block";

        }

    }
);


if (installBtn) {

    installBtn.addEventListener(
        "click",
        async () => {

            if (!deferredInstallPrompt) {

                messageElement.textContent =
                    "Use your browser menu to install the game.";

                return;

            }


            deferredInstallPrompt.prompt();


            const result =
                await deferredInstallPrompt.userChoice;


            if (
                result.outcome === "accepted"
            ) {

                installBtn.textContent =
                    "✓ INSTALLED";

            }


            deferredInstallPrompt = null;

        }
    );

}


window.addEventListener(
    "appinstalled",
    () => {

        if (installBtn) {

            installBtn.textContent =
                "✓ GAME INSTALLED";

        }

    }
);


/* =========================================================
   SERVICE WORKER
========================================================= */

if ("serviceWorker" in navigator) {

    window.addEventListener(
        "load",
        () => {

            navigator.serviceWorker
                .register("./sw.js")
                .then(() => {

                    console.log(
                        "ARROW//19.09 PWA ready"
                    );

                })
                .catch(error => {

                    console.log(
                        "Service worker error:",
                        error
                    );

                });

        }
    );

}


/* =========================================================
   DEBUG
========================================================= */

console.log(
    "ARROW//19.09 loaded",
    levels.length,
    "levels"
);
