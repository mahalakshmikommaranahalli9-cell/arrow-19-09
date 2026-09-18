let currentLevel = 0;
let lives = 3;
let remainingPaths = [];


/* =========================
   ELEMENTS
========================= */

const levelNumber = document.getElementById("levelNumber");
const progressText = document.getElementById("progressText");
const progressFill = document.getElementById("progressFill");
const difficulty = document.getElementById("difficulty");
const livesElement = document.getElementById("lives");
const hiddenWord = document.getElementById("hiddenWord");
const instructionText = document.getElementById("instructionText");
const gameBoard = document.getElementById("gameBoard");
const statusMessage = document.getElementById("statusMessage");

const nextButton = document.getElementById("nextButton");
const gameOver = document.getElementById("gameOver");
const retryButton = document.getElementById("retryButton");

const levelComplete = document.getElementById("levelComplete");
const completedWord = document.getElementById("completedWord");
const completeNextButton = document.getElementById("completeNextButton");

const finalScreen = document.getElementById("finalScreen");
const secretButton = document.getElementById("secretButton");


/* =========================
   START GAME
========================= */

function startGame() {

    currentLevel = 0;
    lives = 3;

    gameOver.classList.add("hidden");
    levelComplete.classList.add("hidden");
    finalScreen.classList.add("hidden");

    loadLevel();
}


/* =========================
   LOAD LEVEL
========================= */

function loadLevel() {

    const level = levels[currentLevel];

    if (!level) {
        showFinalScreen();
        return;
    }

    lives = 3;

    remainingPaths = level.paths.map(path => ({
        ...path
    }));

    levelNumber.textContent =
        String(level.id).padStart(2, "0");

    progressText.textContent =
        `LEVEL ${level.id} / 50`;

    progressFill.style.width =
        `${Math.min((level.id / 50) * 100, 100)}%`;

    difficulty.textContent =
        level.difficulty;

    hiddenWord.textContent = "????";

    instructionText.textContent =
        level.message;

    statusMessage.textContent = "";
    statusMessage.className = "status-message";

    nextButton.classList.add("hidden");
    levelComplete.classList.add("hidden");
    gameOver.classList.add("hidden");

    updateLives();

    drawBoard();
}


/* =========================
   DRAW SVG BOARD
========================= */

function drawBoard() {

    gameBoard.innerHTML = "";

    /*
       SVG makes the arrows visible
       and clickable on every browser.
    */

    const svgNS = "http://www.w3.org/2000/svg";

    const svg = document.createElementNS(
        svgNS,
        "svg"
    );

    svg.setAttribute("width", "100%");
    svg.setAttribute("height", "100%");
    svg.setAttribute("viewBox", "0 0 850 520");

    svg.style.display = "block";
    svg.style.overflow = "visible";

    /* =========================
       ARROW MARKER
    ========================= */

    const defs = document.createElementNS(
        svgNS,
        "defs"
    );

    const marker = document.createElementNS(
        svgNS,
        "marker"
    );

    marker.setAttribute("id", "arrowHead");
    marker.setAttribute("markerWidth", "12");
    marker.setAttribute("markerHeight", "12");
    marker.setAttribute("refX", "9");
    marker.setAttribute("refY", "4");
    marker.setAttribute("orient", "auto");
    marker.setAttribute("markerUnits", "strokeWidth");

    const arrowPolygon =
        document.createElementNS(
            svgNS,
            "polygon"
        );

    arrowPolygon.setAttribute(
        "points",
        "0,0 10,4 0,8"
    );

    arrowPolygon.setAttribute(
        "fill",
        "currentColor"
    );

    marker.appendChild(arrowPolygon);
    defs.appendChild(marker);
    svg.appendChild(defs);


    /* =========================
       DRAW EVERY PATH
    ========================= */

    remainingPaths.forEach(path => {

        const group =
            document.createElementNS(
                svgNS,
                "g"
            );

        group.dataset.id = path.id;

        group.style.cursor = "pointer";


        /*
           Convert angle into radians.
        */

        const radians =
            path.angle * Math.PI / 180;


        const startX = path.x;
        const startY = path.y;


        const endX =
            startX +
            Math.cos(radians) * path.length;

        const endY =
            startY +
            Math.sin(radians) * path.length;


        /* =========================
           VISIBLE LINE
        ========================= */

        const line =
            document.createElementNS(
                svgNS,
                "line"
            );

        line.setAttribute(
            "x1",
            startX
        );

        line.setAttribute(
            "y1",
            startY
        );

        line.setAttribute(
            "x2",
            endX
        );

        line.setAttribute(
            "y2",
            endY
        );

        line.setAttribute(
            "stroke",
            "#00ff9d"
        );

        line.setAttribute(
            "stroke-width",
            "6"
        );

        line.setAttribute(
            "stroke-linecap",
            "round"
        );

        line.setAttribute(
            "marker-end",
            "url(#arrowHead)"
        );


        /* =========================
           INVISIBLE BIG CLICK AREA
        ========================= */

        const hitArea =
            document.createElementNS(
                svgNS,
                "line"
            );

        hitArea.setAttribute(
            "x1",
            startX
        );

        hitArea.setAttribute(
            "y1",
            startY
        );

        hitArea.setAttribute(
            "x2",
            endX
        );

        hitArea.setAttribute(
            "y2",
            endY
        );

        hitArea.setAttribute(
            "stroke",
            "transparent"
        );

        hitArea.setAttribute(
            "stroke-width",
            "25"
        );

        hitArea.style.cursor =
            "pointer";


        /* =========================
           CLICK
        ========================= */

        hitArea.addEventListener(
            "click",
            function () {
                attemptRemove(path.id);
            }
        );


        group.appendChild(line);
        group.appendChild(hitArea);

        svg.appendChild(group);

    });


    gameBoard.appendChild(svg);
}


/* =========================
   ATTEMPT REMOVE
========================= */

function attemptRemove(pathId) {

    const path =
        remainingPaths.find(
            p => p.id === pathId
        );

    if (!path) {
        return;
    }


    /*
       For the current prototype,
       safe:true means the path can
       be removed.
    */

    if (path.safe === true) {

        removePath(pathId);

    } else {

        wrongMove();

    }
}


/* =========================
   REMOVE PATH
========================= */

function removePath(pathId) {

    const group =
        gameBoard.querySelector(
            `[data-id="${pathId}"]`
        );


    if (group) {

        group.style.transition =
            "opacity 0.25s ease, transform 0.25s ease";

        group.style.opacity = "0";
        group.style.transform =
            "scale(0.7)";

    }


    setTimeout(() => {

        remainingPaths =
            remainingPaths.filter(
                path => path.id !== pathId
            );


        statusMessage.textContent =
            "✓ PATH CLEARED";

        statusMessage.className =
            "status-message status-success";


        drawBoard();


        if (remainingPaths.length === 0) {

            completeLevel();

        }

    }, 250);
}


/* =========================
   WRONG MOVE
========================= */

function wrongMove() {

    lives--;

    updateLives();


    statusMessage.textContent =
        "✕ WRONG PATH — LIFE LOST";

    statusMessage.className =
        "status-message status-error";


    gameBoard.classList.add(
        "board-shake"
    );


    setTimeout(() => {

        gameBoard.classList.remove(
            "board-shake"
        );

    }, 400);


    if (lives <= 0) {

        setTimeout(() => {

            gameOver.classList.remove(
                "hidden"
            );

        }, 400);

    }
}


/* =========================
   UPDATE LIVES
========================= */

function updateLives() {

    let hearts = "";

    for (let i = 0; i < 3; i++) {

        if (i < lives) {

            hearts += "❤️ ";

        } else {

            hearts += "🖤 ";

        }

    }

    livesElement.textContent =
        hearts.trim();
}


/* =========================
   LEVEL COMPLETE
========================= */

function completeLevel() {

    const level =
        levels[currentLevel];


    hiddenWord.textContent =
        level.word;


    completedWord.textContent =
        `${level.word} IDENTIFIED ✓`;


    levelComplete.classList.remove(
        "hidden"
    );
}


/* =========================
   NEXT LEVEL
========================= */

completeNextButton.addEventListener(
    "click",
    function () {

        currentLevel++;


        if (
            currentLevel >= levels.length
        ) {

            showFinalScreen();

        } else {

            loadLevel();

        }

    }
);


/* =========================
   RETRY
========================= */

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


/* =========================
   FINAL SCREEN
========================= */

function showFinalScreen() {

    finalScreen.classList.remove(
        "hidden"
    );
}


/* =========================
   SECRET BUTTON
========================= */

secretButton.addEventListener(
    "click",
    function () {

        finalScreen.classList.add(
            "hidden"
        );

        statusMessage.textContent =
            "SECRET LEVEL SYSTEM READY.";

    }
);


/* =========================
   START
========================= */

startGame();
