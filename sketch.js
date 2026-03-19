let coffeeImg;
let snackImg;
let designImg;
let phoneImg;
let mealImg;
let faceImg;
let cursorImg;

let state = "daySelect";

let days = ["Mon", "Tue", "Wed", "Thu", "Fri"];
let selectedDay = "";

let dayButtons = [];
let createButton;
let backButton;

let bowl;

let items = [];
let placedItems = [];
let draggingItem = null;
let offsetX = 0;
let offsetY = 0;

let message = "";
let messageTimer = 0;

let recipes = {
  Mon: {
    name: "Monday Mix",
    ingredients: ["coffee", "coffee", "snack", "snack", "design", "design", "phone", "phone", "phone", "meal", "meal"]
  },
  Tue: {
    name: "Tuesday Mix",
    ingredients: ["design", "design", "design", "design", "design", "phone", "meal", "meal"]
  },
  Wed: {
    name: "Wednesday Mix",
    ingredients: ["coffee", "snack", "design", "design", "design", "phone", "meal", "meal"]
  },
  Thu: {
    name: "Thursday Mix",
    ingredients: ["snack", "snack", "design", "design", "meal", "meal"]
  },
  Fri: {
    name: "Friday Mix",
    ingredients: ["coffee", "phone", "phone"]
  }
};

function preload() {
  coffeeImg = loadImage("Coffee.png");
  snackImg = loadImage("Snack.png");
  designImg = loadImage("Design.png");
  phoneImg = loadImage("Phone.png");
  mealImg = loadImage("Meal.png");
  faceImg = loadImage("Face.png");
  cursorImg = loadImage("cursor.png");
}

function setup() {
  createCanvas(1000, 700);
  textFont("Winky Rough");
  textAlign(CENTER, CENTER);
  rectMode(CORNER);
  imageMode(CENTER);
  noCursor();

  for (let i = 0; i < days.length; i++) {
    dayButtons.push({
      label: days[i],
      x: 120 + i * 150,
      y: 280,
      w: 100,
      h: 54
    });
  }

  bowl = {
    x: width / 2,
    y: 430,
    w: 360,
    h: 190
  };

  createButton = {
    x: width - 190,
    y: height - 85,
    w: 140,
    h: 52
  };

  backButton = {
    x: 50,
    y: 50,
    w: 90,
    h: 42
  };

  resetItems();
}

function getItemImage(symbol) {
  if (symbol === "coffee") return coffeeImg;
  if (symbol === "snack") return snackImg;
  if (symbol === "design") return designImg;
  if (symbol === "phone") return phoneImg;
  if (symbol === "meal") return mealImg;
  return null;
}

function resetItems() {
  items = [
    makeItem("coffee", 210, 255),
    makeItem("snack", 360, 255),
    makeItem("design", 510, 255),
    makeItem("phone", 660, 255),
    makeItem("meal", 810, 255)
  ];
  placedItems = [];
}

function makeItem(symbol, x, y) {
  return {
    symbol: symbol,
    img: getItemImage(symbol),
    x: x,
    y: y,
    startX: x,
    startY: y,
    size: 72,
    hoverScale: 1
  };
}

function draw() {
  background(238, 237, 204);

  if (state === "daySelect") {
    drawDaySelectScreen();
  } else if (state === "dragScene") {
    drawDragScene();
  } else if (state === "result") {
    drawResultScreen();
  }

  drawMessage();
  drawCustomCursor();
}

function drawDaySelectScreen() {
  background(66, 140, 68);

  fill(245, 240, 210);
  textStyle(BOLD);
  textSize(42);
  text("DAY MIX", width / 2, 120);

  textStyle(NORMAL);
  textSize(22);
  text("Choose a recipe to recreate Sue’s day", width / 2, 170);

  for (let btn of dayButtons) {
    drawButton(btn.x, btn.y, btn.w, btn.h, btn.label, color(245, 240, 210), color(66, 140, 68));
  }

  fill(66, 140, 68);
  stroke(245, 240, 210);
  strokeWeight(1.2);
  rect(width / 2 - 155, 390, 310, 120, 14);

  noStroke();
  fill(245, 240, 210);
  textAlign(LEFT, TOP);
  textSize(18);
  text("1. Pick a recipe.\n2. Add the decision tokens.\n3. Mix them in the bowl.\n4. Create Sue’s day.", width / 2 - 130, 405);
  textAlign(CENTER, CENTER);
}

function drawDragScene() {
  drawButton(backButton.x, backButton.y, backButton.w, backButton.h, "Back", color(255), color(66, 140, 68));

  fill(66, 140, 68);
  textStyle(BOLD);
  textSize(34);
  text(`Make ${recipes[selectedDay].name}`, width / 2, 58);

  textStyle(NORMAL);
  textSize(18);
  fill(70);
  text("Drag the right ingredients into the bowl", width / 2, 96);

  drawRecipeHint();
  drawBowl();

  for (let item of items) {
    updateItemHover(item);
    drawItem(item);
  }

  drawButton(
    createButton.x,
    createButton.y,
    createButton.w,
    createButton.h,
    "CREATE",
    color(66, 140, 68),
    color(245, 240, 210)
  );
}

function drawRecipeHint() {
  let total = recipes[selectedDay].ingredients.length;

  fill(255, 255, 255, 185);
  stroke(80, 80, 80, 35);
  strokeWeight(1);
  rect(160, 130, 680, 70, 14);

  noStroke();
  fill(60);
  textSize(17);
  text(`${total} ingredients total`, width / 2, 155);
  text("Some repeat — drop at the top of the bowl", width / 2, 182);
}

function drawBowl() {
  fill(219, 212, 183);
  arc(bowl.x, bowl.y, bowl.w, bowl.h, 0, PI, CHORD);

  fill(201, 192, 162);
  arc(bowl.x, bowl.y - 6, bowl.w, 30, PI, 0, CHORD);

  for (let i = 0; i < placedItems.length; i++) {
    let item = placedItems[i];

    if (item.dropOffset > 0) {
      item.dropOffset *= 0.72;
      if (item.dropOffset < 0.5) item.dropOffset = 0;
    }

    if (item.img) {
      image(item.img, item.x, item.y - item.dropOffset, 42, 42);
    }
  }
}

function updateItemHover(item) {
  let targetScale = 1;

  if (draggingItem === item) {
    targetScale = 1.12;
  } else if (dist(mouseX, mouseY, item.x, item.y) < item.size / 2) {
    targetScale = 1.08;
  }

  item.hoverScale = lerp(item.hoverScale, targetScale, 0.18);
}

function drawItem(item) {
  if (item.img) {
    let drawSize = item.size * item.hoverScale;
    image(item.img, item.x, item.y, drawSize, drawSize);
  }
}

function drawResultScreen() {
  fill(66, 140, 68);
  textStyle(BOLD);
  textSize(34);
  text(`${recipes[selectedDay].name} Complete`, width / 2, 80);

  textStyle(NORMAL);
  textSize(20);
  fill(70);
  text("This is Sue’s day.", width / 2, 120);

  if (faceImg) {
    image(faceImg, width / 2, 290, 180, 180);
  }

  let cols = 5;
  let spacingX = 70;
  let spacingY = 58;
  let startX = width / 2 - 140;
  let startY = 430;

  for (let i = 0; i < placedItems.length; i++) {
    let col = i % cols;
    let row = floor(i / cols);
    if (placedItems[i].img) {
      image(placedItems[i].img, startX + col * spacingX, startY + row * spacingY, 42, 42);
    }
  }

  fill(70);
  textSize(17);
  text("Click anywhere to return", width / 2, 645);
}

function mousePressed() {
  if (state === "daySelect") {
    for (let btn of dayButtons) {
      if (isInside(mouseX, mouseY, btn.x, btn.y, btn.w, btn.h)) {
        selectedDay = btn.label;
        resetItems();
        state = "dragScene";
        return;
      }
    }
  } else if (state === "dragScene") {
    if (isInside(mouseX, mouseY, backButton.x, backButton.y, backButton.w, backButton.h)) {
      state = "daySelect";
      selectedDay = "";
      resetItems();
      return;
    }

    if (isInside(mouseX, mouseY, createButton.x, createButton.y, createButton.w, createButton.h)) {
      if (placedItems.length === 0) {
        showMessage("Not today");
      } else if (matchesRecipe()) {
        state = "result";
      } else {
        showMessage("Not today");
      }
      return;
    }

    for (let i = items.length - 1; i >= 0; i--) {
      let item = items[i];
      if (dist(mouseX, mouseY, item.x, item.y) < (item.size * item.hoverScale) / 2) {
        draggingItem = item;
        offsetX = item.x - mouseX;
        offsetY = item.y - mouseY;
        return;
      }
    }
  } else if (state === "result") {
    state = "daySelect";
    selectedDay = "";
    resetItems();
  }
}

function mouseDragged() {
  if (draggingItem) {
    draggingItem.x = mouseX + offsetX;
    draggingItem.y = mouseY + offsetY;
  }
}

function mouseReleased() {
  if (draggingItem) {
    if (isInBowl(draggingItem.x, draggingItem.y)) {
      handleDrop(draggingItem.symbol);
    }

    draggingItem.x = draggingItem.startX;
    draggingItem.y = draggingItem.startY;
    draggingItem = null;
  }
}

function handleDrop(symbol) {
  let target = recipes[selectedDay].ingredients;
  let allowedCount = countSymbol(target, symbol);
  let currentCount = countPlaced(symbol);

  if (allowedCount === 0 || currentCount >= allowedCount) {
    showMessage("Not today");
    return;
  }

  let px = bowl.x - 110 + (placedItems.length % 5) * 52;
  let py = bowl.y - 28 - floor(placedItems.length / 5) * 38;

  placedItems.push({
    symbol: symbol,
    img: getItemImage(symbol),
    x: px,
    y: py,
    dropOffset: 22
  });
}

function countPlaced(symbol) {
  return placedItems.filter(item => item.symbol === symbol).length;
}

function countSymbol(arr, symbol) {
  return arr.filter(s => s === symbol).length;
}

function matchesRecipe() {
  let target = recipes[selectedDay].ingredients;

  if (placedItems.length !== target.length) return false;

  let symbols = ["coffee", "snack", "design", "phone", "meal"];
  for (let s of symbols) {
    if (countPlaced(s) !== countSymbol(target, s)) {
      return false;
    }
  }
  return true;
}

function isInBowl(x, y) {
  return (
    x > bowl.x - bowl.w / 2 + 15 &&
    x < bowl.x + bowl.w / 2 - 15 &&
    y > bowl.y - bowl.h / 2 - 10 &&
    y < bowl.y + 25
  );
}

function isNearBowlTop(x, y) {
  return (
    x > bowl.x - bowl.w / 2 - 10 &&
    x < bowl.x + bowl.w / 2 + 10 &&
    y > bowl.y - 35 &&
    y < bowl.y + 18
  );
}

function isNearAnyItem() {
  for (let item of items) {
    if (dist(mouseX, mouseY, item.x, item.y) < item.size / 2 + 18) {
      return true;
    }
  }
  return false;
}

function drawCustomCursor() {
  if (!cursorImg) return;

  let showTool = false;

  if (state === "dragScene") {
    if (isNearAnyItem() || isNearBowlTop(mouseX, mouseY) || draggingItem) {
      showTool = true;
    }
  }

  if (showTool) {
    push();
    translate(mouseX + 20, mouseY + 12);

    if (mouseIsPressed || draggingItem) {
      rotate(radians(16));
      image(cursorImg, 0, 0, 74, 74);
    } else {
      rotate(radians(8));
      image(cursorImg, 0, 0, 66, 66);
    }

    pop();
  } else {
    push();
    noStroke();
    fill(255, 245, 220, 230);
    circle(mouseX, mouseY, 10);
    pop();
  }
}

function isInside(px, py, x, y, w, h) {
  return px > x && px < x + w && py > y && py < y + h;
}

function drawButton(x, y, w, h, label, bgColor, textColor) {
  fill(bgColor);
  stroke(66, 140, 68);
  strokeWeight(1.2);
  rect(x, y, w, h, 12);

  noStroke();
  fill(textColor);
  textSize(18);
  textStyle(BOLD);
  text(label, x + w / 2, y + h / 2 + 1);
  textStyle(NORMAL);
}

function showMessage(msg) {
  message = msg;
  messageTimer = 90;
}

function drawMessage() {
  if (messageTimer > 0) {
    fill(0, 0, 0, 180);
    noStroke();
    rect(width / 2 - 180, height - 150, 360, 54, 14);

    fill(255);
    textSize(20);
    text(message, width / 2, height - 123);

    messageTimer--;
  }
}