;(function (global, factory) {
  if (typeof module === 'object' && typeof module.exports === 'object') {
    module.exports = factory(global, true)
  } else {
    factory(global)
  }
})(typeof window !== 'undefined' ? window : this, function (window, noGlobal) {
  const point = {},
    document = window.document

  function mousemove(event) {
    event.preventDefault()
    if (event.touches) {
      point.x = event.touches[0].pageX
      point.y = event.touches[0].pageY
    } else {
      point.x = event.clientX
      point.y = event.clientY
    }
  }

  
  class Oscillator {
    constructor(options = {phase:0,offset:0,frequency: 0.01, amplitude: 1}){
      this.phase = options.phase
      this.offset = options.offset
      this.frequency = options.frequency
      this.amplitude = options.amplitude
      this.value = 0
    }
    update() {
      this.phase += this.frequency
      this.value = this.offset + Math.sin(this.phase) * this.amplitude
      return this.value
    }
  }

  class Node {
    constructor({x = 0, y = 0, vx = 0, vy = 0}) {
      this.x = x
      this.y = y
      this.vx = vx
      this.vy = vy
    }
  }

  class Tendril {
    constructor({spring, trail}) {
      this.spring = spring + Math.random() * 0.1 - 0.05
      this.friction = trail.friction + Math.random() * 0.01 - 0.05
      this.trail = trail
      this.nodes = Array.from({length: trail.size}, () => new Node({x:point.x,y:point.y}))
    }

    update() {
      let spring = this.spring
      let node = this.nodes[0]
      node.vx += (point.x - node.x) * spring
      node.vy += (point.y - node.y) * spring

      for (let prev, i = 0, n = this.nodes.length; i < n; i++) {
        node = this.nodes[i]
        if (i > 0) {
          prev = this.nodes[i - 1]
          node.vx += (prev.x - node.x) * spring
          node.vy += (prev.y - node.y) * spring
          node.vx += prev.vx * this.trail.dampening
          node.vy += prev.vy * this.trail.dampening
        }
        node.vx *= this.friction
        node.vy *= this.friction
        node.x += node.vx
        node.y += node.vy
        spring *= this.trail.tension
      }
    }

    draw() {
      let [{x,y}] = this.nodes, a, b
      this.trail.ctx.beginPath()
      this.trail.ctx.moveTo(x,y)

      for(let i = 0, n = this.nodes.length - 2; i < n; i++) {
        a = this.nodes[i]
        b = this.nodes[i+1]
        x = (a.x + b.x) * 0.5
        y = (a.y + b.y) * 0.5
        this.trail.ctx.quadraticCurveTo(a.x, a.y, x, y)
      }

      a = this.nodes[this.nodes.length - 2]
      b = this.nodes[this.nodes.length - 1]

      this.trail.ctx.quadraticCurveTo(a.x, a.y, b.x, b.y)
      this.trail.ctx.stroke()
      this.trail.ctx.closePath()
    }
  }

  class Trail {
    constructor({ctx, trails = 20, friction = 0.5, tension = 0.98, dampening = 0.25, size = 50}) {
      this.ctx = typeof ctx === 'string' ? document.body.querySelector(ctx).getContext('2d') : ctx 
      this.frame = 1
      this.trails = trails
      this.friction = friction
      this.tension = tension
      this.dampening = dampening
      this.size = size
      this.tendrils = Array.from({length: trails}, (e, i) => new Tendril({
        spring: 0.45 + 0.025 * (i / trails),
        trail: this
      }))
    }

    start() {
      this.resize()
      this.oscillator = new Oscillator({
        phase: 2 * Math.random() * Math.PI,
        amplitude: 85,
        frequency: 0.0015,
        offset: 285
      })
      document.addEventListener('mousemove', mousemove)
      document.addEventListener('touchmove', mousemove)
      document.addEventListener('click', () => {
        if(!this.running) {
          this.running = true
          this.loop()
        }
      })
      document.addEventListener('blur', () => {
        this.running = false
      })
    }
    resize() {
      this.ctx.canvas.width = window.innerWidth
      this.ctx.canvas.height = window.innerHeight
    }
    loop() {
      if (!this.running) return

      this.ctx.globalCompositeOperation = 'source-over'
      this.ctx.fillStyle = 'rgba(8,5,16,0.4)'
      this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height)

      this.ctx.globalCompositeOperation = 'lighter'
      this.ctx.strokeStyle = `hsla(${Math.round(this.oscillator.update())}, 90%, 50%, 0.25)`
      this.ctx.lineWidth = 1

      this.tendrils.forEach(tendril => {
        tendril.update()
        tendril.draw()
      })

      this.frame++
      requestAnimationFrame(this.loop.bind(this))
    }
  }

  if (!noGlobal) {
    window.Trail = Trail
  }
  return Trail
});




