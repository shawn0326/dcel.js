/**
 * dcel.js (https://github.com/shawn0326/dcel.js)
 * @author shawn0326 http://www.halflab.me/
 */
(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (factory());
}(this, (function () { 'use strict';

    function sortByAngle(a, b) {
        return b.angle - a.angle;
    }

    var counter = 0;

    /**
     * Vertex
     * @param {number} x 
     * @param {number} y 
     */
    function Vertex(x, y) {
        this.id = counter++;
        this.x = x;
        this.y = y;
        this.hedgelist = [];
    }

    Object.assign(Vertex.prototype, {

        sortincident: function() {
            this.hedgelist.sort(sortByAngle);
        },

        dispose: function() {
            this.hedgelist.length = 0;
        }

    });

    // half edge angle
    function hangle(dx, dy) {
        var l = Math.sqrt(dx * dx + dy * dy);

        if (dy > 0) {
            return Math.acos(dx / l);
        } else {
            return 2 * Math.PI - Math.acos(dx / l);
        }
    }

    var counter$1 = 0;

    /**
     * Half Edge
     * @param {Vertex} v1 
     * @param {Vertex} v2 
     */
    function Hedge(v1, v2) {
        this.id = counter$1++;
        this.origin = v2;
        this.twin = null;
        this.face = null;
        this.nexthedge = null;
        this.angle = hangle(v2.x - v1.x, v2.y - v1.y);
        this.prevhedge = null;
        this.length = Math.sqrt(Math.pow(v2.x - v1.x, 2) + Math.pow(v2.y - v1.y, 2));
    }

    Object.assign(Hedge.prototype, {

        dispose: function() {
            this.origin = null;
            this.twin = null;
            this.face = null;
            this.nexthedge = null;
            this.prevhedge = null;
        }

    });

    var counter$2 = 0;

    /**
     * Face
     */
    function Face(dcel) {

        this.id = counter$2++;

        this.wedge = null;

        this._area = 0;
        this._areaDirty = true;

        this._vertexlist = [];
        this._vertexlistDirty = true;
        
        this._dcel = dcel;
        this._holes = [];
        this._holesDirty = true;

    }

    Object.defineProperties(Face.prototype, {

        area: {

            get: function() {

                if (this._areaDirty) {
                    var h = this.wedge;
                    var a = 0;
                    while (h.nexthedge !== this.wedge) {
                        var p1 = h.origin;
                        var p2 = h.nexthedge.origin;
                        a += p1.x * p2.y - p2.x * p1.y;
                        h = h.nexthedge;
                    }
                    p1 = h.origin;
                    p2 = this.wedge.origin;
                    a = (a + p1.x * p2.y - p2.x * p1.y) / 2;

                    this._area = a;

                    this._areaDirty = false;
                }
                
                return this._area;
            }

        },

        areaExceptHoles: {

            get: function() {

                var holes = this.holes;
                var area = this.area;

                for (var i = 0, l = holes.length; i < l; i++) {
                    area -= holes[i].area;
                }

                return area;

            }

        },

        external: {
            
            get: function() {
                return this.area < 0;
            }

        },

        vertexlist: {

            get: function() {

                if (this._vertexlistDirty) {
                    var h = this.wedge;
                    var pl = this._vertexlist;
                    pl.length = 0;
                    pl.push(h.origin);
                    while(h.nexthedge !== this.wedge) {
                        h = h.nexthedge;
                        if(h.prevhedge !== h.twin) {
                            pl.push(h.origin);
                        }
                    }

                    this._vertexlistDirty = false;
                }

                return this._vertexlist;
                
            }

        },

        holes: {

            get: function() {

                if (this._holesDirty) {

                    this._holesDirty = false;
                    this._holes.length = 0; // clear

                    // skip external or 0 faces
                    if (this.area > 0) {

                        var faces = this._dcel.faces;

                        for (var i = 0, l = faces.length; i < l; i++) {

                            this.tryAddHole(faces[i]);

                        }

                    }

                }

                return this._holes;

            }

        }

    });

    Object.assign(Face.prototype, {

        tryAddHole: function(f) {

            // if holes dirty, skip try
            if (this._holesDirty) return;

            // hole's external should < 0
            // todo if area === 0, it's an hole??
            if (f.external) {

                if ( this.area > Math.abs(f.area) ) ;

            }

        },

        dirty: function() {
            this._areaDirty = true;
            this._vertexlistDirty = true;
            this._holesDirty = true;
        },

        dispose: function() {
            this.wedge = null;
            this._vertexlist.length = 0;
            this._holes.length = 0;
        }

    });

    /**
     * DCEL
     * @param {Number[]} points [[x1, y1], [x2, y2], ...]
     * @param {Number[]} edges [[start1, end1], [start2, end2]...] starts and ends are indices of points
     */
    function DCEL(points, edges) {

        var vertices = [];
        var hedges = [];
        var faces = [];

        var scope = this;

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
                    var f = new Face(scope);
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

        /**
         * dispose
         */
        function dispose() {
            for (var i = 0, l = vertices.length; i < l; i++) {
                vertices[i].dispose();
            }

            for (var i = 0, l = hedges.length; i < l; i++) {
                hedges[i].dispose();
            }

            for (var i = 0, l = faces.length; i < l; i++) {
                faces[i].dispose();
            }

            vertices.length = 0;
            hedges.length = 0;
            faces.length = 0;
        }

        return {
            vertices: vertices,
            hedges: hedges,
            faces: faces,
            areas: areas,
            dispose: dispose
        };

    }

    window.DCEL = DCEL;

})));
