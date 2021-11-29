class Stalk {
  constructor(x, y) {
    this.x = x
    this.y = y
    this.angleMin = random(PI, PI + HALF_PI)
    this.angleMax = random(PI + HALF_PI, TWO_PI)
    this.length = randomGaussian(10, 5)
  }

  getAngleMin() { return this.angleMin }
  getAngleMax() { return this.angleMax }
  getLength() { return this.length }

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
    }
    pop()
  }
}

function fitness() {
  return 1.0
}

function setup() {
  const CANVAS_X = 500
  const CANVAS_Y = 700
  OUTPUT_SVG = false
  SAVE_OUTPUT = true
  TITLE = 'GAOne'

  if (OUTPUT_SVG) {
    createCanvas(CANVAS_X, CANVAS_Y, SVG);
    console.log('Output mode: SVG')
  } else {
    createCanvas(CANVAS_X, CANVAS_Y);
    console.log('Output mode: PNG')
  }

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

  // LEVERS
  const SEED = 209
  // Fixed population size
  const population = 100
  const yStart = height
  const growthSteps = 1000

  // DERIVED
  // Randomized starting position
  const xSpread = width / population

  randomSeed(SEED)
  stalks = []

  // Create initial population
  for (let i = 0; i < population; i++) {
    stalks[i] = new Stalk(i * xSpread, yStart)
    // stalks[i] = new Stalk(width/2, yStart)
  }

  // Draw
  for (let i = 0; i < population; i++) {
    stalks[i].draw(growthSteps)
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