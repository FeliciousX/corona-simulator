import * as d3 from '/web_modules/d3.js'
import forceBounce from '/web_modules/d3-force-bounce.js'

const HEALTHY = 0
const SICK = 1
const RECOVERED = 2

const healthMap = {
  [HEALTHY]: 'teal',
  [SICK]: 'brown',
  [RECOVERED]: 'pink'
}

function main ({ w, h, size, population, speed }) {
  function nodeFactory (override) {
    return {
      x: Math.round((w - size * 4) * Math.random() + size * 2),
      y: Math.round((h - size * 4) * Math.random() + size * 2),
      vx: Math.random() > .5 ? 1 : -1,
      vy: Math.random() > .5 ? 1 : -1,
      radius: size / 2,
      status: HEALTHY,
      tick: 0,
      ...override
    }
  }

  const canvas = d3.select('body')
    .append('svg')
    .attr('class', 'canvas')
    .attr('width', `${w}px`)
    .attr('height', `${h}px`)

  canvas.append('rect')
    .attr('width', `${w}px`)
    .attr('height', `${h}px`)
    .attr('fill', '#f3f3f3')

  const healthy = d3.range(0, population - 1).map(id => nodeFactory({ id }))

  const sick = nodeFactory({ id: healthy.length, status: SICK })

  let nodes = healthy.concat([sick])

  const bounceForce = forceBounce()
    .radius(d => d.radius)
  bounceForce.onImpact((node1, node2) => {
    if (
      node1.status === SICK && node2.status === HEALTHY ||
      node2.status === SICK && node1.status === HEALTHY
    ) {
      node1.status = SICK
      node2.status = SICK
    }
  })

  const simulation = d3.forceSimulation(nodes)
    .velocityDecay(0)
    .alphaDecay(0)
    .force('wall', forceWall({ width: w, height: h }))
    .force('collision', bounceForce)
    .force('recover', forceRecover())
    .on('tick', ticked)

  const stop = d3.select('#stop')
    .on('click', () => simulation.stop())

  function ticked () {
    const humans = canvas.selectAll('circle')
      .data(nodes)
      .join(
        enter => enter.append('circle').attr('r', d => d.radius),
        update => update
          .attr('cx', d => d.x)
          .attr('cy', d => d.y)
          .attr('fill', d => healthMap[d.status])
      )

    humans.exit().remove()
  }

}

function forceRecover () {
  let nodes = []

  function force (alpha) {
    nodes.forEach((d, index, obj) => {
      if (d.status === SICK) {
        d.tick = d.tick + 1

        d.vx = d.vx * .995
        d.vy = d.vy * .995

        if (d.tick > 1000) {
          if (Math.random() <= 0.04) {
            obj.splice(index, 1)
          } else {
            d.status = RECOVERED
          }
        }
      }
    })
  }

  force.initialize = function (_) {
    nodes = _
  }

  return force
}

function exceedRight (width, node) {
  return node.vx + node.x >= width - node.radius
}

function exceedLeft (node) {
  return node.vx + node.x <= node.radius
}

function exceedTop (node) {
  return node.vy + node.y <= node.radius
}

function exceedBottom (height, node) {
  return node.vy + node.y >= height - node.radius
}

function forceWall ({ width, height }) {
  let nodes = []

  function force () {
    nodes.forEach(d => {
      if (exceedRight(width, d) || exceedLeft(d)) {
        d.vx = d.vx * -1
      }

      if (exceedTop(d) || exceedBottom(height, d)) {
        d.vy = d.vy * -1
      }
    })
  }

  force.initialize = function (_) {
    nodes = _
  }

  return force
}

main({
  w: 800,
  h: 800,
  size: 20,
  population: 50,
  speed: 50
})
