let currentLevel = 0;

let lives = 3;

let answered = false;


/* ELEMENTS */

const levelNumber =
    document.getElementById("levelNumber");

const progressText =
    document.getElementById("progressText");

const progressFill =
    document.getElementById("progressFill");

const difficulty =
    document.getElementById("difficulty");

const challengeType =
    document.getElementById("challengeType");

const question =
    document.getElementById("question");

const optionsContainer =
    document.getElementById("options");

const message =
    document.getElementById("message");

const messageText =
    document.getElementById("messageText");

const nextButton =
    document.getElementById("nextButton");

const gameOver =
    document.getElementById("gameOver");

const retryButton =
    document.getElementById("retryButton");

const victory =
    document.getElementById("victory");

const secretButton =
    document.getElementById("secretButton");


/* START GAME */

function startGame() {

    currentLevel = 0;

    lives = 3;

    gameOver.classList.add("hidden");

    victory.classList.add("hidden");

    loadLevel();

}


/* LOAD LEVEL */

function loadLevel() {

    answered = false;

    message.classList.add("hidden");

    nextButton.classList.add("hidden");

    const level = levels[currentLevel];


    /* LEVEL NUMBER */

    levelNumber.textContent =
        String(level.id).padStart(2, "0");


    /* PROGRESS */

    progressText.textContent =
        `LEVEL ${level.id} / ${levels.length}`;


    progressFill.style.width =
        `${((currentLevel + 1) / levels.length) * 100}%`;


    /* DIFFICULTY */

    difficulty.textContent =
        level.difficulty;


    /* TYPE */

    challengeType.textContent =
        level.type || "CHALLENGE";


    /* QUESTION */

    question.textContent =
        level.question;


    /* OPTIONS */

    optionsContainer.innerHTML = "";


    level.options.forEach((option, index) => {

        const button =
            document.createElement("button");

        button.className = "option";

        button.textContent = option;

        button.addEventListener(
            "click",
            () => checkAnswer(index)
        );

        optionsContainer.appendChild(button);

    });


    updateLives();

}


/* CHECK ANSWER */

function checkAnswer(selectedAnswer) {

    if (answered) {
        return;
    }


    const level =
        levels[currentLevel];


    if (selectedAnswer === level.answer) {

        answered = true;

        showCorrect();

    } else {

        loseLife();

    }

}


/* CORRECT */

function showCorrect() {

    messageText.textContent =
        "✓ CORRECT — Challenge cleared.";

    message.classList.remove("hidden");


    document
        .querySelectorAll(".option")
        .forEach(button => {

            button.disabled = true;

        });


    if (currentLevel === levels.length - 1) {

        setTimeout(() => {

            victory.classList.remove("hidden");

        }, 700);

    } else {

        nextButton.classList.remove("hidden");

    }

}


/* WRONG */

function loseLife() {

    lives--;

    updateLives();


    if (lives <= 0) {

        gameOver.classList.remove("hidden");

        return;

    }


    const remaining =
        lives === 1
            ? "1 life"
            : `${lives} lives`;


    messageText.textContent =
        `⚠️ WRONG MOVE — ${remaining} remaining. Think carefully.`;

    message.classList.remove("hidden");

}


/* LIVES */

function updateLives() {

    const lifeElements = [

        document.getElementById("life1"),

        document.getElementById("life2"),

        document.getElementById("life3")

    ];


    lifeElements.forEach(
        (element, index) => {

            element.textContent =
                index < lives
                    ? "❤️"
                    : "🖤";

        }
    );

}


/* NEXT LEVEL */

nextButton.addEventListener(
    "click",
    () => {

        currentLevel++;

        loadLevel();

    }
);


/* RETRY */

retryButton.addEventListener(
    "click",
    () => {

        lives = 3;

        gameOver.classList.add("hidden");

        loadLevel();

    }
);


/* SECRET / CONTINUE */

secretButton.addEventListener(
    "click",
    () => {

        victory.classList.add("hidden");

        currentLevel++;

        /*
         * Later this will unlock
         * Level 51 and beyond.
         */

        if (currentLevel < levels.length) {

            loadLevel();

        } else {

            alert(
                "SECRET LEVEL SYSTEM READY."
            );

        }

    }
);


/* START */

startGame();
