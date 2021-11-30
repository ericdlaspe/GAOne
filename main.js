// For A3 paper size:
// At 300 ppi (pixels per inch) the image needs to be 3508 x 4961 pixels
const A3_RATIO = 4961 / 3508
const GOLDEN_RATIO = 1.618

const HEIGHT = 500
const WIDTH = HEIGHT * A3_RATIO

const SEED = 209
const POPULATION = 100
const Y_START = WIDTH
const Y_GOAL = HEIGHT * 0.4
// Stalks have until GROWTH_STEPS to make it into the end zone
const GROWTH_STEPS = 1000

// Returns the heading (degrees or radians) given start and end vectors
function getHeading(vector1, vector2) {
  return vector1.sub(vector2).heading()
}


class Stalk {
  constructor(x, y) {
    this.x = x
    this.y = y
    this.angleMin = random(PI, PI + HALF_PI)
    this.angleMax = random(PI + HALF_PI, TWO_PI)
    this.length = randomGaussian(10, 5)

    this.fit = false
  }

  getAngleMin() { return this.angleMin }
  getAngleMax() { return this.angleMax }
  getLength() { return this.length }

  getFit() { return this.fit }
  setFit(tf) {
    this.fit = tf ? true : false
  }

  reachedGoal(x, y) {
    if (y > 0 && y < Y_GOAL && x > 0 && x < WIDTH)
      return true
    return false
  }

  // Draw runs the simulation at the same time
  draw(iterations) {
    push()
    let next = createVector(this.x, this.y)

    for (let i = 0; i < iterations; i++) {
      translate(next.x, next.y)
      const angleDelta = this.getAngleMax() - this.getAngleMin()
      const halfAngle = angleDelta * 0.5 + this.getAngleMin()
      const angle = randomGaussian(halfAngle, angleDelta * 0.25)
      next = p5.Vector.fromAngle(angle, this.getLength())

      line(0, 0, next.x, next.y)

      if (this.reachedGoal(next.x, next.y))
        this.setFit(true)
    }
    pop()
  }

  static mate(stalk1, stalk2) {
    
  }

  // Returns a new Stalk instance derived from the parameter Stalk
  static mutate(stalk) {

  }

  static evalutateFitness(stalk) {
    if (stalk.fit)
      return true
    return false
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
    createCanvas(HEIGHT, WIDTH, SVG);
    console.log('Output mode: SVG')
  } else {
    createCanvas(HEIGHT, WIDTH);
    console.log('Output mode: PNG')
  }

  const pixelD = pixelDensity()
  pixelDensity(pixelD)
  colorMode(HSB)
  angleMode(DEGREES)
}

function draw() {
  const palette = [color(40, 7, 100), // floral white
                   color(248, 27, 35), // independence
                  ]
  background(palette[0])
  stroke(palette[1])
  strokeWeight(2)

  // DERIVED
  // Randomized starting position
  const xSpread = WIDTH / POPULATION

  randomSeed(SEED)
  stalks = []

  // Create initial population
  for (let i = 0; i < POPULATION; i++) {
    stalks[i] = new Stalk(i * xSpread, Y_START)
  }

  // Draw
  drawGoal()

  for (let i = 0; i < POPULATION; i++) {
    stalks[i].draw(GROWTH_STEPS)
  }



  if (SAVE_OUTPUT) {
    const timestamp = Date.now();
    const basename = TITLE + ':' + timestamp + ':' + SEED

    if (OUTPUT_SVG)
      save(basename + '.svg');
    else
      save(basename + '.png');
  }

  noLoop()
}