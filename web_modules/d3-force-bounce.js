import { q as quadtree } from './common/index-7d24f90f.js';

var constant = function (x) {
  return function () {
    return x;
  };
};

var bounce = function () {
    var nodes = void 0,
        elasticity = 1,
        // 0 <= number <= 1
    radius = function radius(node) {
        return 1;
    },
        // accessor: number > 0
    mass = function mass(node) {
        return Math.pow(radius(node), 2);
    },
        // accessor: number > 0 (Mass proportional to area by default)
    onImpact = void 0; // (node, node) callback

    function force() {

        var tree = quadtree(nodes, function (d) {
            return d.x;
        }, function (d) {
            return d.y;
        }).visitAfter(function (quad) {
            if (quad.data) return quad.r = radius(quad.data);
            for (var i = quad.r = 0; i < 4; ++i) {
                if (quad[i] && quad[i].r > quad.r) {
                    quad.r = quad[i].r; // Store largest radius per tree node
                }
            }
        });

        nodes.forEach(function (a) {
            var ra = radius(a);

            tree.visit(function (quad, x0, y0, x1, y1) {

                var b = quad.data,
                    rb = quad.r,
                    minDistance = ra + rb;

                if (b) {
                    // Leaf tree node
                    if (b.index > a.index) {
                        // Prevent visiting same node pair more than once

                        if (a.x === b.x && a.y === b.y) {
                            // Totally overlap > jiggle b
                            var jiggleVect = polar2Cart(1e-6, Math.random() * 2 * Math.PI);
                            b.x += jiggleVect.x;
                            b.y += jiggleVect.y;
                        }

                        var impactVect = cart2Polar(b.x - a.x, b.y - a.y),
                            // Impact vector from a > b
                        overlap = Math.max(0, minDistance - impactVect.d);

                        if (!overlap) return; // No collision

                        var vaRel = rotatePnt({ x: a.vx, y: a.vy }, -impactVect.a),
                            // x is the velocity along the impact line, y is tangential
                        vbRel = rotatePnt({ x: b.vx, y: b.vy }, -impactVect.a);

                        // Transfer velocities along the direct line of impact (tangential remain the same)

                        // Convert back to original plane
                        var _getAfterImpactVeloci = getAfterImpactVelocities(mass(a), mass(b), vaRel.x, vbRel.x, elasticity);

                        vaRel.x = _getAfterImpactVeloci.a;
                        vbRel.x = _getAfterImpactVeloci.b;

                        var _rotatePnt = rotatePnt(vaRel, impactVect.a);

                        a.vx = _rotatePnt.x;
                        a.vy = _rotatePnt.y;

                        // Split them apart
                        var _rotatePnt2 = rotatePnt(vbRel, impactVect.a);

                        b.vx = _rotatePnt2.x;
                        b.vy = _rotatePnt2.y;
                        var nudge = polar2Cart(overlap, impactVect.a),
                            nudgeBias = ra / (ra + rb); // Weight of nudge to apply to B
                        a.x -= nudge.x * (1 - nudgeBias);a.y -= nudge.y * (1 - nudgeBias);
                        b.x += nudge.x * nudgeBias;b.y += nudge.y * nudgeBias;

                        onImpact && onImpact(a, b);
                    }
                    return;
                }

                // Only keep traversing sub-tree quadrants if radius overlaps
                return x0 > a.x + minDistance || x1 < a.x - minDistance || y0 > a.y + minDistance || y1 < a.y - minDistance;
            });
        });

        //

        function getAfterImpactVelocities(ma, mb, va, vb) {
            var elasticity = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : 1;

            // Apply momentum conservation equation with coefficient of restitution (elasticity)
            return {
                a: (elasticity * mb * (vb - va) + ma * va + mb * vb) / (ma + mb),
                b: (elasticity * ma * (va - vb) + ma * va + mb * vb) / (ma + mb)
            };
        }

        function rotatePnt(_ref, a) {
            var x = _ref.x,
                y = _ref.y;

            var vect = cart2Polar(x, y);
            return polar2Cart(vect.d, vect.a + a);
        }

        function cart2Polar(x, y) {
            x = x || 0; // Normalize -0 to 0 to avoid -Infinity issues in atan
            return {
                d: Math.sqrt(x * x + y * y),
                a: x === 0 && y === 0 ? 0 : Math.atan(y / x) + (x < 0 ? Math.PI : 0) // Add PI for coords in 2nd & 3rd quadrants
            };
        }

        function polar2Cart(d, a) {
            return {
                x: d * Math.cos(a),
                y: d * Math.sin(a)
            };
        }
    }

    force.initialize = function (_) {
        nodes = _;
        
    };

    force.elasticity = function (_) {
        return arguments.length ? (elasticity = _, force) : elasticity;
    };

    force.radius = function (_) {
        return arguments.length ? (radius = typeof _ === "function" ? _ : constant(+_), force) : radius;
    };

    force.mass = function (_) {
        return arguments.length ? (mass = typeof _ === "function" ? _ : constant(+_), force) : mass;
    };

    force.onImpact = function (_) {
        return arguments.length ? (onImpact = _, force) : onImpact;
    };

    return force;
};

export default bounce;
