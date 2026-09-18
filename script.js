// ============================================
// HARROW - TECHNICAL ARROW CHALLENGE
// REAL GEOMETRY CROSSING DETECTION
// ============================================

let currentLevel = 0;
let lives = 3;
let remainingPaths = [];

const gameBoard = document.getElementById("gameBoard");
const levelNumber = document.getElementById("levelNumber");
const livesDisplay = document.getElementById("lives");
const progressText = document.getElementById("progressText");
const difficultyDisplay = document.getElementById("difficulty");
const progressFill = document.getElementById("progressFill");
const hiddenWord = document.getElementById("hiddenWord");
const statusMessage = document.getElementById("statusMessage");

const nextButton = document.getElementById("nextButton");
const retryButton = document.getElementById("retryButton");
const completeNextButton = document.getElementById("completeNextButton");

const gameOver = document.getElementById("gameOver");
const levelComplete = document.getElementById("levelComplete");
const finalScreen = document.getElementById("finalScreen");

const completedWord = document.getElementById("completedWord");


// ============================================
// START GAME
// ============================================

function startGame() {

    currentLevel = 0;
    lives = 3;

    hideAllOverlays();

    loadLevel();
}


// ============================================
// LOAD LEVEL
// ============================================

function loadLevel() {

    const level = levels[currentLevel];

    if (!level) {
        showFinalScreen();
        return;
    }

    remainingPaths = level.paths.map(path => ({
        ...path
    }));

    levelNumber.textContent =
        String(currentLevel + 1).padStart(2, "0");

    progressText.textContent =
        `LEVEL ${currentLevel + 1} / ${levels.length}`;

    difficultyDisplay.textContent =
        level.difficulty || "EASY";

    progressFill.style.width =
        `${((currentLevel + 1) / levels.length) * 100}%`;

    hiddenWord.textContent =
        "? ".repeat(level.word.length).trim();

    statusMessage.textContent =
        "Study the paths carefully.";

    statusMessage.className =
        "status-message";

    updateLives();

    drawBoard();
}


// ============================================
// DRAW BOARD
// ============================================

function drawBoard() {

    gameBoard.innerHTML = "";

    const svgNS = "http://www.w3.org/2000/svg";

    const svg = document.createElementNS(svgNS, "svg");

    svg.setAttribute("viewBox", "0 0 850 520");
    svg.setAttribute("preserveAspectRatio", "xMidYMid meet");

    // ----------------------------------------
    // Arrow marker
    // ----------------------------------------

    const defs = document.createElementNS(svgNS, "defs");

    const marker = document.createElementNS(
        svgNS,
        "marker"
    );

    marker.setAttribute("id", "arrowHead");
    marker.setAttribute("markerWidth", "7");
    marker.setAttribute("markerHeight", "7");
    marker.setAttribute("refX", "6");
    marker.setAttribute("refY", "3.5");
    marker.setAttribute("orient", "auto");
    marker.setAttribute("markerUnits", "strokeWidth");

    const polygon = document.createElementNS(
        svgNS,
        "polygon"
    );

    polygon.setAttribute(
        "points",
        "0 0, 7 3.5, 0 7"
    );

    polygon.setAttribute(
        "fill",
        "#ffffff"
    );

    marker.appendChild(polygon);
    defs.appendChild(marker);
    svg.appendChild(defs);


    // ----------------------------------------
    // Draw every remaining arrow
    // ----------------------------------------

    remainingPaths.forEach(path => {

        const start = getStartPoint(path);
        const end = getEndPoint(path);

        // ------------------------------------
        // Visible white thin arrow
        // ------------------------------------

        const line = document.createElementNS(
            svgNS,
            "line"
        );

        line.setAttribute(
            "x1",
            start.x
        );

        line.setAttribute(
            "y1",
            start.y
        );

        line.setAttribute(
            "x2",
            end.x
        );

        line.setAttribute(
            "y2",
            end.y
        );

        line.setAttribute(
            "stroke",
            "#ffffff"
        );

        line.setAttribute(
            "stroke-width",
            "2"
        );

        line.setAttribute(
            "stroke-linecap",
            "round"
        );

        line.setAttribute(
            "marker-end",
            "url(#arrowHead)"
        );

        line.classList.add("harrow-line");


        // ------------------------------------
        // Invisible large click area
        // ------------------------------------

        const hitArea = document.createElementNS(
            svgNS,
            "line"
        );

        hitArea.setAttribute(
            "x1",
            start.x
        );

        hitArea.setAttribute(
            "y1",
            start.y
        );

        hitArea.setAttribute(
            "x2",
            end.x
        );

        hitArea.setAttribute(
            "y2",
            end.y
        );

        hitArea.setAttribute(
            "stroke",
            "transparent"
        );

        hitArea.setAttribute(
            "stroke-width",
            "24"
        );

        hitArea.setAttribute(
            "stroke-linecap",
            "round"
        );

        hitArea.style.cursor = "pointer";

        hitArea.addEventListener(
            "click",
            function () {
                attemptRemove(path.id);
            }
        );


        svg.appendChild(line);
        svg.appendChild(hitArea);

    });


    gameBoard.appendChild(svg);
}


// ============================================
// GET START POINT
// ============================================

function getStartPoint(path) {

    return {
        x: Number(path.x),
        y: Number(path.y)
    };
}


// ============================================
// GET END POINT
// ============================================

function getEndPoint(path) {

    const angle =
        Number(path.angle) * Math.PI / 180;

    return {
        x:
            Number(path.x) +
            Math.cos(angle) * Number(path.length),

        y:
            Number(path.y) +
            Math.sin(angle) * Number(path.length)
    };
}


// ============================================
// ATTEMPT REMOVE
// ============================================

function attemptRemove(pathId) {

    const selectedPath =
        remainingPaths.find(
            path => path.id === pathId
        );

    if (!selectedPath) {
        return;
    }


    // ----------------------------------------
    // REAL GEOMETRY CHECK
    // ----------------------------------------

    const isBlocked =
        pathHasCrossing(
            selectedPath
        );


    if (isBlocked) {

        loseLife();

        showStatus(
            "✕ PATH BLOCKED — CROSSING DETECTED",
            "wrong"
        );

        shakeBoard();

        return;
    }


    // ----------------------------------------
    // SAFE PATH
    // ----------------------------------------

    removePath(pathId);

}


// ============================================
// CHECK IF PATH HAS CROSSING
// ============================================

function pathHasCrossing(selectedPath) {

    for (const otherPath of remainingPaths) {

        if (otherPath.id === selectedPath.id) {
            continue;
        }


        const a1 =
            getStartPoint(selectedPath);

        const a2 =
            getEndPoint(selectedPath);

        const b1 =
            getStartPoint(otherPath);

        const b2 =
            getEndPoint(otherPath);


        if (
            segmentsProperlyCross(
                a1,
                a2,
                b1,
                b2
            )
        ) {

            return true;
        }

    }

    return false;
}


// ============================================
// PROPER LINE CROSSING
// ============================================
//
// Important:
// A line touching another line at an endpoint
// is NOT considered a crossing.
//
// Only a real interior X-style intersection
// causes a life loss.
// ============================================

function segmentsProperlyCross(a, b, c, d) {

    const o1 = orientation(a, b, c);
    const o2 = orientation(a, b, d);
    const o3 = orientation(c, d, a);
    const o4 = orientation(c, d, b);


    // Real intersection inside both segments
    if (
        o1 !== o2 &&
        o3 !== o4
    ) {
        return true;
    }


    return false;
}


// ============================================
// ORIENTATION
// ============================================

function orientation(a, b, c) {

    const value =
        (b.y - a.y) * (c.x - b.x) -
        (b.x - a.x) * (c.y - b.y);


    const EPSILON = 0.000001;


    if (Math.abs(value) < EPSILON) {
        return 0;
    }


    return value > 0 ? 1 : 2;
}


// ============================================
// REMOVE PATH
// ============================================

function removePath(pathId) {

    remainingPaths =
        remainingPaths.filter(
            path => path.id !== pathId
        );


    showStatus(
        "✓ PATH REMOVED",
        "correct"
    );


    drawBoard();


    // ----------------------------------------
    // LEVEL COMPLETE
    // ----------------------------------------

    if (remainingPaths.length === 0) {

        completeLevel();
    }
}


// ============================================
// LOSE LIFE
// ============================================

function loseLife() {

    lives--;

    updateLives();


    if (lives <= 0) {

        setTimeout(
            showGameOver,
            400
        );

    }

}


// ============================================
// UPDATE LIVES
// ============================================

function updateLives() {

    let hearts = "";

    for (let i = 0; i < 3; i++) {

        if (i < lives) {
            hearts += "❤️ ";
        } else {
            hearts += "🖤 ";
        }

    }

    livesDisplay.textContent =
        hearts.trim();
}


// ============================================
// STATUS MESSAGE
// ============================================

function showStatus(message, type) {

    statusMessage.textContent = message;

    statusMessage.className =
        `status-message ${type}`;
}


// ============================================
// SHAKE BOARD
// ============================================

function shakeBoard() {

    gameBoard.classList.remove(
        "board-shake"
    );

    // Force browser reflow
    void gameBoard.offsetWidth;

    gameBoard.classList.add(
        "board-shake"
    );

}


// ============================================
// COMPLETE LEVEL
// ============================================

function completeLevel() {

    const level =
        levels[currentLevel];

    hiddenWord.textContent =
        level.word;

    completedWord.textContent =
        level.word;


    setTimeout(
        function () {

            levelComplete.classList.remove(
                "hidden"
            );

        },
        500
    );

}


// ============================================
// GAME OVER
// ============================================

function showGameOver() {

    gameOver.classList.remove(
        "hidden"
    );

}


// ============================================
// FINAL SCREEN
// ============================================

function showFinalScreen() {

    finalScreen.classList.remove(
        "hidden"
    );

}


// ============================================
// HIDE OVERLAYS
// ============================================

function hideAllOverlays() {

    gameOver.classList.add(
        "hidden"
    );

    levelComplete.classList.add(
        "hidden"
    );

    finalScreen.classList.add(
        "hidden"
    );

}


// ============================================
// NEXT LEVEL
// ============================================

function goToNextLevel() {

    currentLevel++;

    hideAllOverlays();

    if (currentLevel >= levels.length) {

        showFinalScreen();

        return;
    }

    loadLevel();
}


// ============================================
// RETRY
// ============================================

function retryGame() {

    lives = 3;

    hideAllOverlays();

    loadLevel();
}


// ============================================
// BUTTON EVENTS
// ============================================

if (nextButton) {

    nextButton.addEventListener(
        "click",
        goToNextLevel
    );

}


if (completeNextButton) {

    completeNextButton.addEventListener(
        "click",
        goToNextLevel
    );

}


if (retryButton) {

    retryButton.addEventListener(
        "click",
        retryGame
    );

}


// ============================================
// INITIALIZE
// ============================================

startGame();
