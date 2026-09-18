// ============================================
// HARROW
// ARROW PATH PUZZLE
// ============================================

let currentLevel = 0;
let lives = 3;
let remainingPaths = [];
let levelFinished = false;


// ============================================
// ELEMENTS
// ============================================

const gameBoard =
    document.getElementById("gameBoard");

const levelNumber =
    document.getElementById("levelNumber");

const livesDisplay =
    document.getElementById("lives");

const progressText =
    document.getElementById("progressText");

const difficultyDisplay =
    document.getElementById("difficulty");

const progressFill =
    document.getElementById("progressFill");

const instructionText =
    document.getElementById("instructionText");

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

const completeNextButton =
    document.getElementById(
        "completeNextButton"
    );

const finalScreen =
    document.getElementById("finalScreen");

const secretButton =
    document.getElementById("secretButton");

const completedWord =
    document.getElementById("completedWord");


// ============================================
// START GAME
// ============================================

function startGame() {

    currentLevel = 0;

    lives = 3;

    levelFinished = false;

    hideAllOverlays();

    loadLevel();

}


// ============================================
// LOAD LEVEL
// ============================================

function loadLevel() {

    const level =
        levels[currentLevel];


    if (!level) {

        showFinalScreen();

        return;

    }


    levelFinished = false;


    remainingPaths =
        level.paths.map(
            path => ({
                ...path
            })
        );


    levelNumber.textContent =
        String(
            currentLevel + 1
        ).padStart(2, "0");


    progressText.textContent =
        `LEVEL ${
            currentLevel + 1
        } / ${levels.length}`;


    difficultyDisplay.textContent =
        level.difficulty;


    const progress =
        (
            (currentLevel + 1)
            /
            levels.length
        ) * 100;


    progressFill.style.width =
        `${progress}%`;


    if (instructionText) {

        instructionText.textContent =
            "Remove the arrows one by one.";

    }


    showStatus(
        "Find an arrow with a clear path.",
        ""
    );


    updateLives();

    drawBoard();

}


// ============================================
// DRAW BOARD
// ============================================

function drawBoard() {

    gameBoard.innerHTML = "";


    const SVG_NS =
        "http://www.w3.org/2000/svg";


    const svg =
        document.createElementNS(
            SVG_NS,
            "svg"
        );


    svg.setAttribute(
        "viewBox",
        `0 0 ${BOARD_WIDTH} ${BOARD_HEIGHT}`
    );


    svg.setAttribute(
        "preserveAspectRatio",
        "xMidYMid meet"
    );


    // ========================================
    // ARROW HEAD
    // ========================================

    const defs =
        document.createElementNS(
            SVG_NS,
            "defs"
        );


    const marker =
        document.createElementNS(
            SVG_NS,
            "marker"
        );


    marker.setAttribute(
        "id",
        "harrowArrowHead"
    );


    marker.setAttribute(
        "markerWidth",
        "8"
    );


    marker.setAttribute(
        "markerHeight",
        "8"
    );


    marker.setAttribute(
        "refX",
        "7"
    );


    marker.setAttribute(
        "refY",
        "4"
    );


    marker.setAttribute(
        "orient",
        "auto"
    );


    marker.setAttribute(
        "markerUnits",
        "userSpaceOnUse"
    );


    const polygon =
        document.createElementNS(
            SVG_NS,
            "polygon"
        );


    polygon.setAttribute(
        "points",
        "0 0, 8 4, 0 8"
    );


    polygon.setAttribute(
        "fill",
        "#ffffff"
    );


    marker.appendChild(polygon);

    defs.appendChild(marker);

    svg.appendChild(defs);


    // ========================================
    // DRAW EACH ARROW
    // ========================================

    remainingPaths.forEach(
        path => {

            const start =
                getStartPoint(path);

            const end =
                getEndPoint(path);


            // Visible arrow

            const line =
                document.createElementNS(
                    SVG_NS,
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
                "1.8"
            );


            line.setAttribute(
                "stroke-linecap",
                "round"
            );


            line.setAttribute(
                "marker-end",
                "url(#harrowArrowHead)"
            );


            line.setAttribute(
                "vector-effect",
                "non-scaling-stroke"
            );


            line.dataset.id =
                path.id;


            line.classList.add(
                "harrow-visible"
            );


            // =================================
            // CLICK AREA
            // =================================

            const hitArea =
                document.createElementNS(
                    SVG_NS,
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
                "28"
            );


            hitArea.setAttribute(
                "stroke-linecap",
                "round"
            );


            hitArea.style.cursor =
                "pointer";


            // =================================
            // HOVER
            // =================================

            hitArea.addEventListener(
                "mouseenter",
                function () {

                    line.classList.add(
                        "harrow-hover"
                    );

                }
            );


            hitArea.addEventListener(
                "mouseleave",
                function () {

                    line.classList.remove(
                        "harrow-hover"
                    );

                }
            );


            // =================================
            // CLICK
            // =================================

            hitArea.addEventListener(
                "click",
                function () {

                    attemptRemove(
                        path.id
                    );

                }
            );


            svg.appendChild(line);

            svg.appendChild(hitArea);

        }
    );


    gameBoard.appendChild(svg);

}


// ============================================
// START POINT
// ============================================

function getStartPoint(path) {

    return {

        x: Number(path.x),

        y: Number(path.y)

    };

}


// ============================================
// END / ARROW HEAD
// ============================================

function getEndPoint(path) {

    const angle =
        Number(path.angle)
        *
        Math.PI
        /
        180;


    return {

        x:
            Number(path.x)
            +
            Math.cos(angle)
            *
            Number(path.length),

        y:
            Number(path.y)
            +
            Math.sin(angle)
            *
            Number(path.length)

    };

}


// ============================================
// ESCAPE POINT
// ============================================

function getEscapePoint(path) {

    const head =
        getEndPoint(path);


    const angle =
        Number(path.angle)
        *
        Math.PI
        /
        180;


    const dx =
        Math.cos(angle);

    const dy =
        Math.sin(angle);


    let distance =
        Infinity;


    const EPS =
        0.000001;


    if (dx > EPS) {

        distance =
            Math.min(
                distance,
                (
                    BOARD_WIDTH -
                    head.x
                ) / dx
            );

    }


    if (dx < -EPS) {

        distance =
            Math.min(
                distance,
                -head.x / dx
            );

    }


    if (dy > EPS) {

        distance =
            Math.min(
                distance,
                (
                    BOARD_HEIGHT -
                    head.y
                ) / dy
            );

    }


    if (dy < -EPS) {

        distance =
            Math.min(
                distance,
                -head.y / dy
            );

    }


    return {

        x:
            head.x +
            dx *
            distance,

        y:
            head.y +
            dy *
            distance

    };

}


// ============================================
// CHECK WHETHER ARROW IS BLOCKED
// ============================================

function pathIsBlocked(
    selectedPath
) {

    const head =
        getEndPoint(
            selectedPath
        );


    const exit =
        getEscapePoint(
            selectedPath
        );


    for (
        const otherPath
        of remainingPaths
    ) {

        if (
            otherPath.id ===
            selectedPath.id
        ) {

            continue;

        }


        const otherStart =
            getStartPoint(
                otherPath
            );


        const otherEnd =
            getEndPoint(
                otherPath
            );


        if (
            segmentsIntersect(
                head,
                exit,
                otherStart,
                otherEnd
            )
        ) {

            return true;

        }

    }


    return false;

}


// ============================================
// TRY REMOVE
// ============================================

function attemptRemove(
    pathId
) {

    if (levelFinished) {

        return;

    }


    const selectedPath =
        remainingPaths.find(
            path =>
                path.id === pathId
        );


    if (!selectedPath) {

        return;

    }


    const blocked =
        pathIsBlocked(
            selectedPath
        );


    if (blocked) {

        loseLife();

        flashWrongArrow(
            pathId
        );


        showStatus(
            "✕ BLOCKED — LIFE LOST",
            "wrong"
        );


        shakeBoard();

        return;

    }


    removePath(
        pathId
    );

}


// ============================================
// REMOVE ARROW
// ============================================

function removePath(
    pathId
) {

    remainingPaths =
        remainingPaths.filter(
            path =>
                path.id !== pathId
        );


    showStatus(
        "✓ ARROW REMOVED",
        "correct"
    );


    drawBoard();


    if (
        remainingPaths.length === 0
    ) {

        completeLevel();

    }

}


// ============================================
// LOSE LIFE
// ============================================

function loseLife() {

    if (lives <= 0) {

        return;

    }


    lives--;

    updateLives();


    if (lives <= 0) {

        levelFinished = true;


        setTimeout(
            function () {

                showGameOver();

            },
            400
        );

    }

}


// ============================================
// UPDATE LIVES
// ============================================

function updateLives() {

    let hearts = "";


    for (
        let i = 0;
        i < 3;
        i++
    ) {

        if (i < lives) {

            hearts += "❤️ ";

        }

        else {

            hearts += "🖤 ";

        }

    }


    livesDisplay.textContent =
        hearts.trim();

}


// ============================================
// SEGMENT INTERSECTION
// ============================================

function segmentsIntersect(
    a,
    b,
    c,
    d
) {

    const o1 =
        orientation(
            a,
            b,
            c
        );


    const o2 =
        orientation(
            a,
            b,
            d
        );


    const o3 =
        orientation(
            c,
            d,
            a
        );


    const o4 =
        orientation(
            c,
            d,
            b
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
            a,
            b,
            c
        )
    ) {

        return true;

    }


    if (
        o2 === 0 &&
        onSegment(
            a,
            b,
            d
        )
    ) {

        return true;

    }


    if (
        o3 === 0 &&
        onSegment(
            c,
            d,
            a
        )
    ) {

        return true;

    }


    if (
        o4 === 0 &&
        onSegment(
            c,
            d,
            b
        )
    ) {

        return true;

    }


    return false;

}


// ============================================
// ORIENTATION
// ============================================

function orientation(
    a,
    b,
    c
) {

    const value =
        (
            b.x - a.x
        )
        *
        (
            c.y - a.y
        )
        -
        (
            b.y - a.y
        )
        *
        (
            c.x - a.x
        );


    const epsilon =
        0.000001;


    if (
        Math.abs(value)
        < epsilon
    ) {

        return 0;

    }


    return value > 0
        ? 1
        : 2;

}


// ============================================
// POINT ON SEGMENT
// ============================================

function onSegment(
    a,
    b,
    p
) {

    return (

        p.x >=
        Math.min(
            a.x,
            b.x
        ) - 0.001

        &&

        p.x <=
        Math.max(
            a.x,
            b.x
        ) + 0.001

        &&

        p.y >=
        Math.min(
            a.y,
            b.y
        ) - 0.001

        &&

        p.y <=
        Math.max(
            a.y,
            b.y
        ) + 0.001

    );

}


// ============================================
// WRONG ARROW EFFECT
// ============================================

function flashWrongArrow(
    pathId
) {

    const arrow =
        document.querySelector(
            `.harrow-visible[data-id="${pathId}"]`
        );


    if (!arrow) {

        return;

    }


    arrow.classList.add(
        "harrow-wrong"
    );


    setTimeout(
        function () {

            arrow.classList.remove(
                "harrow-wrong"
            );

        },
        450
    );

}


// ============================================
// BOARD SHAKE
// ============================================

function shakeBoard() {

    gameBoard.classList.remove(
        "board-shake"
    );


    void gameBoard.offsetWidth;


    gameBoard.classList.add(
        "board-shake"
    );


    setTimeout(
        function () {

            gameBoard.classList.remove(
                "board-shake"
            );

        },
        400
    );

}


// ============================================
// STATUS
// ============================================

function showStatus(
    message,
    type
) {

    statusMessage.textContent =
        message;


    statusMessage.className =
        "status-message";


    if (type) {

        statusMessage.classList.add(
            type
        );

    }

}


// ============================================
// LEVEL COMPLETE
// ============================================

function completeLevel() {

    if (levelFinished) {

        return;

    }


    levelFinished = true;


    completedWord.textContent =
        `LEVEL ${
            currentLevel + 1
        } CLEARED`;


    showStatus(
        "✓ HARROW CLEARED",
        "correct"
    );


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

    levelFinished = true;

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


    if (
        currentLevel >=
        levels.length
    ) {

        showFinalScreen();

        return;

    }


    loadLevel();

}


// ============================================
// RETRY CURRENT LEVEL
// ============================================

function retryGame() {

    lives = 3;

    hideAllOverlays();

    loadLevel();

}


// ============================================
// PLAY AGAIN
// ============================================

function playAgain() {

    currentLevel = 0;

    lives = 3;

    levelFinished = false;

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


if (secretButton) {

    secretButton.addEventListener(
        "click",
        playAgain
    );

}


// ============================================
// START
// ============================================

startGame();
