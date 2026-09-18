let currentLevel = 0;

let lives = 3;

let remainingPaths = [];


/* =========================
   ELEMENTS
========================= */

const levelNumber =
    document.getElementById("levelNumber");

const progressText =
    document.getElementById("progressText");

const progressFill =
    document.getElementById("progressFill");

const difficulty =
    document.getElementById("difficulty");

const livesElement =
    document.getElementById("lives");

const hiddenWord =
    document.getElementById("hiddenWord");

const instructionText =
    document.getElementById("instructionText");

const gameBoard =
    document.getElementById("gameBoard");

const statusMessage =
    document.getElementById("statusMessage");

const nextButton =
    document.getElementById("nextButton");

const gameOver =
    document.getElementById("gameOver");

const retryButton =
    document.getElementById("retryButton");

const levelComplete =
    document.getElementById("levelComplete");

const completedWord =
    document.getElementById("completedWord");

const completeNextButton =
    document.getElementById("completeNextButton");

const finalScreen =
    document.getElementById("finalScreen");

const secretButton =
    document.getElementById("secretButton");


/* =========================
   START
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

    const level =
        levels[currentLevel];

    if (!level) {

        showFinalScreen();

        return;
    }


    lives = 3;

    remainingPaths =
        JSON.parse(
            JSON.stringify(level.paths)
        );


    levelNumber.textContent =
        String(level.id).padStart(2, "0");


    progressText.textContent =
        `LEVEL ${level.id} / 50`;


    progressFill.style.width =
        `${Math.min((level.id / 50) * 100, 100)}%`;


    difficulty.textContent =
        level.difficulty;


    hiddenWord.textContent =
        "????";


    instructionText.textContent =
        level.message;


    statusMessage.textContent = "";

    statusMessage.className =
        "status-message";


    nextButton.classList.add("hidden");

    levelComplete.classList.add("hidden");

    gameOver.classList.add("hidden");


    updateLives();

    drawBoard();
}


/* =========================
   DRAW BOARD
========================= */

function drawBoard() {

    gameBoard.innerHTML = "";


    remainingPaths.forEach(path => {

        const element =
            document.createElement("div");


        element.className =
            "arrow-path";


        element.dataset.id =
            path.id;


        element.style.left =
            `${path.x}px`;


        element.style.top =
            `${path.y}px`;


        element.style.width =
            `${path.length}px`;


        element.style.transform =
            `rotate(${path.angle}deg)`;


        element.style.setProperty(
            "--angle",
            `${path.angle}deg`
        );


        const arrowHead =
            document.createElement("span");


        arrowHead.className =
            "arrow-head";


        element.appendChild(
            arrowHead
        );


        element.addEventListener(
            "click",
            () => attemptRemove(path.id)
        );


        gameBoard.appendChild(
            element
        );

    });

}


/* =========================
   REMOVE PATH
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
     * For now, the level data tells
     * the engine which paths are safe.
     *
     * Later we will replace this with
     * automatic geometric intersection
     * detection.
     */

    if (path.safe === true) {

        removePath(pathId);

    } else {

        wrongMove();

    }

}


/* =========================
   CORRECT MOVE
========================= */

function removePath(pathId) {

    const element =
        document.querySelector(
            `[data-id="${pathId}"]`
        );


    if (element) {

        element.classList.add(
            "removing"
        );

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


    if (lives <= 0) {

        setTimeout(() => {

            gameOver.classList.remove(
                "hidden"
            );

        }, 400);

    }

}


/* =========================
   LIVES
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
    () => {

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
    () => {

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
    () => {

        finalScreen.classList.add(
            "hidden"
        );

        statusMessage.textContent =
            "SECRET LEVEL SYSTEM READY.";

    }
);


/* =========================
   START GAME
========================= */

startGame();
