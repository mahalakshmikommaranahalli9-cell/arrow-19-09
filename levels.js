// ============================================
// HARROW
// 60 FIXED ARROW PUZZLE LEVELS
// ============================================

const BOARD_WIDTH = 1100;
const BOARD_HEIGHT = 650;

const DIRECTIONS = [
    0,
    45,
    90,
    135,
    180,
    225,
    270,
    315
];


// ============================================
// SEEDED RANDOM
// ============================================

function createRandom(seed) {

    let value = seed >>> 0;

    return function () {

        value += 0x6D2B79F5;

        let t = value;

        t = Math.imul(
            t ^ (t >>> 15),
            t | 1
        );

        t ^= t + Math.imul(
            t ^ (t >>> 7),
            t | 61
        );

        return (
            ((t ^ (t >>> 14)) >>> 0)
            / 4294967296
        );
    };
}


// ============================================
// POINT HELPERS
// ============================================

function getPoint(path) {

    const angle =
        path.angle * Math.PI / 180;

    return {

        x:
            path.x +
            Math.cos(angle) *
            path.length,

        y:
            path.y +
            Math.sin(angle) *
            path.length

    };

}


// ============================================
// ORIENTATION
// ============================================

function orientation(a, b, c) {

    const value =
        (b.x - a.x) *
        (c.y - a.y) -

        (b.y - a.y) *
        (c.x - a.x);

    const epsilon = 0.000001;

    if (Math.abs(value) < epsilon) {

        return 0;

    }

    return value > 0 ? 1 : 2;

}


// ============================================
// POINT ON SEGMENT
// ============================================

function pointOnSegment(a, b, p) {

    return (

        p.x >= Math.min(a.x, b.x) - 0.001 &&

        p.x <= Math.max(a.x, b.x) + 0.001 &&

        p.y >= Math.min(a.y, b.y) - 0.001 &&

        p.y <= Math.max(a.y, b.y) + 0.001

    );

}


// ============================================
// LINE INTERSECTION
// ============================================

function linesIntersect(a, b, c, d) {

    const o1 = orientation(a, b, c);
    const o2 = orientation(a, b, d);
    const o3 = orientation(c, d, a);
    const o4 = orientation(c, d, b);


    if (
        o1 !== o2 &&
        o3 !== o4
    ) {

        return true;

    }


    if (
        o1 === 0 &&
        pointOnSegment(a, b, c)
    ) {

        return true;

    }


    if (
        o2 === 0 &&
        pointOnSegment(a, b, d)
    ) {

        return true;

    }


    if (
        o3 === 0 &&
        pointOnSegment(c, d, a)
    ) {

        return true;

    }


    if (
        o4 === 0 &&
        pointOnSegment(c, d, b)
    ) {

        return true;

    }


    return false;

}


// ============================================
// ESCAPE POINT
// ============================================

function getEscapePoint(path) {

    const head = getPoint(path);

    const angle =
        path.angle * Math.PI / 180;


    const dx = Math.cos(angle);
    const dy = Math.sin(angle);


    let distance = Infinity;


    if (dx > 0) {

        distance = Math.min(
            distance,
            (BOARD_WIDTH - head.x) / dx
        );

    }

    if (dx < 0) {

        distance = Math.min(
            distance,
            -head.x / dx
        );

    }

    if (dy > 0) {

        distance = Math.min(
            distance,
            (BOARD_HEIGHT - head.y) / dy
        );

    }

    if (dy < 0) {

        distance = Math.min(
            distance,
            -head.y / dy
        );

    }


    return {

        x: head.x + dx * distance,

        y: head.y + dy * distance

    };

}


// ============================================
// CHECK ESCAPE PATH
// ============================================

function escapeBlocked(path, existingPaths) {

    const head =
        getPoint(path);

    const exit =
        getEscapePoint(path);


    for (
        const other of existingPaths
    ) {

        const otherStart = {

            x: other.x,

            y: other.y

        };


        const otherEnd =
            getPoint(other);


        if (
            linesIntersect(
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
// COUNT VISUAL CROSSINGS
// ============================================

function countCrossings(
    path,
    existingPaths
) {

    const start = {

        x: path.x,

        y: path.y

    };


    const end =
        getPoint(path);


    let count = 0;


    for (
        const other of existingPaths
    ) {

        const otherStart = {

            x: other.x,

            y: other.y

        };


        const otherEnd =
            getPoint(other);


        if (
            linesIntersect(
                start,
                end,
                otherStart,
                otherEnd
            )
        ) {

            count++;

        }

    }


    return count;

}


// ============================================
// CREATE ONE LEVEL
// ============================================

function createLevel(
    levelNumber,
    arrowCount,
    seed
) {

    const random =
        createRandom(seed);


    const paths = [];


    /*
        We build the level backwards.

        This guarantees that there is always
        a possible removal order.
    */

    for (
        let number = arrowCount;
        number >= 1;
        number--
    ) {

        let bestPath = null;

        let bestScore = -1;


        /*
            Try many possible arrows and select
            one that creates a dense visual design
            while keeping its escape path clear.
        */

        for (
            let attempt = 0;
            attempt < 350;
            attempt++
        ) {

            const angle =
                DIRECTIONS[
                    Math.floor(
                        random() *
                        DIRECTIONS.length
                    )
                ];


            const length =
                55 +
                random() * 55;


            const x =
                70 +
                random() *
                (BOARD_WIDTH - 140);


            const y =
                70 +
                random() *
                (BOARD_HEIGHT - 140);


            const radians =
                angle * Math.PI / 180;


            const endX =
                x +
                Math.cos(radians) *
                length;


            const endY =
                y +
                Math.sin(radians) *
                length;


            /*
                Keep the complete arrow
                inside the board.
            */

            if (
                endX < 30 ||
                endX > BOARD_WIDTH - 30 ||
                endY < 30 ||
                endY > BOARD_HEIGHT - 30
            ) {

                continue;

            }


            const candidate = {

                id:
                    `L${levelNumber}P${number}`,

                x:
                    Number(x.toFixed(1)),

                y:
                    Number(y.toFixed(1)),

                length:
                    Number(length.toFixed(1)),

                angle:
                    angle

            };


            /*
                The arrow must have a clear
                escape route when its turn comes.
            */

            if (
                escapeBlocked(
                    candidate,
                    paths
                )
            ) {

                continue;

            }


            const crossings =
                countCrossings(
                    candidate,
                    paths
                );


            /*
                Prefer arrows that visually
                cross other arrows.
            */

            if (
                crossings > bestScore
            ) {

                bestScore =
                    crossings;

                bestPath =
                    candidate;

            }

        }


        /*
            Fallback arrow.

            Used only if a suitable dense
            position could not be found.
        */

        if (!bestPath) {

            const fallbackAngles = [
                0,
                90,
                180,
                270
            ];


            for (
                let attempt = 0;
                attempt < 1000;
                attempt++
            ) {

                const angle =
                    fallbackAngles[
                        Math.floor(
                            random() *
                            fallbackAngles.length
                        )
                    ];


                const length = 60;


                const x =
                    60 +
                    random() *
                    (BOARD_WIDTH - 120);


                const y =
                    60 +
                    random() *
                    (BOARD_HEIGHT - 120);


                const radians =
                    angle *
                    Math.PI /
                    180;


                const endX =
                    x +
                    Math.cos(radians) *
                    length;


                const endY =
                    y +
                    Math.sin(radians) *
                    length;


                if (
                    endX < 30 ||
                    endX > BOARD_WIDTH - 30 ||
                    endY < 30 ||
                    endY > BOARD_HEIGHT - 30
                ) {

                    continue;

                }


                const candidate = {

                    id:
                        `L${levelNumber}P${number}`,

                    x:
                        Number(x.toFixed(1)),

                    y:
                        Number(y.toFixed(1)),

                    length:
                        length,

                    angle:
                        angle

                };


                if (
                    !escapeBlocked(
                        candidate,
                        paths
                    )
                ) {

                    bestPath =
                        candidate;

                    break;

                }

            }

        }


        if (bestPath) {

            paths.push(bestPath);

        }

    }


    let difficulty;


    if (arrowCount < 23) {

        difficulty = "EASY";

    }

    else if (arrowCount < 30) {

        difficulty = "NORMAL";

    }

    else if (arrowCount < 38) {

        difficulty = "HARD";

    }

    else if (arrowCount < 47) {

        difficulty = "VERY HARD";

    }

    else {

        difficulty = "EXTREME";

    }


    return {

        id:
            levelNumber,

        difficulty:
            difficulty,

        paths:
            paths

    };

}


// ============================================
// 60 HARROW LEVELS
// ============================================

const levels = [];


for (
    let i = 1;
    i <= 60;
    i++
) {

    const arrowCount =
        18 +
        Math.floor(
            (i - 1) * 0.6
        );


    const level =
        createLevel(
            i,
            arrowCount,
            78431 + i * 9176
        );


    levels.push(level);

}
