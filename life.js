var SVG_SIZE = 500;
var CELL_SIZE = 5;
var CELLS_PER_ROW = CELLS_PER_COL = SVG_SIZE / CELL_SIZE;
var ALIVE_RATIO = .5;
var PREDATOR_RATIO = .5;

var drawInterval = null;

$(document).ready(function() {
  $('#Container').append('<svg height="' + SVG_SIZE + '" width="' + SVG_SIZE + '"></svg>')
  drawInterval = setInterval(makeStep, 250);
})
function setSpeed() {
  clearInterval(drawInterval);
  drawInterval = setInterval(makeStep, $('#Speed').val());
}

var populations = [{
  name: "predator",
  color: "red",
}, {
  name: "prey",
  color: "green",
}];

function choosePopulation() {
  var rand = Math.random();
  if (rand < PREDATOR_RATIO) return populations[0];
  else return populations[1];
}

var cells = [];
for (var i = 0; i < CELLS_PER_ROW; ++i) {
  var row = [];
  cells.push(row)
  for (var j = 0; j < CELLS_PER_ROW; ++j) {
    population = choosePopulation();
    row.push({on: Math.random() < ALIVE_RATIO ? true : false, population: population})
    var cellID = i + ':' + j;
    var xLoc = i * CELL_SIZE;
    var yLoc = j * CELL_SIZE;
  }
}

function drawCells() {
  $('svg').html('')
  var newContent = '';
  cells.forEach(function(row, rowIdx) {
    row.forEach(function(cell, colIdx) {
      if (cell.on) {
        xLoc = colIdx * CELL_SIZE;
        yLoc = rowIdx * CELL_SIZE;
        newContent += '<rect x="' + xLoc +
            '" y="' + yLoc +
            '" width="' + CELL_SIZE +
            '" height="' + CELL_SIZE +
            '" fill="' + cell.population.color +
            '"></rect>';
      }
    })
  })
  $('svg').html(newContent);
}
drawCells();

function countNeighbors(row, col) {
  var prevRow = row - 1;
  var nextRow = row + 1;
  var prevCol = col - 1;
  var nextCol = col + 1;
  if (prevRow === -1) prevRow = cells.length - 1;
  if (prevCol === -1) prevCol = cells[0].length - 1;
  if (nextRow === cells.length) nextRow = 0;
  if (nextCol === cells[0].length) nextCol = 0;
  targets = [
    [prevRow, prevCol],
    [prevRow, col],
    [prevRow, nextCol],
    [row, prevCol],
    [row, nextCol],
    [nextRow, prevCol],
    [nextRow, col],
    [nextRow, nextCol],
  ]
  return targets.map(function(indicies) {
    return cells[indicies[0]][indicies[1]];
  }).reduce(function(val, cell) {
    if (cell.on) {
      val[cell.population.name]++;
    }
    return val;
  }, {predator: 0, prey: 0});
}

function makeStep() {
  killCells();
  makeCells();
}

function killCells() {
  counts = cells.map(function(row, rowIdx) {
    return row.map(function(cell, colIdx) {
      return countNeighbors(rowIdx, colIdx);
    })
  })
  cells.forEach(function(row, rowIdx) {
    row.forEach(function(cell, colIdx) {
      var neighbors = counts[rowIdx][colIdx];
      if (cell.on) {
        if (cell.population.name === 'prey') {
          if (neighbors.predator > 0) {
            cell.on = false;
          }
        } else if (cell.population.name === 'predator') {
          if (neighbors.predator === 0 || neighbors.predator > 3 || neighbors.prey < 1) {
            cell.on = false;
          }
        }
      }
    })
  })
}

function makeCells() {
  counts = cells.map(function(row, rowIdx) {
    return row.map(function(cell, colIdx) {
      return countNeighbors(rowIdx, colIdx);
    })
  })
  cells.forEach(function(row, rowIdx) {
    row.forEach(function(cell, colIdx) {
      var neighbors = counts[rowIdx][colIdx];
      if (!cell.on) {
        if (neighbors.predator === 2 || neighbors.predator === 3) {
          cell.on = true;
          cell.population = populations[0];
        } else if (neighbors.prey >= 2) {
          cell.on = true;
          cell.population = populations[1];
        }
      }
    })
  })
  drawCells();
}


