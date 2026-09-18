let currentLevel = 0;
let lives = 3;
let remainingPaths = [];


/* ==============================
   DOM ELEMENTS
============================== */

const gameBoard = document.getElementById("gameBoard");

const levelNumber = document.getElementById("levelNumber");

const livesDisplay = document.getElementById("lives");

const progressText = document.getElementById("progressText");

const progressFill = document.getElementById("progressFill");

const difficultyDisplay = document.getElementById("difficulty");

const hiddenWord = document.getElementById("hiddenWord");

const statusMessage = document.getElementById("statusMessage");

const nextButton = document.getElementById("nextButton");

const gameOver = document.getElementById("gameOver");

const levelComplete = document.getElementById("levelComplete");

const finalScreen = document.getElementById("finalScreen");

const retryButton = document.getElementById("retryButton");

const completeNextButton =
    document.getElementById("completeNextButton");

const secretButton =
    document.getElementById("secretButton");


/* ==============================
   START GAME
============================== */

function startGame() {

    currentLevel = 0;

    lives = 3;

    gameOver.classList.add("hidden");

    levelComplete.classList.add("hidden");

    finalScreen.classList.add("hidden");

    nextButton.classList.add("hidden");

    loadLevel();

}


/* ==============================
   LOAD LEVEL
============================== */

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
        "?".repeat(level.word.length);


    updateProgress();

    updateLives();

    statusMessage.textContent =
        "Study the paths carefully.";


    nextButton.classList.add("hidden");

    levelComplete.classList.add("hidden");

    gameOver.classList.add("hidden");

    drawBoard();

}


/* ==============================
   DRAW BOARD
============================== */

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


    /* ==========================
       ARROW MARKER
    ========================== */

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


    marker.setAttribute(
        "id",
        "arrowhead"
    );

    marker.setAttribute(
        "markerWidth",
        "10"
    );

    marker.setAttribute(
        "markerHeight",
        "10"
    );

    marker.setAttribute(
        "refX",
        "8"
    );

    marker.setAttribute(
        "refY",
        "3"
    );

    marker.setAttribute(
        "orient",
        "auto"
    );


    const polygon =
        document.createElementNS(
            "http://www.w3.org/2000/svg",
            "polygon"
        );


    polygon.setAttribute(
        "points",
        "0 0, 8 3, 0 6"
    );


    polygon.setAttribute(
        "fill",
        "currentColor"
    );


    marker.appendChild(polygon);

    defs.appendChild(marker);

    svg.appendChild(defs);


    /* ==========================
       DRAW PATHS
    ========================== */

    remainingPaths.forEach(path => {

        const group =
            document.createElementNS(
                "http://www.w3.org/2000/svg",
                "g"
            );


        group.classList.add(
            "arrow-group"
        );


        group.dataset.id =
            path.id;


        /* MAIN LINE */

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
            "marker-end",
            "url(#arrowhead)"
        );


        line.classList.add(
            "arrow-line"
        );


        /* INVISIBLE CLICK AREA */

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


        hit.classList.add(
            "arrow-hit"
        );


        group.appendChild(line);

        group.appendChild(hit);

        svg.appendChild(group);


        hit.addEventListener(
            "click",
            function () {

                attemptRemove(path.id);

            }
        );

    });


    gameBoard.appendChild(svg);

}


/* ==============================
   FIND PATH
============================== */

function findPath(id) {

    return remainingPaths.find(
        path => path.id === id
    );

}


/* ==============================
   ATTEMPT REMOVE
============================== */

function attemptRemove(id) {

    const path =
        findPath(id);


    if (!path) {
        return;
    }


    /*
       Current puzzle rule:

       A path can be removed when
       it is not blocked by another
       remaining path.
    */

    if (isPathSafe(path)) {

        removePath(id);

    } else {

        wrongMove();

    }

}


/* ==============================
   GEOMETRY
============================== */

function orientation(
    ax,
    ay,
    bx,
    by,
    cx,
    cy
) {

    const value =
        (by - ay) * (cx - bx)
        -
        (bx - ax) * (cy - by);


    if (Math.abs(value) < 0.00001) {
        return 0;
    }


    return value > 0 ? 1 : 2;

}


function onSegment(
    ax,
    ay,
    bx,
    by,
    cx,
    cy
) {

    return (
        bx <= Math.max(ax, cx) &&
        bx >= Math.min(ax, cx) &&
        by <= Math.max(ay, cy) &&
        by >= Math.min(ay, cy)
    );

}


function linesIntersect(a, b) {

    const o1 =
        orientation(
            a.x1,
            a.y1,
            a.x2,
            a.y2,
            b.x1,
            b.y1
        );


    const o2 =
        orientation(
            a.x1,
            a.y1,
            a.x2,
            a.y2,
            b.x2,
            b.y2
        );


    const o3 =
        orientation(
            b.x1,
            b.y1,
            b.x2,
            b.y2,
            a.x1,
            a.y1
        );


    const o4 =
        orientation(
            b.x1,
            b.y1,
            b.x2,
            b.y2,
            a.x2,
            a.y2
        );


    if (
        o1 !== o2 &&
        o3 !== o4
    ) {
        return true;
    }


    if (
        o1 === 0 &&
        onSegment(
            a.x1,
            a.y1,
            b.x1,
            b.y1,
            a.x2,
            a.y2
        )
    ) {
        return true;
    }


    if (
        o2 === 0 &&
        onSegment(
            a.x1,
            a.y1,
            b.x2,
            b.y2,
            a.x2,
            a.y2
        )
    ) {
        return true;
    }


    if (
        o3 === 0 &&
        onSegment(
            b.x1,
            b.y1,
            a.x1,
            a.y1,
            b.x2,
            b.y2
        )
    ) {
        return true;
    }


    if (
        o4 === 0 &&
        onSegment(
            b.x1,
            b.y1,
            a.x2,
            a.y2,
            b.x2,
            b.y2
        )
    ) {
        return true;
    }


    return false;

}


/* ==============================
   SAFE PATH
============================== */

function isPathSafe(path) {

    for (
        const other of remainingPaths
    ) {

        if (
            other.id === path.id
        ) {
            continue;
        }


        if (
            linesIntersect(
                path,
                other
            )
        ) {

            return false;

        }

    }


    return true;

}


/* ==============================
   REMOVE PATH
============================== */

function removePath(id) {

    const group =
        document.querySelector(
            `[data-id="${id}"]`
        );


    if (group) {

        group.classList.add(
            "removed"
        );

    }


    setTimeout(
        function () {

            remainingPaths =
                remainingPaths.filter(
                    path =>
                        path.id !== id
                );


            updateProgress();

            drawBoard();


            if (
                remainingPaths.length === 0
            ) {

                completeLevel();

            } else {

                statusMessage.textContent =
                    "GOOD MOVE ✓";

            }

        },
        250
    );

}


/* ==============================
   WRONG MOVE
============================== */

function wrongMove() {

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
        "BLOCKED PATH ✕";


    if (lives <= 0) {

        setTimeout(
            function () {

                showGameOver();

            },
            400
        );

    }

}


/* ==============================
   UPDATE LIVES
============================== */

function updateLives() {

    let hearts = "";

    for (
        let i = 0;
        i < 3;
        i++
    ) {

        if (i < lives) {

            hearts += "❤️ ";

        } else {

            hearts += "🖤 ";

        }

    }


    livesDisplay.textContent =
        hearts.trim();

}


/* ==============================
   UPDATE PROGRESS
============================== */

function updateProgress() {

    const total =
        levels[currentLevel].paths.length;


    const removed =
        total - remainingPaths.length;


    const percentage =
        (removed / total) * 100;


    progressFill.style.width =
        `${percentage}%`;

}


/* ==============================
   COMPLETE LEVEL
============================== */

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


    statusMessage.textContent =
        "DESIGN CLEARED ✓";

}


/* ==============================
   NEXT LEVEL
============================== */

function nextLevel() {

    currentLevel++;


    if (
        currentLevel >= levels.length
    ) {

        showFinalScreen();

        return;

    }


    loadLevel();

}


/* ==============================
   GAME OVER
============================== */

function showGameOver() {

    gameOver.classList.remove(
        "hidden"
    );

}


/* ==============================
   FINAL SCREEN
============================== */

function showFinalScreen() {

    finalScreen.classList.remove(
        "hidden"
    );

}


/* ==============================
   RETRY
============================== */

retryButton.addEventListener(
    "click",
    function () {

        lives = 3;

        gameOver.classList.add(
            "hidden"
        );

        loadLevel();

    }
);


/* ==============================
   CONTINUE
============================== */

completeNextButton.addEventListener(
    "click",
    function () {

        levelComplete.classList.add(
            "hidden"
        );

        nextLevel();

    }
);


/* ==============================
   PLAY AGAIN
============================== */

secretButton.addEventListener(
    "click",
    function () {

        finalScreen.classList.add(
            "hidden"
        );

        startGame();

    }
);


/* ==============================
   START
============================== */

startGame();
