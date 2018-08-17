/**
 * EDCL.js
 * @author shawn0326 http://www.halflab.me/
 */

(function(win) {

    /**
     * DECL
     * @param {Number[]} points [[x1, y1], [x2, y2], ...]
     * @param {Number[]} edges [[start1, end1], [start2, end2]...] starts and ends are indices of points
     */
    function DECL(points, edges) {

        var vertices = [];
        var hedges = [];
        var faces = [];

        function init() {

            // Step 1: vertex list creation
            for (var i = 0, l = points.length; i < l; i++) {
                var p = points[i];
                var v = new Vertex(p[0], p[1]);
                v.id = i;
                vertices.push(v);
            }

            // Step 2: hedge list creation. Assignment of twins and vertices
            for (var i = 0, l = edges.length; i < l; i++) {
                var e = edges[i];
                var h1 = new Hedge(vertices[e[0]], vertices[e[1]]);
                var h2 = new Hedge(vertices[e[1]], vertices[e[0]]);
                h1.twin = h2;
                h2.twin = h1;
                vertices[e[1]].hedgelist.push(h1);
                vertices[e[0]].hedgelist.push(h2);
                hedges.push(h2);
                hedges.push(h1);
            }

            // Step 3: Identification of next and prev hedges
            for (var j = 0, ll = vertices.length; j < ll; j++) {
                var v = vertices[j];
                v.sortincident();
                var l = v.hedgelist.length;
                if (l == 0) continue; // skip vertex that has no edges
                if (l < 2) {
                    v.hedgelist[0].prevhedge = v.hedgelist[0].twin;
                    v.hedgelist[0].twin.nexthedge = v.hedgelist[0];
                } else {
                    for(var i = 0; i < l - 1; i++) {
                        v.hedgelist[i].twin.nexthedge = v.hedgelist[i+1];
                        v.hedgelist[i+1].prevhedge = v.hedgelist[i].twin;
                    }
                    v.hedgelist[l-1].twin.nexthedge = v.hedgelist[0];
                    v.hedgelist[0].prevhedge = v.hedgelist[l-1].twin;
                }
            }

            // Step 4: Face assignment
            var provlist = hedges.slice(0);
            var nh = hedges.length;

            while (nh > 0) {
                var h = provlist.pop();
                nh -= 1;
                // We check if the hedge already points to a face
                if (h.face == null) {
                    var f = new Face();
                    // We link the hedge to the new face
                    f.wedge = h;
                    f.wedge.face = f;
                    // And we traverse the boundary of the new face
                    while (h.nexthedge !== f.wedge) {
                        h = h.nexthedge;
                        h.face = f;
                    }
                    faces.push(f);
                }
            }
            // And finally we have to determine the external face
            for (var i = 0, l = faces.length; i < l; i++) {
                var f = faces[i];
                f.area = area(f);
                f.external = f.area < 0;
            }

        }

        init();

        /**
         * return internal faces 
         */
        function areas() {
            var result = [];
            for (var i = 0, l = faces.length; i < l; i++) {
                var f = faces[i];
                if (!f.external) {
                    result.push(f);
                }
            }
            return result;
        }

        return {
            vertices: vertices,
            hedges: hedges,
            faces: faces,
            areas: areas
        };

    }

    function sortByAngle(a, b) {
        return b.angle - a.angle;
    }

    /**
     * Vertex
     * @param {number} x 
     * @param {number} y 
     */
    function Vertex(x, y) {
        this.id = 0;
        this.x = x;
        this.y = y;
        this.hedgelist = [];
    }

    Vertex.prototype.sortincident = function() {
        this.hedgelist.sort(sortByAngle);
    }

    // half edge angle
    function hangle(dx, dy) {
        var l = Math.sqrt(dx * dx + dy * dy);

        if (dy > 0) {
            return Math.acos(dx / l);
        } else {
            return 2 * Math.PI - Math.acos(dx / l);
        }
    }

    /**
     * Half Edge
     * @param {Vertex} v1 
     * @param {Vertex} v2 
     */
    function Hedge(v1, v2) {
        this.origin = v2;
        this.twin = null;
        this.face = null;
        this.nexthedge = null;
        this.angle = hangle(v2.x - v1.x, v2.y - v1.y);
        this.prevhedge = null;
        this.length = Math.sqrt(Math.pow(v2.x - v1.x, 2) + Math.pow(v2.y - v1.y, 2));
    }

    // face area
    function area(f) {
        var h = f.wedge;
        var a = 0;
        while (h.nexthedge !== f.wedge) {
            var p1 = h.origin;
            var p2 = h.nexthedge.origin;
            a += p1.x * p2.y - p2.x * p1.y;
            h = h.nexthedge;
        }
        p1 = h.origin;
        p2 = f.wedge.origin;
        a = (a + p1.x * p2.y - p2.x * p1.y) / 2;
        return a;
    }

    // hedge and point area
    function area2(hedge, point) {
        var pa = hedge.twin.origin;
        var pb = hedge.origin;
        var pc = point;
        return (pb.x - pa.x) * (pc.y - pa.y) - (pc.x - pa.x) * (pb.y - pa.y);
    }

    function lefton(hedge, point) {
        return area2(hedge, point) <= 0;
    }

    /**
     * Face
     */
    function Face() {
        this.wedge = null;
        this.area = 0;
        this.external = false;
    }

    Object.assign(Face.prototype, {
        
        vertexlist: function() {
            var h = this.wedge;
            var pl = [h.origin];
            while(h.nexthedge !== this.wedge) {
                h = h.nexthedge;
                if(h.prevhedge !== h.twin) {
                    pl.push(h.origin);
                }
            }
            return pl;
        },

        // Only for convex polygon?
        isinside: function(p) {
            var h = this.wedge;
            if ( lefton(h, p) ) {
                while(h.nexthedge !== this.wedge) {
                    h = h.nexthedge;
                    if (!lefton(h, p)) {
                        return false;
                    }
                }
                return true;
            } else {
                return false;
            }
        }

    });

    win.DECL = DECL;

})(window);