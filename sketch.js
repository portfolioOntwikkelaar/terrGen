const numBoxes = 50;
const sideLength = 10;

const minHeight = 1;
const maxHeight = 150;

const noiseOffset = 120;
const noiseScale = 0.009;
const timeScale = 0.0006;
const rotateScale = 0.0009

let seaLevel = 0.5;
const rockLevel = 0.25
const sandLevel = 0.5;
const treeLevel = 0.65;

const rockColour = "#62718E";
const sandColour = "#D4A463";
const grassColour = "#90A944";
const forestColour = "#6D973E";
const seaColour = "#1098A688";
const seaColourSolid = "#1098A6";
const trunkColour = "#886622";
const leafColour = "#468343";

let cam;

let heightScale = 1;
let heightDir = 0.05;

function setup() {
  createCanvas(1300, 700, WEBGL);

  // Calculate camera position
  cam = createCamera();
  const camHeight = -numBoxes * sideLength * 0.8;
  const orbitRad = numBoxes * sideLength * 1.2;
  cam.setPosition(0, camHeight, orbitRad);
  cam.lookAt(0, 0, 0);

  noStroke();
}

function draw() {
  background(220);

  const t = millis();

  // Update heightScale
  heightScale = constrain(heightScale + heightDir, 0, 1);

  // Update rotational view
  rotateY(-t * rotateScale);

  
  ambientLight(150, 150, 150);
  directionalLight(200, 200, 200, -1, 0.75, -1);

  drawTerrain(t);
}

function keyReleased() {
  // Flip height animation direction
  if(key === "h") {
    heightDir *= -1;
  }
}

function drawTerrain(t) {
  for(let i = 0; i < numBoxes; i ++) {
    for(let j = 0; j < numBoxes; j ++) {
      const x = (i * sideLength) - (numBoxes * sideLength)/2;
      const z = (j * sideLength) - (numBoxes * sideLength)/2;

      drawBox(x, z, t);
    }
  }

  // Only draw sea if we're NOT in 2D mode
  if(heightScale != 0) {
    push();
    const waterHeight = getBoxHeight(seaLevel);

    // Make the water slightly less than the full width
    // to prevent clipping/flickering
    const waterSize = numBoxes * sideLength - 0.1;
    fill(seaColour);

    translate(-sideLength/2, -waterHeight/2, -sideLength/2);
    box(waterSize, getBoxHeight(seaLevel), waterSize);
    pop();
  }
}


function drawBox(x, z, t) {
  const noiseValue = getNoiseValue(x, z, t);
  let h = getBoxHeight(noiseValue);

  // Boxes don't like having 0 height
  // So if we're in 2D, make the height not 0
  // and draw some VERY flat boxes!
  h = max(h, 0.01);

  push();
  translate(x, -h/2, z);
  fill(getColour(noiseValue));

  box(sideLength, h, sideLength);

  // Only draw trees if we're NOT in 2D mode
  if(noiseValue >= treeLevel && heightScale > 0) {
    drawTree(h);
  }

  pop();
}

function drawTree(h) {
  const trunkLength = 10;
  const leafLength = 10;

  push();

  translate(0, -h/2, 0);

  //trunk
  fill(trunkColour);
  translate(0, -trunkLength/2, 0);
  box(trunkLength/4, trunkLength, trunkLength/4);

  //leaves
  fill(leafColour);
  translate(0, -trunkLength/2 - leafLength/2, 0);
  box(leafLength * 3/4, leafLength, leafLength * 3/4);
  translate(0, -leafLength * 3/4, 0);
  box(leafLength/4);


  pop();
}

function getNoiseValue(x, z, time) {
  x = x * noiseScale + noiseOffset;
  z = z * noiseScale + noiseOffset;
  time = time * timeScale + noiseOffset;
  return noise(x, z, time);
}

function getBoxHeight(noiseValue) {
  return map(noiseValue, 0, 1, minHeight, maxHeight) * heightScale;
}

function getColour(noiseValue) {
  // If we're in 2D mode, use the sea level
  // In 3/4D mode, this gets drawn as a seperate box
  if(noiseValue < seaLevel && heightScale == 0) {
    return seaColour;
  }

  if(noiseValue < rockLevel) {
    return rockColour
  } else if(noiseValue < sandLevel) {
    return sandColour;
  } else {
    const lerpVal = map(noiseValue, sandLevel, treeLevel, 0, 1);
    return lerpColor(color(grassColour), color(forestColour), lerpVal);
  }
}
