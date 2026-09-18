/* =====================================================
   HARROW GAME ENGINE
===================================================== */

let currentLevel = 0;
let lives = 3;
let remainingPaths = [];

const gameBoard = document.getElementById("gameBoard");
const levelNumber = document.getElementById("levelNumber");
const livesDisplay = document.getElementById("lives");
const progressText = document.getElementById("progressText");
const progressFill = document.getElementById("progressFill");
const difficultyDisplay = document.getElementById("difficulty");
const hiddenWord = document.getElementById("hiddenWord");
const statusMessage = document.getElementById("statusMessage");

const gameOver = document.getElementById("gameOver");
const levelComplete = document.getElementById("levelComplete");
const finalScreen = document.getElementById("finalScreen");

const retryButton = document.getElementById("retryButton");
const completeNextButton =
    document.getElementById("completeNextButton");
const secretButton =
    document.getElementById("secretButton");


/* =====================================================
   START
===================================================== */

function startGame() {

    currentLevel = 0;
    lives = 3;

    gameOver.classList.add("hidden");
    levelComplete.classList.add("hidden");
    finalScreen.classList.add("hidden");

    loadLevel();
}


/* =====================================================
   LOAD LEVEL
===================================================== */

function loadLevel() {

    const level = levels[currentLevel];

    if (!level) {
        showFinalScreen();
        return;
    }

    remainingPaths =
        JSON.parse(JSON.stringify(level.paths));

    levelNumber.textContent =
        String(level.level).padStart(2, "0");

    progressText.textContent =
        `LEVEL ${level.level} / ${levels.length}`;

    difficultyDisplay.textContent =
        level.difficulty;

    hiddenWord.textContent =
        "? ".repeat(level.word.length).trim();

    statusMessage.textContent =
        "Study the paths carefully.";

    updateLives();
    updateProgress();
    drawBoard();
}


/* =====================================================
   DRAW BOARD
===================================================== */

function drawBoard() {

    gameBoard.innerHTML = "";

    const svg =
        document.createElementNS(
            "http://www.w3.org/2000/svg",
            "svg"
        );

    svg.setAttribute(
        "viewBox",
        "0 0 850 520"
    );

    svg.setAttribute(
        "preserveAspectRatio",
        "xMidYMid meet"
    );


    /* -----------------------------
       ARROW MARKER
    ----------------------------- */

    const defs =
        document.createElementNS(
            "http://www.w3.org/2000/svg",
            "defs"
        );

    const marker =
        document.createElementNS(
            "http://www.w3.org/2000/svg",
            "marker"
        );

    marker.setAttribute("id", "harrowArrow");
    marker.setAttribute("markerWidth", "8");
    marker.setAttribute("markerHeight", "8");
    marker.setAttribute("refX", "7");
    marker.setAttribute("refY", "3.5");
    marker.setAttribute("orient", "auto");
    marker.setAttribute("markerUnits", "strokeWidth");

    const polygon =
        document.createElementNS(
            "http://www.w3.org/2000/svg",
            "polygon"
        );

    polygon.setAttribute(
        "points",
        "0,0 7,3.5 0,7"
    );

    polygon.setAttribute(
        "fill",
        "#ffffff"
    );

    marker.appendChild(polygon);
    defs.appendChild(marker);
    svg.appendChild(defs);


    /* -----------------------------
       DRAW PATHS
    ----------------------------- */

    remainingPaths.forEach(path => {

        const group =
            document.createElementNS(
                "http://www.w3.org/2000/svg",
                "g"
            );

        group.classList.add("arrow-group");

        group.dataset.id = path.id;


        /* MAIN WHITE PATH */

        const line =
            document.createElementNS(
                "http://www.w3.org/2000/svg",
                "line"
            );

        line.setAttribute(
            "x1",
            path.x1
        );

        line.setAttribute(
            "y1",
            path.y1
        );

        line.setAttribute(
            "x2",
            path.x2
        );

        line.setAttribute(
            "y2",
            path.y2
        );

        line.setAttribute(
            "stroke",
            "#ffffff"
        );

        line.setAttribute(
            "stroke-width",
            "3"
        );

        line.setAttribute(
            "stroke-linecap",
            "round"
        );

        line.setAttribute(
            "marker-end",
            "url(#harrowArrow)"
        );

        line.classList.add("arrow-line");


        /* BIG INVISIBLE CLICK TARGET */

        const hit =
            document.createElementNS(
                "http://www.w3.org/2000/svg",
                "line"
            );

        hit.setAttribute(
            "x1",
            path.x1
        );

        hit.setAttribute(
            "y1",
            path.y1
        );

        hit.setAttribute(
            "x2",
            path.x2
        );

        hit.setAttribute(
            "y2",
            path.y2
        );

        hit.setAttribute(
            "stroke",
            "transparent"
        );

        hit.setAttribute(
            "stroke-width",
            "28"
        );

        hit.classList.add("arrow-hit");


        group.appendChild(line);
        group.appendChild(hit);

        svg.appendChild(group);


        hit.addEventListener(
            "click",
            () => attemptRemove(path.id)
        );

    });


    gameBoard.appendChild(svg);
}


/* =====================================================
   GEOMETRY
===================================================== */

function crossProduct(
    ax,
    ay,
    bx,
    by,
    cx,
    cy
) {

    return (
        (bx - ax) * (cy - ay) -
        (by - ay) * (cx - ax)
    );
}


function segmentsIntersect(a, b) {

    const d1 =
        crossProduct(
            a.x1,
            a.y1,
            a.x2,
            a.y2,
            b.x1,
            b.y1
        );

    const d2 =
        crossProduct(
            a.x1,
            a.y1,
            a.x2,
            a.y2,
            b.x2,
            b.y2
        );

    const d3 =
        crossProduct(
            b.x1,
            b.y1,
            b.x2,
            b.y2,
            a.x1,
            a.y1
        );

    const d4 =
        crossProduct(
            b.x1,
            b.y1,
            b.x2,
            b.y2,
            a.x2,
            a.y2
        );

    return (
        ((d1 > 0 && d2 < 0) ||
         (d1 < 0 && d2 > 0)) &&

        ((d3 > 0 && d4 < 0) ||
         (d3 < 0 && d4 > 0))
    );
}


/* =====================================================
   ARROW DIRECTION
===================================================== */

function getDirection(path) {

    const dx =
        path.x2 - path.x1;

    const dy =
        path.y2 - path.y1;

    const length =
        Math.sqrt(
            dx * dx +
            dy * dy
        );

    return {
        x: dx / length,
        y: dy / length
    };
}


/* =====================================================
   IS ARROW BLOCKED?
=====================================================

   We look slightly beyond the arrowhead.

   If another remaining path is directly in the
   arrow's way, the arrow cannot be removed.

===================================================== */

function isBlocked(path) {

    const direction =
        getDirection(path);

    const extension = 70;

    const probe = {

        x1: path.x2,

        y1: path.y2,

        x2:
            path.x2 +
            direction.x *
            extension,

        y2:
            path.y2 +
            direction.y *
            extension
    };


    for (
        const other
        of remainingPaths
    ) {

        if (
            other.id === path.id
        ) {
            continue;
        }


        if (
            segmentsIntersect(
                probe,
                other
            )
        ) {

            return true;
        }
    }


    return false;
}


/* =====================================================
   ATTEMPT REMOVE
===================================================== */

function attemptRemove(id) {

    const path =
        remainingPaths.find(
            p => p.id === id
        );

    if (!path) {
        return;
    }


    if (isBlocked(path)) {

        wrongMove(path);

        return;
    }


    removePath(path);
}


/* =====================================================
   REMOVE
===================================================== */

function removePath(path) {

    const group =
        document.querySelector(
            `[data-id="${path.id}"]`
        );

    if (group) {

        group.classList.add(
            "removed"
        );
    }


    statusMessage.textContent =
        "PATH CLEARED ✓";


    setTimeout(() => {

        remainingPaths =
            remainingPaths.filter(
                p =>
                    p.id !== path.id
            );

        updateProgress();
        drawBoard();


        if (
            remainingPaths.length === 0
        ) {

            completeLevel();
        }

    }, 220);
}


/* =====================================================
   WRONG MOVE
===================================================== */

function wrongMove(path) {

    lives--;

    updateLives();


    gameBoard.classList.remove(
        "board-shake"
    );

    void gameBoard.offsetWidth;

    gameBoard.classList.add(
        "board-shake"
    );


    statusMessage.textContent =
        "BLOCKED — PATH CROSSES ANOTHER LINE";


    if (lives <= 0) {

        setTimeout(
            showGameOver,
            450
        );
    }
}


/* =====================================================
   LIVES
===================================================== */

function updateLives() {

    let hearts = "";

    for (
        let i = 0;
        i < 3;
        i++
    ) {

        hearts +=
            i < lives
                ? "❤️ "
                : "🖤 ";

    }

    livesDisplay.textContent =
        hearts.trim();
}


/* =====================================================
   PROGRESS
===================================================== */

function updateProgress() {

    const level =
        levels[currentLevel];

    if (!level) {
        return;
    }

    const total =
        level.paths.length;

    const removed =
        total -
        remainingPaths.length;

    const percentage =
        (removed / total) *
        100;

    progressFill.style.width =
        `${percentage}%`;
}


/* =====================================================
   LEVEL COMPLETE
===================================================== */

function completeLevel() {

    const level =
        levels[currentLevel];

    hiddenWord.textContent =
        level.word;

    document.getElementById(
        "completedWord"
    ).textContent =
        level.word;

    levelComplete.classList.remove(
        "hidden"
    );
}


/* =====================================================
   NEXT LEVEL
===================================================== */

function nextLevel() {

    currentLevel++;

    if (
        currentLevel >=
        levels.length
    ) {

        showFinalScreen();

        return;
    }


    loadLevel();
}


/* =====================================================
   GAME OVER
===================================================== */

function showGameOver() {

    gameOver.classList.remove(
        "hidden"
    );
}


/* =====================================================
   FINAL
===================================================== */

function showFinalScreen() {

    finalScreen.classList.remove(
        "hidden"
    );
}


/* =====================================================
   BUTTONS
===================================================== */

retryButton.addEventListener(
    "click",
    () => {

        lives = 3;

        gameOver.classList.add(
            "hidden"
        );

        loadLevel();

    }
);


completeNextButton.addEventListener(
    "click",
    () => {

        levelComplete.classList.add(
            "hidden"
        );

        nextLevel();

    }
);


secretButton.addEventListener(
    "click",
    () => {

        finalScreen.classList.add(
            "hidden"
        );

        startGame();

    }
);


/* =====================================================
   START GAME
===================================================== */

startGame();
