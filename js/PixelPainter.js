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
  COLORS: 'color-box'
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
var changes = '';
var saved;

// iife that creates basic framing
var mainContainer = (function() {
  var outerFrame = document.createElement('div');
  outerFrame.className = 'outer-frame';

  var controlPanel = document.createElement('div');
  controlPanel.className = 'control';
  outerFrame.appendChild(controlPanel);

  var title = document.createElement('div');
  title.className = 'pane';
  var titleText = document.createElement('div');
  titleText.className = 'title-text';
  titleText.innerHTML = '<span>eggs-PAINT</span><br><span style="font-size:14px;">Sponsored by HowToBasic</span>';
  title.appendChild(titleText);
  controlPanel.appendChild(title);

  var sizer = document.createElement('div');
  sizer.className = 'pane';
  var sizerText = document.createElement('div');
  sizerText.className = 'sizer-text';
  sizerText.innerText = 'Size';
  sizer.appendChild(sizerText);
  var sizeBar = document.createElement('div');
  sizeBar.className = 'size-bar';
  sizeBar.innerHTML = "<span>brush size</span><br><input type=\"range\" id=\"myRange\" value=\"90\"><br><span>pixel size</span><br><input type=\"range\" id=\"myRange\" value=\"20\">";
  sizer.appendChild(sizeBar);
  controlPanel.appendChild(sizer);

  var palette = document.createElement('div');
  palette.className = 'pane';
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

  document.body.appendChild(outerFrame);

  return {
    outerFrame: outerFrame,
    controlPanel: controlPanel,
    palette: palette,
    buttons: buttons,
    grid: grid,
    paintGrid: paintGrid
  };
});

// run and assign to variable named 'page'
var page = mainContainer();

//buttons
var createButtons = (function() {
  var buttonErase = document.createElement("div");
  buttonErase.className = "button-erase";
  buttonErase.innerText = "Erase";

  var buttonClear = document.createElement("div");
  buttonClear.className = "button-clear";
  buttonClear.innerText = "Clear";

  var buttonSave = document.createElement("div");
  buttonSave.className = "button-save";
  buttonSave.innerText = "Save";

  var buttonLoad = document.createElement("div");
  buttonLoad.className = "button-load";
  buttonLoad.innerText = "Load";

  page.buttons.appendChild(buttonErase);
  page.buttons.appendChild(buttonClear);
  page.buttons.appendChild(buttonSave);
  page.buttons.appendChild(buttonLoad);
});

toolButtons = createButtons();

// generate palette grid
var generatePaletteGrid = (function() {
  var colorPaletteName = document.createElement("div");
  colorPaletteName.innerText = "Colors";
  colorPaletteName.className = "palette-name";
  page.palette.appendChild(colorPaletteName);
  var colorPalette = document.createElement("div");
  colorPalette.appendChild(colorPaletteName);
  var colorBox;
  var colorArr = ["#ff0000", "#ff6a00", "#ffaa00", "#fff200", "#2eff00", "#339933", "#3399ff", "#0050f2", "#ff66cc", "#9966ff","#b5b5b5", "#000000"];

  for(var i = ZERO; i < colorArr.length; i++){
    colorBox = document.createElement("div");
    colorBox.className = 'color-box';
    colorBox.style.backgroundColor = colorArr[i];
    colorPalette.appendChild(colorBox);
  }

  colorPalette.className = 'color-palette';
  page.palette.appendChild(colorPalette);

  return colorPalette;
});

colorPalette = generatePaletteGrid();

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
    page.paintGrid.style.width = (width * 10) + 'px';
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
    if(currentHeight !== height && currentWidth !== width) {
      _makeNewRow();
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
        _makeNewColumn((currentWidth + ONE), width, rowNum, false); // add new columns
      }else{ // for new rows
        canvas.push([]);
        _makeNewColumn(FIRST, width, rowNum, true);
      }
    }
  }

  // generate columns (cells in each row)
  function _makeNewColumn(startColumnNum, endColumnNum, rowNum, newRow) {
    var notJumped = true;
    var currRow = $(CLASS.SELECTOR + CLASS.ROW + rowNum).item[0];
    for(var columnNum = startColumnNum; columnNum <= endColumnNum; columnNum++) {
      if(!newRow && notJumped) {
        startColumnNum = currentWidth + 1;
        notJumped = false;
      }
      if(newRow) {
        canvas[rowNum - INDEX_OFFSET].push(COLOR.WHITE);
      }
      cell = document.createElement('div');
      cell.className =  CLASS.ROW_INIT + rowNum +
                        CLASS.COLUMN_INIT + columnNum +
                        SPACE + CLASS.PIXELS;
      currRow.appendChild(cell);
    }
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
    render: _render
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
$('.pixels').onEvent(DEVICES.MOUSE, MOUSE.OVER, function() {
  draw(this);
});
$('.pixels').onEvent(DEVICES.MOUSE, MOUSE.DOWN, function() {
  painting = true;
  draw(this);
  painting = false;
});

// draw function
function draw(item) {
  switch(drawMode) {
    case 'trace':
      if(painting) {
        item.style.backgroundColor = foregroundColor;
        savePaintToCanvas(item);
      }
      break;
  }
}

// save to canvas array
function savePaintToCanvas(pixel) {
  var getColumn = false;
  var pixelRow = '';
  var pixelColumn = '';
  var pixelClassName = pixel.className;
  var tempChar;
  pixelClassName = pixelClassName.substr(1);
  for(var i = 0; i < pixelClassName.length; i++) {
    tempChar = pixelClassName.charAt(i);
    if(tempChar === SPACE) {
      i = pixelClassName.length;
    }
    if(tempChar === 'c'){
      getColumn = true;
    }
    if(!getColumn) {
      pixelRow += tempChar;
    }else{
      pixelColumn += tempChar;
    }
  }
  pixelColumn = pixelColumn.substr(1);
  canvas[pixelRow - INDEX_OFFSET][pixelColumn - INDEX_OFFSET] = pixel.style.backgroundColor;
}

// use color palette to select color
$(CLASS.SELECTOR + CLASS.COLORS).onEvent(DEVICES.MOUSE, MOUSE.CLICK, function() {
  foregroundColor = this.style.backgroundColor;
});

// button functions
$(".button-clear").onEvent(DEVICES.MOUSE, MOUSE.CLICK, function() {
  console.log("sanity check");
  for(var i = 0; i < canvas.length; i++) {
    for(var j = 0; j < canvas[0].length; j++) {
      canvas[i][j] = COLOR.WHITE;
    }
  }
  paint.render();
});

$(".button-erase").onEvent(DEVICES.MOUSE, MOUSE.CLICK, function() {
  foregroundColor = COLOR.WHITE;
});

$(".button-save").onEvent(DEVICES.MOUSE, MOUSE.CLICK, function() {
  addChanges(gridHeight);
  addChanges(gridWidth);
  for(var i = 0; i < canvas.length; i++) {
    for(var j = 0; j < canvas[0].length; j++) {
      if(canvas[i][j] !== '#ffffff') {
        addChanges(i + INDEX_OFFSET);
        addChanges(j + INDEX_OFFSET);
        addChanges(canvas[i][j]);
      }
    }
  }
  localStorage.savedCanvas = changes;
});

function addChanges(str) {
  changes += str + '|';
}

$(".button-load").onEvent(DEVICES.MOUSE, MOUSE.CLICK, function() {
  if(localStorage.savedCanvas) {
    //clear first
    for(var r = 0; r < canvas.length; r++) {
      for(var c = 0; c < canvas[0].length; c++) {
        canvas[r][c] = COLOR.WHITE;
      }
    }
    paint.render();
    // load stuff
    saved = localStorage.savedCanvas.split('|');
    var newGridHeight = saved[0] * 1;
    var newGridWidth = saved[1] * 1;
    var i = 2;
    var j = 3;
    var k = 4;
    for(i = 2; i < ((saved.length - 2)); i += 3) {
      canvas[(saved[i] * 1 - INDEX_OFFSET)][(saved[j] * 1 - INDEX_OFFSET)] = saved[k];
      j += 3;
      k += 3;
    }
    paint.importDimensions(newGridHeight, newGridWidth);
    paint.render();
  }else{
    alert("You don't have any saved drawings!");
  }
});