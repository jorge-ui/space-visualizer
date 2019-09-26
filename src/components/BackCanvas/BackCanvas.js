
import React, { useEffect } from 'react'

const {$} = window

const BackCanvas = () => {
   let canvas, ctx, PERSPECTIVE; // for init later
   let perspectiveView = 0.7
   let particles = {}
   let particleCount = 0
   let particleSpeed = .5
   let particleRadius = .6
   let offSet = 8

   class Particle {
      x = (Math.random() - 0.5) * (canvas.width/2)
      y = (Math.random() - 0.5) * (canvas.height/2)
      z = canvas.width/100
      offSet = 1
      opacity = 0
      projected = { x: 0, y: 0, scale: 0, }
      id = particleCount

      constructor() {
         if(Math.abs(this.x) < offSet) this.x < 1 ? this.x -= offSet : this.x += offSet;
         particles[this.id] = this
         particleCount > 10000 ? particleCount=0 : particleCount++
      }
   
      project() {
         let {x, y, z, opacity, projected} = this
         // fade in
         opacity < 1 ? this.opacity += 0.01 : this.opacity = 1
         // calculate projection scale based on distance from camera
         this.projected.scale = PERSPECTIVE / (PERSPECTIVE + z)
         // calculate x and y projection position
         this.projected.x = (x * projected.scale) + canvas.width/2
         this.projected.y = (y * projected.scale) + canvas.height/2
         // move on z
         this.z -= particleSpeed
      }
      
      draw() {
         if(this.projected.x > canvas.width || this.projected.y > canvas.height || this.projected.x < 0 || this.projected.y < 0 || this.projected.scale <= -1) {
            return delete particles[this.id]
         } else {
            // calculate projection values
            this.project()
            // draw particle
            let { projected, opacity } = this
            this.drawCircle(
               projected.x,
               projected.y,
               projected.scale * particleRadius,
               `rgba(255, 255, 255, ${opacity})`
            )
         }
      }

      drawCircle(x, y, radius, color) {
         ctx.fillStyle = color;
         ctx.beginPath();
         ctx.arc(x, y, radius, 0, Math.PI*2);
         ctx.fill()
      }
   }

   // onComponentDidMount
   useEffect(() => {
      // Initial setup
      canvas = $("#BackCanvas")  // eslint-disable-line react-hooks/exhaustive-deps
      ctx = canvas.getContext('2d')                   // eslint-disable-line react-hooks/exhaustive-deps
      // field of view for 3D scene
      PERSPECTIVE = canvas.width * perspectiveView               // eslint-disable-line react-hooks/exhaustive-deps
      startPlaying()
   }, [])

   function startPlaying() {
      window.restartCanvasBack = false
      // set dimentions
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      // set particles       
      particles = {} // store each particle here
      particleCount = 0
      setTimeout(requestAnimationFrame.bind(null, render), 100)
   }

   function render() {
      if(window.restartCanvasBack) return startPlaying()

      ctx.clearRect(0, 0, canvas.width, canvas.height)
      if(Math.random() < .2) new Particle()
      for(let id in particles) particles[id].draw()
      requestAnimationFrame(render)
   }


   return(<canvas id="BackCanvas"/>)
}

export default BackCanvas