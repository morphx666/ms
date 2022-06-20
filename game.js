const classes = ['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight'];
const cells = [];
const queue = [];
let timer = null;
let seconds = 1;

const buttons = {
    left: 1,
    right: 3
}

const states = {
    playing: 0, 
    lost: 1,
    won: 2
}

const game = {
    w: 9,
    h: 9,
    totalMines: 10,
    userMines: 0,
    state: states.playing
};

$(document).ready(() => {
    $("#level").val("0");
    restart();
});

function restart() {
    game.state = states.playing;
    game.userMines = 0;
    $("#restart").text("🙂");
    cells.splice(0, cells.length);
    queue.splice(0, queue.length);
    stopTimer();
    seconds = 0;
    createBoard();
    clearCellsStates();
    updateMinesCounter();
    updateTimer();
    $(".game-over").css({
        "opacity": "0",
        "z-index": "-1"
    });
}

function createBoard() {
    const board = $("#board");
    board.empty();

    for(let y = 0; y < game.h; y++) {
        let row = $(`<div class='row'></div>`);
        for(let x = 0; x < game.w; x++) {
            let cell = $(`<div class='cell threed3'"></div>`);
            
            cell.mousedown(e => {
                if(e.which == buttons.left && timer == null) {
                    setMines(cell, game.totalMines);
                    startTimer();
                }

                const ocell = $(cell);
                if(e.which == buttons.right) {
                    if(cell.flagged) {
                        ocell.text("");
                        ocell.css("font-size", "30px");
                        game.userMines--;
                    } else {
                        ocell.text("🚩");
                        ocell.css("font-size", "18px");
                        game.userMines++;
                    }
                    cell.flagged = !cell.flagged;
                    updateMinesCounter();
                    e.preventDefault();
                    return;
                }

                if(e.which == buttons.left && cell.flagged) {
                    $("#restart").text("😮");
                    return;
                }

                reveal(cell);

                if(cell.mine) {
                    game.state = states.lost;
                    stopTimer();
                    gameOver("<h1>💥</h1>You Lose!");
                    ocell.css("background-color", "red");
                    cells.forEach(c => {
                        c.off("mousedown");
                        if(c.mine) {
                            if(!c.flagged) {
                                c.text("💣");
                                c.addClass("reveal");
                                c.css("font-size", "18px");
                            }
                        } else if(c.flagged) {
                            c.text("❌");
                        }
                    });
                } else {
                    $("#restart").text("😮");
                    if(cell.mines > 0) {
                        showMinesCount(cell);
                    } else {
                        revealEmpty(cell);
                    }
                    const t = cells.filter(c => c.revealed).length + cells.filter(c => c.mine).length;
                    if(t == cells.length) {
                        game.userMines = game.totalMines;
                        game.state = states.won;
                        stopTimer();
                        gameOver("<h1>🏆</h1>You Win!");
                        cells.forEach(c => {
                            c.off("mousedown");
                            if(c.mine) {
                                c.text("🚩");
                                c.css("font-size", "18px");
                            }
                        });
                    }
                }
            });

            cell.mouseup(() => {
                switch(game.state) {
                    case states.playing:
                        $("#restart").text("🙂");
                        break;
                    case states.lost:
                        $("#restart").text("😟");
                        break;
                    case states.won:
                        $("#restart").text("😎");
                        break;
                }
            });

            cell.x = x;
            cell.y = y;
            cell.mine = false;
            cell.flagged = false;
            cell.revealed = false;
            cells.push(cell);
            row.append(cell);
        }
        board.append(row);
    }
}

function gameOver(text) {
    $(".game-over").html(text);
    $(".game-over").css({
        "opacity": "1",
        "z-index": "1"
    });
    window.setTimeout(() => $(".game-over").css("opacity", "0"), 3000);
}

function startTimer() {
    updateTimer();
    timer = window.setInterval(() => updateTimer(), 1000);
}

function stopTimer() {
    if(timer != null) {
        window.clearInterval(timer);
        updateTimer();
        updateMinesCounter();
        timer = null;
    }
}

function revealEmpty(cell) {
    if(cell.flagged) return;
    reveal(cell);

    const up = canMove(cell, 0, -1);
    const rt = canMove(cell, 1, 0);
    const dn = canMove(cell, 0, 1);
    const lt = canMove(cell, -1, 0);
    if(up && rt) canMove(cell, 1, -1);
    if(rt && dn) canMove(cell, 1, 1);
    if(dn && lt) canMove(cell, -1, 1);
    if(lt && up) canMove(cell, -1, -1);

    queue.forEach(c => {
        if(c.mines == 0) {
            if(!c.processed) {
                c.processed = true;
                revealEmpty(c);
            }
        } else if(!c.flagged) {
            reveal(c);
            showMinesCount(c);
        }
    });

    queue.splice(0, queue.length);
}

function canMove(cell, x, y) {
    if(cell.x + x >= 0 && cell.x + x < game.w && cell.y + y >= 0 && cell.y + y < game.h) {
        const c = cells[cell.x + x + (cell.y + y) * game.w];
        if(!queue.includes(c)) queue.push(c);
        return true;
    } else {
        return false;
    }
}

function clearCellsStates() {
    for(let i = 0; i < cells.length; i++) {
        cells[i].flagged = false;
        cells[i].processed = false;
        cells[i].revealed = false;
    }
}

function showMinesCount(cell) {
    cell.text(cell.mines);
    cell.addClass(classes[cell.mines - 1]);
}

function reveal(cell) {
    if(cell.revealed) return;
    cell.addClass("reveal");
    cell.off("mousedown");
    cell.revealed = true;
}

function countSurroundingMines(cell) {
    let mines = 0;
    for(let y = -1; y <= 1; y++) {
        for(let x = -1; x <= 1; x++) {
            const i = cell.x + x;
            const j = cell.y + y;
            if(i >= 0 && i < game.w && j >= 0 && j < game.h) {
                const n = cells[i + j * game.w];
                if(n.mine) mines++;
            }
        }
    }
    return mines;
}

function setMines(ex, minesCount) {
    // cells[c + r * w].mine;
    // cells[4 + 2 * game.w].mine = true;
    // cells[8 + 4 * game.w].mine = true;
    // cells[5 + 6 * game.w].mine = true;
    // cells[8 + 2 * game.w].mine = true;
    // cells[5 + 3 * game.w].mine = true;
    // cells[7 + 3 * game.w].mine = true;
    // cells[5 + 5 * game.w].mine = true;
    // cells[6 + 5 * game.w].mine = true;
    // cells[7 + 6 * game.w].mine = true;
    // cells[2 + 7 * game.w].mine = true;

    const randomCells = window.crypto.getRandomValues(new Uint8Array(minesCount));
    for(let i = 0; i < randomCells.length; i++) {
        const cell = cells[Math.floor(Math.random() * cells.length)];
        cell.mine = true;
    }

    for(let i = 0; i < cells.length; i++) {
        cells[i].mines = countSurroundingMines(cells[i]);
    }
}

function updateMinesCounter() {
    let t = game.totalMines - game.userMines;
    if(t >= 0) {
        t = Math.min(999, t);
        t = t.toString().padStart(3, "0")
    } else {
        t = Math.min(99, Math.abs(t));
        t = '-' + t.toString().padStart(2, "0")
    }
    $("#mines").text(t);
}

function updateTimer() {
    const s = Math.min(999, seconds++);
    $("#timer").text(s.toString().padStart(3, "0"));
}

function setGameLevel(level) {
    $(".user").css("display", "none");

    switch(level.value) {
        case "0":
            game.w = 9;
            game.h = 9;
            game.totalMines = 10;
            break;
        case "1":
            game.w = 16;
            game.h = 16;
            game.totalMines = 40;
            break;
        case "2":
            game.w = 30;
            game.h = 16;
            game.totalMines = 99;
            break;
        case "3":
            $(".user").css("display", "unset");
            $("#userWidth").val(game.w);
            $("#userHeight").val(game.h);
            $("#userMines").val(game.totalMines);
            break;
    }
    restart();
}

function setUserSettings() {
    game.w = $("#userWidth").val();
    game.h = $("#userHeight").val();
    game.totalMines = $("#userMines").val();

    if(game.totalMines >= 0.80 * game.w * game.h) {
        alert("Too many mines!");
        return;
    }

    restart();
}