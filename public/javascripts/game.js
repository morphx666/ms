let w = 9;
let h = 9;
let totalMines = 10;
const classes = ['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight'];
const cells = [];
const queue = [];
let timer = null;
let seconds = 1;
let userMines = 0;

$(document).ready(() => {
    $("#level").val("0");
    restart()
});

function restart() {
    cells.splice(0, cells.length);
    queue.splice(0, queue.length);
    stopTimer();
    createBoard();
    clearProcessedState();
    updateMinesCounter();
}

function createBoard() {
    let board = $("#board");
    board.empty();

    for(let y = 0; y < h; y++) {
        let row = $(`<div class='row'></div>`);
        for(let x = 0; x < w; x++) {
            let cell = $(`<div class='cell' id="r${y}c${x}"></div>`);
            cell.mousedown((e) => {
                if(timer == null) {
                    setMines(cell, totalMines);
                    startTimer();
                }

                if(e.which == 3) {
                    if($(cell).text() == "X") {
                        $(cell).text("");
                        userMines--;
                    } else {
                        $(cell).text("X");
                        userMines++;
                    }
                    updateMinesCounter();
                    e.preventDefault();
                    return;
                }

                reveal(cell);

                if(cell.mine) {
                    stopTimer();
                    $(cell).text("B");
                    console.log("Game Over");
                    cells.forEach(c => c.off("mousedown"));
                } else {
                    if(cell.mines > 0) {
                        showMinesCount(cell);
                    } else {
                        revealEmpty(cell);
                        clearProcessedState();
                    }
                }
            });
            cell.x = x;
            cell.y = y;
            cell.mine = false;
            cells.push(cell);
            row.append(cell);
        }
        board.append(row);
    }
}

function startTimer() {
    updateTimer();
    timer = window.setInterval(() => updateTimer(), 1000);
}

function stopTimer() {
    if(timer != null) {
        window.clearInterval(timer);
        userMines = 0;
        seconds = 0;
        updateTimer();
        updateMinesCounter();
        timer = null;
    }
}

function revealEmpty(cell) {
    reveal(cell);

    queue.push(canMove(cell, 'up'));
    queue.push(canMove(cell, 'uprt'));
    queue.push(canMove(cell, 'rt'));
    queue.push(canMove(cell, 'rtdn'));
    queue.push(canMove(cell, 'dn'));
    queue.push(canMove(cell, 'dnlt'));
    queue.push(canMove(cell, 'lt'));
    queue.push(canMove(cell, 'ltup'));

    queue.forEach(data => {
        const cell = data[0];
        const canMove = data[1];
        if(!canMove) {
            if(cell != null) {
                reveal(cell);
                showMinesCount(cell);
            }
        } else if(!cell.processed) {
            cell.processed = true;
            revealEmpty(cell);
        }
    });
}

function getCell(cell, d) {
    let x = d.includes("rt") ? 1 : d.includes("lt") ? -1 : 0;
    let y = d.includes("up") ? -1 : d.includes("dn") ? 1 : 0;

    if(cell.x + x < 0 || cell.x + x >= w || cell.y + y < 0 || cell.y + y >= h) {
        return null;
    } else {
        return cells[cell.x + x + (cell.y + y) * w];
    }
}

function canMove(cell, d) {
    const n = getCell(cell, d);
    if(n == null) {
        return [null, false];
    } else {
        return [n, n.mines == 0];
    }
}

function clearProcessedState() {
    for(let i = 0; i < cells.length; i++) {
        cells[i].processed = false;
    }
}

function showMinesCount(cell) {
    cell.text(cell.mines);
    cell.addClass(classes[cell.mines - 1]);
}

function reveal(cell) {
    cell.addClass("reveal");
    cell.off("mousedown");
}

function countSurroundingMines(cell) {
    let mines = 0;
    for(let y = -1; y <= 1; y++) {
        for(let x = -1; x <= 1; x++) {
            const i = cell.x + x;
            const j = cell.y + y;
            if(i >= 0 && i < w && j >= 0 && j < h) {
                const n = cells[i + j * w];
                if(n.mine) mines++;
            }
        }
    }
    return mines;
}

function setMines(ex, minesCount) {
    // cells[6 + 1 * w].mine = true;
    // cells[7 + 1 * w].mine = true;
    // cells[1 + 4 * w].mine = true;
    // cells[8 + 4 * w].mine = true;
    // cells[3 + 5 * w].mine = true;
    // cells[6 + 6 * w].mine = true;
    // cells[7 + 6 * w].mine = true;
    // cells[3 + 8 * w].mine = true;
    // cells[4 + 8 * w].mine = true;
    // cells[6 + 8 * w].mine = true;

    while(minesCount > 0) {
        let cell = cells[Math.floor(Math.random() * cells.length)];
        if(!cell.mine && ex.x != cell.x && ex.y != cell.y) {
            cell.mine = true;
            minesCount--;
            //$(cell).text("B");
        }
    }

    for(let i = 0; i < cells.length; i++) {
        cells[i].mines = countSurroundingMines(cells[i]);
    }
}

function updateMinesCounter() {
    $("#mines").text((totalMines - userMines).toString().padStart(3, "0"));
}

function updateTimer() {
    $("#timer").text((seconds++).toString().padStart(3, "0"));
}

function setGameLevel(level) {
    switch(level.value) {
        case "0":
            w = 9;
            h = 9;
            totalMines = 10;
            break;
        case "1":
            w = 16;
            h = 16;
            totalMines = 40;
            break;
        case "2":
            w = 30;
            h = 16;
            totalMines = 99;
            break;
        case "3":
            $(".user").css("pointer-events", "unset");
    }
    $("#userWidth").val(w);
    $("#userHeight").val(h);
    $("#userMines").val(totalMines);
    restart();
}

function setUserSettings() {
    w = $("#userWidth").val();
    h = $("#userHeight").val();
    totalMines = $("#userMines").val();
    restart();
}