// const (var as substitute before ES6)
var SPACE = ' ';
var FIRST = 1;
var ZERO = 0;
var ONE = 1;
var INDEX_OFFSET = 1;
var CLASS = {
  SELECTOR: '.',
  ROW_INIT: 'r',
  COLUMN_INIT: 'c',
  PIXELS: 'pixels',
  FIRST_CELL: 'r1c1',
  ROW: 'row',
  ROWS: 'rows',
  COLORS: 'colors'
};
var COLOR = {
  BLACK: '#000000',
  WHITE: '#ffffff'
};
var DEVICES = {
  MOUSE: 'mouse',
  KEYBOARD: 'keyboard'
};
var MOUSE = {
  CLICK: 'click',
  DOUBLE_CLICK: 'doubleClick',
  ENTER: 'enter',
  OVER: 'over',
  MOVE: 'move',
  DOWN: 'down',
  UP: 'up',
  RIGHT_CLICK: 'rightClick',
  WHEEL: 'wheel',
  LEAVE: 'leave',
  OUT: 'out',
  SELECT: 'select'
};

// variables
var gridHeight = 75;
var gridWidth = 100;
var foregroundColor = COLOR.BLACK;
var backgroundColor = COLOR.WHITE;
var drawMode = 'trace';
var painting = false;
var canvas = []; // stores color of each pixel

// iife that creates basic framing (automatically invoked)
var page = (function() {
  var outerFrame = document.createElement('div');
  outerFrame.className = 'outer-frame';

  var controlPanel = document.createElement('div');
  controlPanel.className = 'control';
  outerFrame.appendChild(controlPanel);

  var palette = document.createElement('div');
  palette.className = 'palette';
  controlPanel.appendChild(palette);

  var buttons = document.createElement('div');
  buttons.className = 'buttons';
  controlPanel.appendChild(buttons);

  var grid = document.createElement('div');
  grid.className = 'grid';
  outerFrame.appendChild(grid);

  var paintGrid = document.createElement('div');
  paintGrid.className = 'paint-grid';
  grid.appendChild(paintGrid);

  var buttonErase = document.createElement("button");
  buttonErase.className = "button-erase";
  var buttonEraseText = document.createTextNode("Erase");
  buttonErase.appendChild(buttonEraseText);
  buttons.appendChild(buttonErase);

  var buttonClear = document.createElement("button");
  buttonClear.className = "button-clear";
  var buttonClearText = document.createTextNode("Clear");
  buttonClear.appendChild(buttonClearText);
  buttons.appendChild(buttonClear);

  var buttonChange = document.createElement("button");
  buttonChange.className = "button-change";
  var buttonChangeText = document.createTextNode("Change");
  buttonChange.appendChild(buttonChangeText);
  buttons.appendChild(buttonChange);

  document.body.appendChild(outerFrame);

  return {
    outerFrame: outerFrame,
    controlPanel: controlPanel,
    palette: palette,
    buttons: buttons,
    grid: grid,
    paintGrid: paintGrid,
    buttonClear: buttonClear,
    buttonErase: buttonErase
  };
})();

// generate palette grid (automatically invoked)
var generatePaletteGrid = (function() {
  var colors = [["#ff0000", "#ff6a00", "#ffaa00"], ["#fff200", "#2eff00", "#0a7218"], ["#00fff6", "#0050f2", "#cd62ea"], ["#9400ff","#b5b5b5", "#000000"]];
  var paletteContainer = document.createElement("div");
  var rowDiv;
  var columnDiv;
  var columnNum = 3;
  var rowNum = 4;

  for(var i = ZERO; i < rowNum; i++){
    rowDiv = document.createElement("div");
    paletteContainer.appendChild(rowDiv);

    for(var j = ZERO; j < columnNum; j++){
      columnDiv = document.createElement("div");
      columnDiv.className = CLASS.ROW_INIT + (i + INDEX_OFFSET) + CLASS.COLUMN_INIT + (j + INDEX_OFFSET) + SPACE + CLASS.COLORS;
      columnDiv.style.backgroundColor = colors[i][j];
      rowDiv.appendChild(columnDiv);
    }
  }
  page.palette.appendChild(paletteContainer);
})();

// iife that generates paint area
var genPaintGrid = (function() {
  var height;
  var width;
  var row;
  var cell;
  var currentHeight;
  var currentWidth;
  var searchQuery;

  // import dimensions
  function _importDimensions(newHeight, newWidth) {
    height = newHeight;
    width = newWidth;
  }

  // check current canvas size
  function _findCurrentCanvasSize() {
    currentHeight = $('.rows').item.length;
    if(currentHeight === ZERO) {
      currentWidth = ZERO;
    }else{
      currentWidth = $('.rows').item[FIRST - INDEX_OFFSET].childNodes.length;
    }
  }

  // generate grid
  function _render() {
    _findCurrentCanvasSize();
    if(currentHeight < height || currentWidth < width) {
      _makeNewRow();
      _addListeners();
    }else if(currentHeight > height || currentWidth > width){

    }else{
      _renderFromArray();
    }
  }

  // render from array
  function _renderFromArray() {
    for(var rowNum = FIRST; rowNum <= currentHeight; rowNum++) {
      for(var columnNum = FIRST; columnNum <= currentWidth; columnNum++) {
        _grid(rowNum, columnNum).style.backgroundColor = canvas[rowNum - INDEX_OFFSET][columnNum - INDEX_OFFSET];
      }
    }
  }

  // generate rows
  function _makeNewRow() {
    for(var rowNum = FIRST; rowNum <= height; rowNum++) {
      row = document.createElement('div');
      row.className = CLASS.ROW + rowNum + SPACE + CLASS.ROWS;
      page.paintGrid.appendChild(row);
      if(rowNum <= currentHeight) { // for existing rows
        _makeNewColumn((currentWidth + ONE), rowNum); // add new columns
      }else{ // for new rows
        canvas.push([]);
        _makeNewColumn(FIRST, rowNum);
      }
    }
  }

  // generate columns (cells in each row)
  function _makeNewColumn(startColumnNum, rowNum) {
    var currRow = $(CLASS.SELECTOR + CLASS.ROW + rowNum).item[0];
    for(var columnNum = startColumnNum; columnNum <= width; columnNum++) {
      cell = document.createElement('div');
      cell.className =  CLASS.ROW_INIT + rowNum +
                        CLASS.COLUMN_INIT + columnNum +
                        SPACE + CLASS.PIXELS;
      currRow.appendChild(cell);
      canvas[rowNum - INDEX_OFFSET].push(COLOR.WHITE);
    }
  }

  // add event listeners
  function _addListeners() {
    $('.pixels').onEvent(DEVICES.MOUSE, MOUSE.OVER, function() {
      draw(this);
    });
    $('.pixels').onEvent(DEVICES.MOUSE, MOUSE.DOWN, function() {
      painting = true;
      draw(this);
      painting = false;
    });
  }

  // clear everything
  function _clear() {
    _findCurrentCanvasSize();
    for(var rowNum = FIRST; rowNum <= currentHeight; rowNum++) {
      for(var columnNum = FIRST; columnNum <= currentWidth; columnNum++) {
        canvas[rowNum - INDEX_OFFSET][columnNum - INDEX_OFFSET] = COLOR.WHITE;
      }
    }
    _render();
  }

  // grid location selector
  function _grid(row, column) {
    var searchQuery;
    searchQuery = CLASS.SELECTOR + CLASS.ROW_INIT + row + CLASS.COLUMN_INIT + column + SPACE + CLASS.PIXELS;
    return $(searchQuery).item[0];
  }

  return {
    grid: _grid,
    importDimensions: _importDimensions,
    render: _render,
    clear: _clear
  };
});

// run and assign to variable named
var paint = genPaintGrid();
paint.importDimensions(gridHeight, gridWidth);
paint.render();

// trigger draw function
$('.grid').onEvent(DEVICES.MOUSE, MOUSE.DOWN, function() {
  painting = true;
});
$('.grid').onEvent(DEVICES.MOUSE, MOUSE.UP, function() {
  painting = false;
});
$('.grid').onEvent(DEVICES.MOUSE, MOUSE.LEAVE, function() {
  painting = false;
});

// draw function
function draw(pixel) {
  switch(drawMode) {
    case 'trace':
      if(painting) {
        pixel.style.backgroundColor = foregroundColor;
        savePaintToCanvas(pixel);
      }
      break;
  }
}

// save to canvas array
function savePaintToCanvas(pixel) {
  var pixelRow = '';
  var pixelColumn = '';
  var pixelClassName = pixel.className.substr(1);
  var rowFound = false;

  while(pixelClassName !== '') {
    if(_isNum(pixelClassName.charAt(0))) {
      if(rowFound) {
        pixelColumn = pixelColumn + pixelClassName.charAt(0);
      }else{
        pixelRow = pixelRow + pixelClassName.charAt(0);
      }
    }else if(pixelClassName.charAt(0) === 'c') {
      rowFound = true;
    }else {
      pixelClassName = '';
    }
    pixelClassName = pixelClassName.substr(1);
  }

  function _isNum(myChar) {
    switch(myChar) {
      case '1': case '2': case '3': case '4': case '5':
      case '6': case '7': case '8': case '9': case '0':
        return true;
      default:
        return false;
    }
  }

  canvas[pixelRow - INDEX_OFFSET][pixelColumn - INDEX_OFFSET] = pixel.style.backgroundColor;
}

// use color palette to select color
$(CLASS.SELECTOR + CLASS.COLORS).onEvent(DEVICES.MOUSE, MOUSE.CLICK, function() {
  foregroundColor = this.style.backgroundColor;
});

// button functions
$(".button-clear").onEvent(DEVICES.MOUSE, MOUSE.CLICK, function() {
  paint.clear();
});

$(".button-erase").onEvent(DEVICES.MOUSE, MOUSE.CLICK, function() {
  foregroundColor = COLOR.WHITE;
});

function changeIt() {
  paint.importDimensions(150, 150);
  paint.render();
}

$(".button-change").onEvent(DEVICES.MOUSE, MOUSE.CLICK, function() {
  console.log("sanity check");
  changeIt();
});