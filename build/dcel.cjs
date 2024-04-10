/**
 * @license
 * Copyright 2018-present dcel.js Authors
 * SPDX-License-Identifier: MIT
 */

'use strict';

// by this, internal face is ccw
// hedgelist is cw
function sortByAngle(a, b) {
    return b.angle - a.angle;
}

var counter$2 = 0;

/**
 * Vertex.
 * Don't instantiate this class in your code.
 * it can only be called by the {@link DCEL} class.
 * @class
 * @private
 * @param {number} x
 * @param {number} y 
 */
function Vertex(x, y) {

    this.id = counter$2++;

    /**
     * @type number 
     */
    this.x = x;

    /**
     * @type number 
     */
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
 * Half Edge.
 * Don't instantiate this class in your code.
 * it can only be called by the {@link DCEL} class.
 * @class
 * @private
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

/**
 * AABB.
 * Don't instantiate this class in your code.
 * @class
 * @private
 */
function AABB() {

    /**
     * @type {number}
     */
    this.minX = + Infinity;
    /**
     * @type {number}
     */
    this.minY = + Infinity;

    /**
     * @type {number}
     */
    this.maxX = - Infinity;
    /**
     * @type {number}
     */
    this.maxY = - Infinity;

}

Object.defineProperties(AABB.prototype, {

    /**
     * width
     * @memberof AABB#
     * @readonly
     * @type {number}
     */
    width: {

        get: function() {
            return this.maxX - this.minX;
        }

    },

    /**
     * height
     * @memberof AABB#
     * @readonly
     * @type {number}
     */
    height: {

        get: function() {
            return this.maxY - this.minY;
        }

    }

});

Object.assign(AABB.prototype, {

    reset: function() {

        this.minX = + Infinity;
        this.minY = + Infinity;

        this.maxX = - Infinity;
        this.maxY = - Infinity;

    },

    expand: function(point) {
    
        this.minX = Math.min(point.x, this.minX);
        this.minY = Math.min(point.y, this.minY);
        this.maxX = Math.max(point.x, this.maxX);
        this.maxY = Math.max(point.y, this.maxY);

    },

    expands: function(points) {

        for (var i = 0, l = points.length; i < l; i++) {
            this.expand(points[i]);
        }

    },

    intersects: function(aabb) {
        return aabb.maxX < this.minX || aabb.minX > this.maxX ||
        aabb.maxY < this.minY || aabb.minY > this.maxY ? false : true;
    },

    containsPoint: function(point) {
        return point.x <= this.maxX && point.x >= this.minX &&
        point.y <= this.maxY && point.y >= this.minY ? true : false;
    },

    containsPoints: function(points) {
        for (var i = 0, l = points.length; i < l; i++) {
            if (!this.containsPoint(points[i])) {
                return false;
            }
        }
        return true;
    },

    size: function() {
        return {
            width: this.maxX - this.minX,
            height: this.maxY - this.minY
        };
    }

});

function pointInsidePolygon(polygonPoints, checkPoint) {
    var counter = 0;
    var i;
    var xinters;
    var p1, p2;
    var pointCount = polygonPoints.length;
    p1 = polygonPoints[0];
 
    for (i = 1; i <= pointCount; i++) {
        p2 = polygonPoints[i % pointCount];
        if (
            checkPoint.x > Math.min(p1.x, p2.x) &&
            checkPoint.x <= Math.max(p1.x, p2.x)
        ) {
            if (checkPoint.y <= Math.max(p1.y, p2.y)) {
                if (p1.x != p2.x) {
                    xinters =
                        (checkPoint.x - p1.x) *
                            (p2.y - p1.y) /
                            (p2.x - p1.x) +
                        p1.y;
                    if (p1.y == p2.y || checkPoint.y <= xinters) {
                        counter++;
                    }
                }
            }
        }
        p1 = p2;
    }
    if (counter % 2 == 0) {
        return false;
    } else {
        return true;
    }
}

function pointsInsidePolygon(polygonPoints, checkPoints) {

    for (var i = 0, l = checkPoints.length; i < l; i++) {
        if ( !pointInsidePolygon(polygonPoints, checkPoints[i]) ) {
            return false;
        }
    }

    return true;

}

var counter = 0;

/**
 * Face.
 * Don't instantiate this class in your code.
 * it can only be called by the {@link DCEL} class.
 * @class
 * @private
 * @param {DCEL} dcel
 */
function Face(dcel) {

    this.id = counter++;

    this.wedge = null;

    this._area = 0;
    this._areaDirty = true;

    this._vertexlist = [];
    this._vertexlistDirty = true;
    
    this._dcel = dcel;
    this._holes = [];
    this._holesDirty = true;

    this._aabb = null;
    this._aabbDirty = true;

}

Object.defineProperties(Face.prototype, {

    /**
     * face area
     * @memberof Face#
     * @readonly
     * @type {number}
     */
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

    /**
     * face area except holes
     * @memberof Face#
     * @readonly
     * @type {number}
     */
    areaExceptHoles: {

        get: function() {

            var holes = this.holes;
            var area = this.area;

            for (var i = 0, l = holes.length; i < l; i++) {
                area += holes[i].area;
            }

            return area;

        }

    },

    /**
     * is this face internal (area > 0)
     * @memberof Face#
     * @readonly
     * @type {boolean}
     */
    internal: {

        get: function() {
            return this.area > 0;
        }

    },

    /**
     * is this face internal (area <= 0)
     * @memberof Face#
     * @readonly
     * @type {boolean}
     */
    external: {
        
        get: function() {
            return this.area <= 0;
        }

    },

    /**
     * vertex list of this face.
     * if this face is internal, vertex order is ccw
     * if this face is external, vertex order is cw
     * @memberof Face#
     * @readonly
     * @type {Vertex[]}
     */
    vertexlist: {

        get: function() {

            if (this._vertexlistDirty) {

                var h = this.wedge;
                var pl = this._vertexlist;
                pl.length = 0;
                pl.push(h.origin);
                while(h.nexthedge !== this.wedge) {
                    h = h.nexthedge;
                    // if(h.prevhedge !== h.twin) {
                        pl.push(h.origin);
                    // }
                }

                this._vertexlistDirty = false;
                
            }

            return this._vertexlist;
            
        }

    },

    /**
     * holes of this face.
     * all of this holes are external faces.
     * @memberof Face#
     * @readonly
     * @type {Face[]}
     */
    holes: {

        get: function() {

            if (this._holesDirty) {

                this._holesDirty = false;
                this._holes.length = 0; // clear

                // skip external or 0 faces
                if (this.internal) {

                    var faces = this._dcel.faces;

                    for (var i = 0, l = faces.length; i < l; i++) {

                        this.tryAddHole(faces[i]);

                    }

                }

            }

            return this._holes;

        }

    },

    /**
     * aabb of this face
     * @memberof Face#
     * @readonly
     * @type {AABB}
     */
    aabb: {

        get: function() {

            if (!this._aabb) {
                this._aabb = new AABB();
            }

            if (this._aabbDirty) {
                this._aabb.reset();
                this._aabb.expands(this.vertexlist);

                this._aabbDirty = false;
            }

            return this._aabb;

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

            if ( this.area > Math.abs(f.area) ) {

                // test aabb first
                if ( this.aabb.containsPoints(f.vertexlist) ) {
                    
                    // here make sure f is inside
                    if( pointsInsidePolygon(this.vertexlist, f.vertexlist) ) {

                        this._holes.push(f);

                    }

                }

            }

        }

    },

    /**
     * is this face is equals another
     * @memberof Face#
     * @param f target face
     * @return {boolean}
     */
    equals: function(f) {
        var list1 = this.vertexlist;
        var list2 = f.vertexlist;

        if (list1.length !== list2.length) {
            return false;
        }

        var l = list1.length;

        for (var offset = 0; offset < l; offset++) {
            for (var i = 0; i < l; i++) {
                if (list1[i] !== list2[(offset + i) % l]) {
                    break;
                }
                if ( i === (l - 1) ) {
                    return true;
                }
            }
        }

        return false;

    },

    dirty: function() {
        this._areaDirty = true;
        this._vertexlistDirty = true;
        this._holesDirty = true;
        this._aabbDirty = true;
    },

    dispose: function() {
        this.wedge = null;
        this._vertexlist.length = 0;
        this._holes.length = 0;
        this._aabb = null;
        this._dcel = null;
    }

});

/**
 * DCEL
 * @class
 * @param {Number[]} [points=] [[x1, y1], [x2, y2], ...]
 * @param {Number[]} [edges=] [[start1, end1], [start2, end2]...] starts and ends are indices of points
 */
function DCEL(points, edges) {

    /**
     * @type {Vertex[]} 
     */
    this.vertices = [];
    /**
     * @type {Hedge[]} 
     */
    this.hedges = [];
    /**
     * @type {Face[]} 
     */
    this.faces = [];

    if (points && edges) {
        this.setDatas(points, edges);
    }

}

Object.assign(DCEL.prototype, {

    /**
     * set data
     * @memberof DCEL#
     * @param {Number[]} points [[x1, y1], [x2, y2], ...]
     * @param {Number[]} edges [[start1, end1], [start2, end2]...] starts and ends are indices of points
     */
    setDatas: function(points, edges) {

        var vertices = this.vertices;
        var hedges = this.hedges;
        var faces = this.faces;

        // Step 1: vertex list creation
        for (var i = 0, l = points.length; i < l; i++) {
            var p = points[i];
            var v = new Vertex(p[0], p[1]);
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
                var f = new Face(this);
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
    },

    /**
     * get all internal (area > 0) faces
     * @memberof DCEL#
     * @return {Face[]} internal faces
     */
    internalFaces: function() {
        var result = [], faces = this.faces;
        for (var i = 0, l = faces.length; i < l; i++) {
            var f = faces[i];
            if (f.internal) {
                result.push(f);
            }
        }
        return result;
    },

    /**
     * get all external (area <= 0) faces
     * @memberof DCEL#
     * @return {Face[]} external faces
     */
    externalFaces: function() {
        var result = [], faces = this.faces;
        for (var i = 0, l = faces.length; i < l; i++) {
            var f = faces[i];
            if (f.external) {
                result.push(f);
            }
        }
        return result;
    },

    /**
     * dispose old datas
     * @memberof DCEL#
     */
    dispose: function() {

        var vertices = this.vertices;
        var hedges = this.hedges;
        var faces = this.faces;

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
        
    },

    /**
     * find vertex
     * @memberof DCEL#
     * @param {number} x
     * @param {number} y
     */
    findVertex: function(x, y) {

        var vertices = this.vertices;
        var vertex;
        for (var i = 0, l = vertices.length; i < l; i++) {
            vertex = vertices[i];
            if(vertex.x === x && vertex.y === y) {
                return vertex;
            }
        }

        return null;

    },

    /**
     * find hedge
     * @memberof DCEL#
     * @param {number} x1
     * @param {number} y1
     * @param {number} x2
     * @param {number} y2
     */
    findHedge: function(x1, y1, x2, y2) {

        var hedges = this.hedges;
        var hedge, twinHedge;
        for (var i = 0, l = hedges.length; i < l; i++) {
            hedge = hedges[i];
            twinHedge = hedge.twin;
            if (hedge.origin.x === x1 && hedge.origin.y === y1
            && twinHedge.origin.x === x2 && twinHedge.origin.y === y2) {
                return hedge;
            }
        }

        return null;

    },

    /**
     * add edge
     * @memberof DCEL#
     * @param {number} x1
     * @param {number} y1
     * @param {number} x2
     * @param {number} y2
     */
    addEdge: function(x1, y1, x2, y2) {

        var vertices = this.vertices;
        var hedges = this.hedges;
        var faces = this.faces;

        var v1Created = false;
        var v2Created = false;

        var holesDirty = false;

        // step 1: try add/find vertex

        var v1 = this.findVertex(x1, y1);

        if (!v1) {
            v1 = new Vertex(x1, y1);
            vertices.push(v1);
            v1Created = true;
        }

        var v2 = this.findVertex(x2, y2);

        if (!v2) {
            v2 = new Vertex(x2, y2);
            vertices.push(v2);
            v2Created = true;
        }

        // step 2: add hedge

        var h1 = new Hedge(v2, v1);
        hedges.push(h1);
        v1.hedgelist.push(h1);
        v1.sortincident();

        var h2 = new Hedge(v1, v2);
        hedges.push(h2);
        v2.hedgelist.push(h2);
        v2.sortincident();

        // step 3: link hedges

        h1.twin = h2;
        h2.twin = h1;

        if (v1Created) {
            h1.prevhedge = h2;
            h2.nexthedge = h1;
        } else {
            var index = v1.hedgelist.indexOf(h1);
            if (index === 0) {
                var hprev = v1.hedgelist[v1.hedgelist.length - 1];
                var hnext = v1.hedgelist[(index + 1) % v1.hedgelist.length];
            } else {
                var hprev = v1.hedgelist[index - 1];
                var hnext = v1.hedgelist[(index + 1) % v1.hedgelist.length];
            }
            
            h1.prevhedge = hprev.twin;
            hprev.twin.nexthedge = h1;
            h2.nexthedge = hnext;
            hnext.prevhedge = h2;
        }

        if (v2Created) {
            h2.prevhedge = h1;
            h1.nexthedge = h2;
        } else {
            var index = v2.hedgelist.indexOf(h2);
            if (index === 0) {
                var hprev = v2.hedgelist[v2.hedgelist.length - 1];
                var hnext = v2.hedgelist[(index + 1) % v2.hedgelist.length];
            } else {
                var hprev = v2.hedgelist[index - 1];
                var hnext = v2.hedgelist[(index + 1) % v2.hedgelist.length];
            }

            h2.prevhedge = hprev.twin;
            hprev.twin.nexthedge = h2;
            h1.nexthedge = hnext;
            hnext.prevhedge = h1;
        }

        // step 4: remove face

        var head1 = h1.nexthedge;
        var head2 = h2.nexthedge;

        if (head1.face) {
            var index = faces.indexOf(head1.face);
            index > -1 && faces.splice(index, 1);
            head1.face.dispose();
            if (head1.face.area <= 0) {
                holesDirty = true;
            }
        }

        var index = faces.indexOf(head2.face);

        if (head2.face) {
            var index = faces.indexOf(head2.face);
            index > -1 && faces.splice(index, 1);
            head2.face.dispose();
            if (head2.face.area <= 0) {
                holesDirty = true;
            }
        }

        // step 5: add new face

        var face1 = new Face(this);
        face1.wedge = head1;

        var face2 = new Face(this);
        face2.wedge = head2;

        if( face1.equals(face2) ) { 
            face2.dispose();
            face2 = null;
        }

        // set hedge face

        if ( face1 ) {

            var h = face1.wedge;
            h.face = face1;
            // And we traverse the boundary of the new face
            while (h.nexthedge !== face1.wedge) {
                h = h.nexthedge;
                h.face = face1;
            }

            if (face1.area <= 0) {
                holesDirty = true;
            }

            faces.push(face1);
        }

        if ( face2 ) {

            var h = face2.wedge;
            h.face = face2;
            // And we traverse the boundary of the new face
            while (h.nexthedge !== face2.wedge) {
                h = h.nexthedge;
                h.face = face2;
            }

            if (face2.area <= 0) {
                holesDirty = true;
            }

            faces.push(face2);
        }

        // step 6: mark hole dirty

        if ( holesDirty ) {
            
            for (var i = 0, l = faces.length; i < l; i++) {
                faces[i]._holesDirty = true;
            }

        }

    },

    /**
     * remove edge
     * @memberof DCEL#
     * @param {number} x1
     * @param {number} y1
     * @param {number} x2
     * @param {number} y2
     */
    removeEdge: function(x1, y1, x2, y2) {

        var vertices = this.vertices;
        var hedges = this.hedges;
        var faces = this.faces;

        var hedge = this.findHedge(x1, y1, x2, y2);

        if (!hedge) {
            console.warn("removeEdge: found no hedge to split!", x1, y1, x2, y2);
        }

        var twinHedge = hedge.twin;

        // store new faces head
        var head1 = hedge.nexthedge;
        var head2 = twinHedge.nexthedge;
        var useHead1 = true;
        var useHead2 = true;
        var holesDirty = false;

        // step 1: remove hedge from hedges

        var index = hedges.indexOf(hedge);
        hedges.splice(index, 1);

        var index = hedges.indexOf(twinHedge);
        hedges.splice(index, 1);

        // step 2: remove face from faces
        // notice that two hedges may belong to the same face

        var index = faces.indexOf(hedge.face);
        index > -1 && faces.splice(index, 1);
        hedge.face.dispose();
        if (hedge.face.area <= 0) {
            holesDirty = true;
        }

        var index = faces.indexOf(twinHedge.face);
        index > -1 && faces.splice(index, 1);
        twinHedge.face.dispose();
        if (twinHedge.face.area <= 0) {
            holesDirty = true;
        }

        // step 3: remove hedge from vertex.hedgelist
        // if vertex.hedgelist.length === 0 remove the vertex
        // else link the next edge

        var index = hedge.origin.hedgelist.indexOf(hedge);
        hedge.origin.hedgelist.splice(index, 1);
        if (hedge.origin.hedgelist.length > 0) {
            if (index === 0) {
                var h1 = hedge.origin.hedgelist[hedge.origin.hedgelist.length - 1];
                var h2 = hedge.origin.hedgelist[index];
            } else {
                var h1 = hedge.origin.hedgelist[index - 1];
                var h2 = hedge.origin.hedgelist[index % hedge.origin.hedgelist.length];
            }
            h2.prevhedge = h1.twin;
            h1.twin.nexthedge = h2;
        } else {
            var _index = vertices.indexOf(hedge.origin);
            vertices.splice(_index, 1);
            hedge.origin.dispose();
            useHead2 = false;
        }

        var index = twinHedge.origin.hedgelist.indexOf(twinHedge);
        twinHedge.origin.hedgelist.splice(index, 1);
        if (twinHedge.origin.hedgelist.length > 0) {
            if (index === 0) {
                var h1 = twinHedge.origin.hedgelist[twinHedge.origin.hedgelist.length - 1];
                var h2 = twinHedge.origin.hedgelist[index];
            } else {
                var h1 = twinHedge.origin.hedgelist[index - 1];
                var h2 = twinHedge.origin.hedgelist[index % twinHedge.origin.hedgelist.length];
            }
            h2.prevhedge = h1.twin;
            h1.twin.nexthedge = h2;
        } else {
            var _index = vertices.indexOf(twinHedge.origin);
            vertices.splice(_index, 1);
            twinHedge.origin.dispose();
            useHead1 = false;
        }

        hedge.dispose();
        twinHedge.dispose();

        // step 4: add faces

        var face1 = useHead1 ? new Face(this) : null;
        if ( face1 ) {
            face1.wedge = head1;
        }

        var face2 = useHead2 ? new Face(this) : null;
        if ( face2 ) {
            face2.wedge = head2;
        }

        if ( face1 && face2 ) {
            if( face1.equals(face2) ) { 
                face2.dispose();
                face2 = null;
            }
        }

        // set hedge face

        if ( face1 ) {

            var h = face1.wedge;
            h.face = face1;
            // And we traverse the boundary of the new face
            while (h.nexthedge !== face1.wedge) {
                h = h.nexthedge;
                h.face = face1;
            }

            if (face1.area <= 0) {
                holesDirty = true;
            }

            faces.push(face1);
        }

        if ( face2 ) {

            var h = face2.wedge;
            h.face = face2;
            // And we traverse the boundary of the new face
            while (h.nexthedge !== face2.wedge) {
                h = h.nexthedge;
                h.face = face2;
            }

            if (face2.area <= 0) {
                holesDirty = true;
            }

            faces.push(face2);
        }

        // step 5: mark hole dirty

        if ( holesDirty ) {
            
            for (var i = 0, l = faces.length; i < l; i++) {
                faces[i]._holesDirty = true;
            }

        }

    },

    /**
     * split edge
     * @memberof DCEL#
     * @param {number} x1
     * @param {number} y1
     * @param {number} x2
     * @param {number} y2
     * @param {number} splitX
     * @param {number} splitY
     */
    splitEdge: function(x1, y1, x2, y2, splitX, splitY) {

        var vertices = this.vertices;
        var hedges = this.hedges;

        var hedge = this.findHedge(x1, y1, x2, y2);

        if (!hedge) {
            console.warn("splitEdge: found no hedge to split!", x1, y1, x2, y2);
        }

        var twinHedge = hedge.twin;

        // step 1: add 1 Vertex and 4 Hedge

        var splitVertex = new Vertex(splitX, splitY);
        vertices.push(splitVertex);

        // instead of hedge
        var h1 = new Hedge(splitVertex, hedge.origin);
        var h2 = new Hedge(twinHedge.origin, splitVertex);
        hedges.push(h1);
        hedges.push(h2);

        // instead of twinHedge
        var h3 = new Hedge(splitVertex, twinHedge.origin);
        var h4 = new Hedge(hedge.origin, splitVertex);
        hedges.push(h3);
        hedges.push(h4);

        // step 2: link faces

        if (hedge.face.wedge === hedge) {
            hedge.face.wedge = h1;
        }
        hedge.face._vertexlistDirty = true; // only vertexlist dirty

        h1.face = hedge.face;
        h2.face = hedge.face;

        if (twinHedge.face.wedge === twinHedge) {
            twinHedge.face.wedge = h3;
        }
        twinHedge.face._vertexlistDirty = true; // only vertexlist dirty

        h3.face = twinHedge.face;
        h4.face = twinHedge.face;

        // step 3: link hedges

        h1.nexthedge = h2;
        h2.prevhedge = h1;

        h3.nexthedge = h4;
        h4.prevhedge = h3;

        h1.prevhedge = (hedge.prevhedge !== twinHedge) ? hedge.prevhedge : h4;
        h1.prevhedge.nexthedge = h1;
        
        h2.nexthedge = (hedge.nexthedge !== twinHedge) ? hedge.nexthedge : h3;
        h2.nexthedge.prevhedge = h2;

        h3.prevhedge = (twinHedge.prevhedge !== hedge) ? twinHedge.prevhedge : h2;
        h3.prevhedge.nexthedge = h3;
        
        h4.nexthedge = (twinHedge.nexthedge !== hedge) ? twinHedge.nexthedge : h1;
        h4.nexthedge.prevhedge = h4;

        h1.twin = h4;
        h2.twin = h3;
        h3.twin = h2;
        h4.twin = h1;

        // step 4: handle hedgelist in vertex

        splitVertex.hedgelist.push(h2, h4);

        var index = hedge.origin.hedgelist.indexOf(hedge);
        hedge.origin.hedgelist.splice(index, 1, h1);

        var index = twinHedge.origin.hedgelist.indexOf(twinHedge);
        twinHedge.origin.hedgelist.splice(index, 1, h3);

        // step 5: remove hedge & twinHedge

        hedge.dispose();
        twinHedge.dispose();

        var index = hedges.indexOf(hedge);
        hedges.splice(index, 1);

        var index = hedges.indexOf(twinHedge);
        hedges.splice(index, 1);

    }

});

module.exports = DCEL;
