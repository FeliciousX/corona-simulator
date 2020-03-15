import * as d3 from '/web_modules/d3.js'

function main ({ w, h, v, size, population, speed }) {
  const canvas = d3.select('body')
    .append('svg')
    .attr('class', 'canvas')
    .attr('width', `${w}px`)
    .attr('height', `${h}px`)

  canvas.append('rect')
    .attr('width', `${w}px`)
    .attr('height', `${h}px`)
    .attr('fill', '#f3f3f3')

  const nodes = d3.range(0, population).map(d => {
    const x = (w - size * 4) * Math.random() + size * 2
    const y = (h - size * 4) * Math.random() + size * 2
    return {
      x: Math.round(x),
      y: Math.round(y),
      radius: size / 2,
      vx: Math.random() > .5 ? 1 : -1,
      vy: Math.random() > .5 ? 1 : -1,
      id: d,
      isMoving: true
    }
  })

  const simulation = d3.forceSimulation(nodes)
    .velocityDecay(0)
    .alphaDecay(0)
    .force('charge', d3.forceManyBody().strength(0))
    .force('centering', d3.forceCenter(w / 2, h / 2))
    .force('forceX', d3.forceX().strength(0.01).x(d => d.vx > 0 ? w : 0))
    .force('forceY', d3.forceY().strength(0.01).y(d => d.vy > 0 ? h : 0))
    .force('collision', d3.forceCollide().radius(d => d.radius).strength(1))
    .on('tick', ticked)

  const stop = d3.select('#stop')
    .on('click', () => simulation.stop())

  function ticked () {
    const humans = canvas.selectAll('circle')
      .data(nodes)
      .join(
        enter => enter.append('circle').attr('r', d => d.radius),
        update => update.attr('cx', d => d.x).attr('cy', d => d.y)
      )

    humans.exit().remove()
  }
}

main({
  w: 800,
  h: 800,
  v: 3,
  size: 20,
  population: 10,
  speed: 50
})
