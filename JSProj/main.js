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
const GENERATIONS = 100
const Y_START = HEIGHT
const Y_GOAL = HEIGHT * 0.4
console.log('Y_GOAL: ' + Y_GOAL)
// Stalks have until GROWTH_STEPS to make it into the end zone
const GROWTH_STEPS = 150

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

// Fisher-Yates shuffle algorithm implementation
// from https://www.w3docs.com/snippets/javascript/how-to-randomize-shuffle-a-javascript-array.html
function shuffleArray(array) {
  let curId = array.length;
  // There remain elements to shuffle
  while (curId !== 0) {
    // Pick a remaining element
    let randId = Math.floor(random() * curId)
    curId -= 1
    // Swap it with the current element
    let tmp = array[curId]
    array[curId] = array[randId]
    array[randId] = tmp
  }

  return array
}

class Stalk {
  constructor(x, y, angleStdDev, length) {
    this.x = x != null ? x : 0
    this.y = y != null ? y : 0
    this.angleStdDev = angleStdDev != null ? angleStdDev : random(0, 40)
    this.length = length != null ? length : random(2, 15)

    this.fit = false
  }
  getX() { return this.x }
  setX(x) { this.x = x }
  getY() { return this.y }
  setY(y) { this.y = y }

  getAngleStdDev() { return this.angleStdDev }
  getLength() { return this.length }

  getFit() { return this.fit }
  setFit(tf) { this.fit = tf ? true : false }
  clearFit() { this.fit = false}

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
  evaluate(iterations, draw) {
    const tf = new Transformer()
    tf.push()
    tf.translate(this.x, this.y)

    for (let i = 0; i < iterations; i++) {
      let v1 = createVector(0, 0)
      let a = this.nextAngle()
      let v2 = createVector(cos(a) * this.length, sin(a) * this.length)
      // dot(v2)
      // bline(v1, v2)
      if (draw)
        line(v1.x, v1.y, v2.x, v2.y)
      tf.translate(v2.x, v2.y)
      tf.rotate(90 + a)

      if (Stalk.reachedGoal(tf.x, tf.y)) {
        this.setFit(true)
      }
    }

    tf.pop()
  }

  static clone(stalk) {
    return new Stalk(0, 0, stalk.getAngleStdDev(), stalk.getLength())
  }

  // Each gene will be either a copy of one of the parents' genes
  // or a 50/50 split between the two
  static mate(stalk1, stalk2) {
    const angleRand = random()
    const lengthRand = random()
    let a, l

    if (angleRand < 0.333)
      a = stalk1.getAngleStdDev()
    else if (angleRand < 0.666)
      a = (stalk1.getAngleStdDev() + stalk2.getAngleStdDev()) / 2
    else
      a = stalk2.getAngleStdDev()

    if (lengthRand < 0.333)
      l = stalk1.getLength()
    else if (lengthRand < 0.666)
      l = (stalk1.getLength() + stalk2.getLength()) / 2
    else
      l = stalk2.getLength()

    return new Stalk(0, 0, a, l)
  }

  // Add or subtract up to about 50% from each gene
  // Returns a new Stalk instance derived from the parameter Stalk
  static mutate(stalk) {
    let a = stalk.getAngleStdDev()
    let l = stalk.getLength()
    a += a * randomGaussian(0, 0.2)
    l += l * randomGaussian(0, 0.2)

    return new Stalk(0, 0, a, l)
  }

  static getOffspring(stalks, fertility) {
    let populus = []
    const len = stalks.length
    const popTarget = len * fertility

    for (let i = 0; i < popTarget; i++) {
      populus.push(Stalk.mate(stalks[i % len], stalks[Math.floor(random(len))]))
    }

    return populus
  }

  static getMutations(stalks) {
    const populus = []
    for (let i = 0; i < stalks.length; i++) {
      populus.push(Stalk.mutate(stalks[i]))
    }

    return populus
  }
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
  colorMode(HSB, 360, 100, 100)
  angleMode(DEGREES)
}


function draw() {
  const palette = [color('#fff9ed'), // floral white
                   color('#45425a'), // independence
                   color('#e24e1b'), // flame
                   color('#119da4'), // viridian green
                   color('#da7635'), // chocolate web
                   ] 
  background(palette[0])
  stroke(palette[1])
  strokeWeight(0.5)

  const xSpread = WIDTH / POPULATION

  randomSeed(SEED)
  let stalks = []

  function drawGoal() {
    push()
    let goalColor = palette[2]
    goalColor.setAlpha(.5)
    fill(goalColor)
    noStroke()
    rect(0, HEIGHT * 0.33, width, HEIGHT)
    pop()
  }

  drawGoal()

  // Create initial population
  for (let i = 0; i < POPULATION; i++) {
    stalks[i] = new Stalk(i * xSpread, Y_START)
  }

  // Evaluate and evolve
  for (let j = 0; j < GENERATIONS; j++) {

    // Draw / eval population
    let myGrey = palette[1]
    myGrey.setAlpha(0.1)
    let myGreen = palette[3]
    myGreen.setAlpha(0.9)
    stroke(lerpColor(myGrey, myGreen, j / GENERATIONS))
    for (let i = 0; i < stalks.length; i++) {
      let drawGen = (j === GENERATIONS - 1)
      stalks[i].evaluate(GROWTH_STEPS, drawGen)
    }


    // Get fit population
    const fitStalks = shuffleArray(stalks.filter(stalk => stalk.getFit()))
    console.log("Fit pop: " + fitStalks.length)

    // 85% of fit pop mates
    // 15% of fit pop mutates
    const fitDivIdx = Math.floor(fitStalks.length * 0.7)
    const matingStalks = fitStalks.slice(0, fitDivIdx)
    const mutatingStalks = fitStalks.slice(fitDivIdx)

    let nextGenStalks = []
    nextGenStalks.concat(Stalk.getOffspring(matingStalks, 2.5))
    nextGenStalks.concat(Stalk.getMutations(mutatingStalks))

    // Fill in next gen with random survivors from the pop
    while (nextGenStalks.length < POPULATION * 0.5) {
      const survivor = stalks[Math.floor(random(stalks.length))]
      const clone = Stalk.clone(survivor)
      nextGenStalks.push(clone)
    }

    nextGenStalks = shuffleArray(nextGenStalks)

    for (let i = 0; i < nextGenStalks.length; i++) {
      nextGenStalks[i].setX(i * xSpread)
      nextGenStalks[i].setY(Y_START)
    }

    stalks = nextGenStalks
  }

  if (SAVE_OUTPUT) {
    const basename = TITLE + ':' + TIMESTAMP + ':' + SEED

    if (OUTPUT_SVG)
      save(basename + '.svg');
    else
      save(basename + '.png');
  }

  noLoop()
}