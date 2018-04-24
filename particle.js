;
(function(global, factory) {
  if (typeof module === 'object' && typeof module.exports === 'object') {
    module.exports = factory(global, true)
  } else {
    factory(global)
  }
})(typeof window !== 'undefined' ? window : this, function(window, noGlobal) {

  const raf = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame || window.oRequestAnimationFrame || (cb => setTimeout(cb, 1000/60))

  class Particle {
    constructor({
      ctx, dotsCount = 100, maxLength = 6000
    }) {
      this.ctx = typeof ctx === 'string' ? document.querySelector(ctx).getContext('2d') : ctx
      this.canvas = this.ctx.canvas
      this.maxLength = maxLength
      this.dots = Array.from({
        length: dotsCount
      }, () => ({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        xa: Math.random() * 2 - 1,
        ya: Math.random() * 2 - 1
      }))
    }
    start() {
      this.running = true
      if(!this.mouse) {
        this.mouse = {}
      }
      
      this.canvas.onmousemove = e => {
        this.mouse.x = e.offsetX 
        this.mouse.y = e.offsetY
        this.mouse.maxLength = 20000
      }
      this.canvas.onmouseout = e => {
        this.mouse.x = null
        this.mouse.y = null
      }
      this.animate()
    }
    stop() {
      this.running = flase
    }
    animate() {
      let ndots = this.dots.concat([this.mouse])
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
      this.dots.forEach(dot => {
        dot.x += dot.xa
        dot.y += dot.ya
        dot.xa *= (dot.x > this.canvas.width || dot.x < 0) ? -1 : 1
        dot.ya *= (dot.y > this.canvas.height || dot.y < 0) ? -1 : 1

        this.ctx.fillRect(dot.x - 0.5, dot.y - 0.5, 1, 1)

        for(let d of ndots) {
          if(dot === d || d.x === null || d.y === null) continue
          let xc = dot.x - d.x
          let yc = dot.y - d.y
          let dis = xc * xc + yc * yc
          let len = d.maxLength || this.maxLength
          if (dis < len) {
              if(d === this.mouse && dis > (this.mouse.maxLength/2)) {
                dot.x -= xc * 0.03
                dot.y -= yc * 0.03
              }
              let ratio = (this.maxLength - dis)/ this.maxLength

              this.ctx.beginPath()
              this.ctx.lineWidth = ratio/2
              this.ctx.strokeStyle = `rgba(0,0,0, ${ratio + 0.2})`
              this.ctx.moveTo(dot.x, dot.y)
              this.ctx.lineTo(d.x, d.y)
              this.ctx.stroke()
          }
        }
        ndots.splice(ndots.indexOf(dot), 1)
      })
      this.running && raf(this.animate.bind(this))
    }
  }
  if(!noGlobal) window.Particle = Particle
  return Particle
});