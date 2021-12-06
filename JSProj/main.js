// For A3 paper size:
// At 300 ppi (pixels per inch) the image needs to be 3508 x 4961 pixels
const A3_RATIO = 1.4141961231
const GOLDEN_RATIO = 1.618

const WIDTH = 500
const HEIGHT = WIDTH * A3_RATIO
console.log('WIDTH: ' + WIDTH + 'HEIGHT: ' + HEIGHT)

const TIMESTAMP = Date.now();
const SEED = TIMESTAMP
const POPULATION = 1000
const Y_START = HEIGHT
const Y_GOAL = HEIGHT * 0.33
console.log('Y_GOAL: ' + Y_GOAL)
// Stalks have until GROWTH_STEPS to make it into the end zone
const GROWTH_STEPS = 50

// Returns the heading (degrees or radians) given start and end vectors
function getHeading(vector1, vector2) {
  return vector1.sub(vector2).heading()
}

function dot(v) {
  push()
  stroke(0)
  strokeWeight(8)
  point(v.x, v.y)
  textSize(9)
  strokeWeight(0.5)
  text(`(${v.x.toFixed(1)}, ${v.y.toFixed(1)})`, v.x + 5, v.y - 3)
  pop()
}

function bline(v1, v2) {
  push()
  stroke(0)
  strokeWeight(2)
  line(v1.x, v1.y, v2.x, v2.y)
  pop()
}


class Stalk {
  constructor(x, y) {
    this.x = x
    this.y = y
    this.angleStdDev = random(0, 45)
    this.length = random(2, 20)

    this.fit = false
  }

  getAngleStdDev() { return this.angleStdDev }
  getLength() { return this.length }

  getFit() { return this.fit }
  setFit(tf) {
    this.fit = tf ? true : false
  }

  nextAngle() {
    // return -92
    return randomGaussian(-90, this.getAngleStdDev())
  }

  static reachedGoal(x, y) {
    if (y > 0 && y < Y_GOAL && x > 0 && x < WIDTH)
      return true
    return false
  }

  // Draw runs the simulation at the same time
  draw(iterations) {
    const tf = new Transformer()
    tf.push()
    tf.translate(this.x, this.y)

    for (let i = 0; i < iterations; i++) {
      let v1 = createVector(0, 0)
      let a = this.nextAngle()
      let v2 = createVector(cos(a) * this.length, sin(a) * this.length)
      // dot(v2)
      // bline(v1, v2)
      line(v1.x, v1.y, v2.x, v2.y)
      tf.translate(v2.x, v2.y)
      tf.rotate(90 + a)

      if (Stalk.reachedGoal(tf.x, tf.y)) {
        this.setFit(true)
      }
    }

    tf.pop()
  }

  static mate(stalk1, stalk2) {
    
  }

  // Returns a new Stalk instance derived from the parameter Stalk
  static mutate(stalk) {

  }

}

function drawGoal() {
  push()
  fill(color(0, 100, 100, 0.35))
  noStroke()
  rect(0, 0, width, Y_GOAL)
  pop()
}


function setup() {
  OUTPUT_SVG = false
  SAVE_OUTPUT = true
  TITLE = 'GAOne'

  if (OUTPUT_SVG) {
    createCanvas(WIDTH, HEIGHT, SVG);
    console.log('Output mode: SVG')
  } else {
    createCanvas(WIDTH, HEIGHT);
    console.log('Output mode: PNG')
  }

  const pixelD = pixelDensity()
  pixelDensity(pixelD)
  // Max values for HSB: (360, 100, 100, 1.0)
  colorMode(HSB)
  angleMode(DEGREES)
}


function draw() {
  const palette = [color(40, 7, 100), // floral white
                   color(248, 27, 35)] // independence
  background(palette[0])
  stroke(palette[1])
  strokeWeight(1)

  const xSpread = WIDTH / POPULATION

  randomSeed(SEED)
  stalks = []

  drawGoal()


  // Create initial population
  for (let i = 0; i < POPULATION; i++) {
    stalks[i] = new Stalk(i * xSpread, Y_START)
  }

  // Draw / eval population
  for (let i = 0; i < POPULATION; i++) {
    stalks[i].draw(GROWTH_STEPS)
  }

  // Get fit population
  const fitStalks = stalks.filter(stalk => stalk.getFit())
  console.log("Fit pop: " + fitStalks.length)




  if (SAVE_OUTPUT) {
    const basename = TITLE + ':' + TIMESTAMP + ':' + SEED

    if (OUTPUT_SVG)
      save(basename + '.svg');
    else
      save(basename + '.png');
  }

  noLoop()
}