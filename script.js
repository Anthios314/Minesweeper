let mineGrid; 
let gameHasEnded = false;
let gridRows = 10;
let gridCols = 10;
let unflaggedMines = 1000;
let runningSolver;

class Tile {
    constructor (data) { // Data contains x, y, and isMine. 
        this.x = data.x;
        this.y = data.y;
        this.isMine = data.isMine;
        this.isFlagged = false;
        this.uncovered = false;
    }
}

class MineArray {
    constructor (data) { // Data contains rows, cols, and minesTotal
        this.rows = data.rows;
        this.cols = data.cols;
        this.minesTotal = data.minesTotal;

        this.minesLeft = data.minesTotal; // The number of mines that have yet to be uncovered.
        this.tilesLeft = this.rows * this.cols; // The number of tiles in the board. May be used for "mine-free tiles remaining".

        this.tileData = [];

        let minesToGenerate = data.minesTotal;
        let tilesToGenerate = this.rows * this.cols;
        let isMine = false;
        for (let i = 0; i < data.rows; i++) {
            this.tileData[i] = [];
            for (let j = 0; j < data.cols; j++) {
                isMine = (Math.random() < minesToGenerate / tilesToGenerate);
                this.tileData[i][j] = new Tile({ // Generates a tile at a specific cordinate that may or may not have a mine. 
                    x: i,
                    y: j,
                    isMine: isMine,
                })
                tilesToGenerate--;
                if (isMine) minesToGenerate--;
            }
        }
    }
    
    isMine(x, y) { // Tell if a tile contains a mine. 
        return (x >= 0 &&  // These prechecks make sure that the tile being tested is actually a tile. This prevents errors. 
            y >= 0 && 
            x < this.rows && 
            y < this.cols && 
            this.tileData[x][y].isMine
        );
    }

    isFlagged(x, y) { // Tell if a tile is flagged.
        return (x >= 0 && 
            y >= 0 && 
            x < this.rows && 
            y < this.cols && 
            this.tileData[x][y].isFlagged
        );
    }

    minesNear(x, y) { // Tell all the mines near a specific tile. 
        let xInt = parseInt(x);
        let yInt = parseInt(y);
        let nearbyMines = 0;
        if (this.isMine(xInt+1, yInt+1)) nearbyMines++; // Love to know if there's a better way to do this. 
        if (this.isMine(xInt+1, yInt  )) nearbyMines++;
        if (this.isMine(xInt+1, yInt-1)) nearbyMines++;

        if (this.isMine(xInt-1, yInt+1)) nearbyMines++;
        if (this.isMine(xInt-1, yInt  )) nearbyMines++;
        if (this.isMine(xInt-1, yInt-1)) nearbyMines++;

        if (this.isMine(xInt  , yInt+1)) nearbyMines++;
        if (this.isMine(xInt  , yInt-1)) nearbyMines++;

        return nearbyMines;
    }

    flagsNear(x, y) {
        let xInt = parseInt(x);
        let yInt = parseInt(y);
        let nearbyFlags = 0;
        if (this.isFlagged(xInt+1, yInt+1)) nearbyFlags++;
        if (this.isFlagged(xInt+1, yInt  )) nearbyFlags++;
        if (this.isFlagged(xInt+1, yInt-1)) nearbyFlags++;

        if (this.isFlagged(xInt-1, yInt+1)) nearbyFlags++;
        if (this.isFlagged(xInt-1, yInt  )) nearbyFlags++;
        if (this.isFlagged(xInt-1, yInt-1)) nearbyFlags++;

        if (this.isFlagged(xInt  , yInt+1)) nearbyFlags++;
        if (this.isFlagged(xInt  , yInt-1)) nearbyFlags++;

        return nearbyFlags;
    }

    isFullyFlagged(x, y) {
        return (this.flagsNear(x,y) === this.minesNear(x,y) && this.minesNear(x,y) !== 0);
    }

    HTMLForTile(x, y) {
        if (gameHasEnded && this.isMine(x, y)) {
            return `<div 
            id="tile-${x}-${y}" 
            class="tile uncovered">
            X</div>`
        }
        if (this.isMine(x, y)) {
            return `<div 
            id="tile-${x}-${y}" 
            class="tile covered"
            onclick="endGame()"
            oncontextmenu="flagTile(${x},${y})">
            </div>`
        }
        return `<div 
        id="tile-${x}-${y}" 
        class="tile covered"
        onclick="uncoverTile(${x},${y})"
        oncontextmenu="flagTile(${x},${y})">
        </div>`
    }

    isCovered(x, y) {
        return (x >= 0 && 
            y >= 0 && 
            x < this.rows && 
            y < this.cols && 
            !this.tileData[x][y].uncovered
        );
    }

    coveredNear(x, y) {
        let xInt = parseInt(x);
        let yInt = parseInt(y);
        let nearByUncovered = 0;
        if (this.isCovered(xInt+1, yInt+1)) nearByUncovered++;
        if (this.isCovered(xInt+1, yInt  )) nearByUncovered++;
        if (this.isCovered(xInt+1, yInt-1)) nearByUncovered++;

        if (this.isCovered(xInt-1, yInt+1)) nearByUncovered++;
        if (this.isCovered(xInt-1, yInt  )) nearByUncovered++;
        if (this.isCovered(xInt-1, yInt-1)) nearByUncovered++;

        if (this.isCovered(xInt  , yInt+1)) nearByUncovered++;
        if (this.isCovered(xInt  , yInt-1)) nearByUncovered++;

        return nearByUncovered;
    }
}





function generateGridFromInput() {// Takes the input data and creates a milefield. 
    let start = Date.now()
    try {
    generateGrid(
        document.getElementById("cols").value,
        document.getElementById("rows").value,
        document.getElementById("mines").value,
    );
    } catch (e) {
        console.log(e)
        alert(e.message);
    }
    console.log(`Operation took ${Date.now() - start} ms.`)
}

function generateGrid(cols, rows, mines) { // Function that generates a 2D minesweeper board given rows, columns, and mines. 
    gameHasEnded = false
    if (mines > cols * rows) {
        alert("Error: you are trying to generate a minefield with more mines than the field can contain.");
        return;
    }
    mineGrid = new MineArray({
        rows: rows,
        cols: cols,
        minesTotal: mines,
    })

    displayGrid(mineGrid);
    console.clear();
    let i = 0, j = 0;
    while (mineGrid.minesNear(j, i) !== 0 || mineGrid.isMine(j, i)) {
        // console.log(`position (${i},${j}) was${mineGrid.isMine(j, i) ? "" : " not"} a mine and had ${mineGrid.minesNear(j, i)} mines nearby.`);
        i++;
        if (i == mineGrid.rows) {
            i = 0;
            j++;
        }
        if (j == mineGrid.cols) {
            window.alert("Notice: there are no 0 tiles on your board.");
            break;
        }
    }
    uncoverTile(j, i, false);
    console.log(`chose tile (${i},${j})`);
}

function displayGrid(matrix) {
    document.getElementById("array").innerHTML = "";
    let string = "";
    for (let i in matrix.tileData) {
        string += `<div id="row-${i}" class="mine-row">`
        for (let j in matrix.tileData[i]) {
            string += matrix.HTMLForTile(i,j)
        }
        string += "</div>";
    }
    document.getElementById("array").innerHTML = string;
    [...document.querySelectorAll(".tile")].forEach( el => 
        el.addEventListener('contextmenu', e => e.preventDefault())
    );
    document.getElementById("minesRemaining").innerText = mineGrid.minesLeft;
}

function uncoverTile(x, y, auto = false) { // Uncovers a tile.
    if (gameHasEnded || x >= mineGrid.rows || x < 0 || y >= mineGrid.cols || y < 0) return false;

    let tileData = mineGrid.tileData[x][y];
    if (tileData.isFlagged) return false;

    if (tileData.uncovered) {
        if (!auto && mineGrid.isFullyFlagged(x,y)) {
            uncoverTile(x+1, y+1, true);
            uncoverTile(x+1, y  , true);
            uncoverTile(x+1, y-1, true);
            
            uncoverTile(x-1, y+1, true);
            uncoverTile(x-1, y  , true);
            uncoverTile(x-1, y-1, true);
            
            uncoverTile(x, y+1, true);
            uncoverTile(x, y-1, true);

        } else return false;
    }

    if (tileData.isMine) {
        endGame();
        return false;
    }
    tileData.uncovered = true;

    
    let tile = document.getElementById(`tile-${x}-${y}`);
    tile.classList.add("uncovered");
    tile.classList.remove("covered");
    tile.innerText = mineGrid.minesNear(x, y);

    if (mineGrid.minesNear(x, y) === 0) {
        tile.classList.add("no-mines");

        uncoverTile(x+1, y+1, true);
        uncoverTile(x+1, y  , true);
        uncoverTile(x+1, y-1, true);
        
        uncoverTile(x-1, y+1, true);
        uncoverTile(x-1, y  , true);
        uncoverTile(x-1, y-1, true);
        
        uncoverTile(x, y+1, true);
        uncoverTile(x, y-1, true);

    }
    return false;
}

function flagTile(x,y, auto = false) { // Flags or unflags a tile. 
    if (gameHasEnded) return true; // Game over.
    if (x < 0 || y < 0 || x >= mineGrid.rows || y >= mineGrid.cols) return false;

    let tileData = mineGrid.tileData[x][y];
    if (tileData.uncovered) return false; // Can't flag an uncovered tile.

    let tileEl = document.getElementById(`tile-${x}-${y}`);

    if (tileData.isFlagged && !auto) {
        tileEl.classList.remove("flagged");
        tileEl.innerHTML = mineGrid.minesNear(x,y);
        tileData.isFlagged = false;
        mineGrid.minesLeft++;
    } else {
        if (tileData.isFlagged) return;
        tileEl.classList.add("flagged");
        tileEl.innerHTML = "&#128681"; // 🚩 <-- Goal
        tileData.isFlagged = true;
        mineGrid.minesLeft--;
    }
    document.getElementById("minesRemaining").innerText = mineGrid.minesLeft;
    return false;
}

function endGame() {
    gameHasEnded = true;
    console.log()
    let element;
    for (i in mineGrid.tileData) {
        for (j in mineGrid.tileData[i]) {
            if (!mineGrid.tileData[i][j].isMine) continue;
            element = document.getElementById(`tile-${i}-${j}`);
            if (!mineGrid.tileData[i][j].isFlagged) element.classList.add("mine");
            element.classList.remove("covered");
            element.innerHTML = "&#128163;"; // 💣 <-- Goal
        }
    }
}

function toggleMonkeMode() {
    if (document.getElementById("solverBox").value) {
        runningSolver = setInterval(solve, 500);
    } else {
        clearInterval(runningSolver);
    }
}


function solve() {
    let date = Date.now()
    for (let x = 0; x < mineGrid.rows; x++) {
        for (let y = 0; y < mineGrid.cols; y++) {
            if (mineGrid.tileData[x][y].isFlagged || !mineGrid.tileData[x][y].uncovered) continue;
            //console.log(`${x}, ${y}`)
            if (mineGrid.isFullyFlagged(x, y)) {
                uncoverTile(x+1, y+1, true);
                uncoverTile(x+1, y  , true);
                uncoverTile(x+1, y-1, true);
                
                uncoverTile(x-1, y+1, true);
                uncoverTile(x-1, y  , true);
                uncoverTile(x-1, y-1, true);
                
                uncoverTile(x, y+1, true);
                uncoverTile(x, y-1, true);
            }
            if (mineGrid.coveredNear(x, y) == mineGrid.minesNear(x, y)) {
                flagTile(x+1, y+1, true);
                flagTile(x+1, y  , true);
                flagTile(x+1, y-1, true);
                
                flagTile(x-1, y+1, true);
                flagTile(x-1, y  , true);
                flagTile(x-1, y-1, true);
                
                flagTile(x, y+1, true);
                flagTile(x, y-1, true);
            }
        }
    }
    return `${Date.now() - date}ms`
}