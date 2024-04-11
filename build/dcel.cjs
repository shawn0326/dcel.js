/**
 * @license
 * Copyright 2018-present shawn0326
 * SPDX-License-Identifier: MIT
 */

'use strict';

/**
 * Vertex class.
 */
class Vertex {
  /**
   * Create a new vertex.
   * @protected
   * @param {number} x - The x coordinate of the vertex.
   * @param {number} y - The y coordinate of the vertex.
   */
  constructor(x, y) {
    /**
     * @type {number}
     * @readonly
     */
    this.id = counter$2++;

    /**
     * @type {number}
     */
    this.x = x;

    /**
     * @type {number}
     */
    this.y = y;

    /**
     * @type {Hedge[]}
     */
    this.hedgelist = [];
  }

  /**
   * Sort the hedgelist to cw.
   * By this, the internal face is ccw.
   * @protected
   */
  sortincident() {
    this.hedgelist.sort(sortByAngle);
  }

  /**
   * Dispose the hedgelist of the vertex.
   * @protected
   */
  dispose() {
    this.hedgelist.length = 0;
  }
}

let counter$2 = 0;

function sortByAngle(a, b) {
  return b.angle - a.angle;
}

/**
 * The Half Edge class.
 */
class Hedge {
  /**
   * Create a new half edge.
   * @protected
   * @param {Vertex} v1 - The destination vertex.
   * @param {Vertex} v2 - The origin vertex.
   */
  constructor(v1, v2) {
    /**
     * @type {number}
     * @readonly
     */
    this.id = counter$1++;

    /**
     * @type {Vertex}
     */
    this.origin = v2;

    /**
     * @type {number}
     */
    this.angle = hangle(v2.x - v1.x, v2.y - v1.y);

    /**
     * @type {number}
     */
    this.length = Math.sqrt(
      Math.pow(v2.x - v1.x, 2) + Math.pow(v2.y - v1.y, 2)
    );

    /**
     * @type {Hedge}
     */
    this.twin = null;

    /**
     * @type {Hedge}
     */
    this.nexthedge = null;

    /**
     * @type {Hedge}
     */
    this.prevhedge = null;

    /**
     * @type {Face}
     */
    this.face = null;
  }

  /**
   * Dispose the half edge.
   * @protected
   */
  dispose() {
    this.origin = null;

    this.twin = null;
    this.nexthedge = null;
    this.prevhedge = null;

    this.face = null;
  }
}

let counter$1 = 0;

// Get the angle of half edge.
function hangle(dx, dy) {
  const l = Math.sqrt(dx * dx + dy * dy);

  if (dy > 0) {
    return Math.acos(dx / l);
  } else {
    return 2 * Math.PI - Math.acos(dx / l);
  }
}

/**
 * The 2D AABB (Axis-Aligned Bounding Box) class.
 */
class AABB {
  /**
   * Create a new AABB.
   * @protected
   */
  constructor() {
    /**
     * @type {number}
     */
    this.minX = +Infinity;

    /**
     * @type {number}
     */
    this.minY = +Infinity;

    /**
     * @type {number}
     */
    this.maxX = -Infinity;

    /**
     * @type {number}
     */
    this.maxY = -Infinity;
  }

  /**
   * With of the AABB.
   * @type {number}
   */
  get width() {
    return this.maxX - this.minX;
  }

  /**
   * Height of the AABB.
   * @type {number}
   */
  get height() {
    return this.maxY - this.minY;
  }

  /**
   * Reset the AABB.
   * @protected
   */
  reset() {
    this.minX = +Infinity;
    this.minY = +Infinity;
    this.maxX = -Infinity;
    this.maxY = -Infinity;
  }

  /**
   * Expand the AABB with a point.
   * @protected
   * @param {Vertex} point - The point to expand the AABB.
   */
  expand(point) {
    this.minX = Math.min(point.x, this.minX);
    this.minY = Math.min(point.y, this.minY);
    this.maxX = Math.max(point.x, this.maxX);
    this.maxY = Math.max(point.y, this.maxY);
  }

  /**
   * Expand the AABB with an array of points.
   * @protected
   * @param {Vertex[]} points - The points to expand the AABB.
   */
  expands(points) {
    for (let i = 0, l = points.length; i < l; i++) {
      this.expand(points[i]);
    }
  }

  /**
   * Check if the AABB intersects with another AABB.
   * @param {AABB} aabb - The AABB to check.
   * @returns {boolean} - True if the AABB intersects with the other AABB, false otherwise.
   */
  intersects(aabb) {
    return aabb.maxX < this.minX ||
      aabb.minX > this.maxX ||
      aabb.maxY < this.minY ||
      aabb.minY > this.maxY
      ? false
      : true;
  }

  /**
   * Check if the AABB contains a point.
   * @param {Vertex} point - The point to check.
   * @returns {boolean} - True if the AABB contains the point, false otherwise.
   */
  containsPoint(point) {
    return point.x <= this.maxX &&
      point.x >= this.minX &&
      point.y <= this.maxY &&
      point.y >= this.minY
      ? true
      : false;
  }

  /**
   * Check if the AABB contains every point in an array of points.
   * @param {Vertex[]} points - The points to check.
   * @returns {boolean} - True if the AABB contains all the points, false otherwise.
   */
  containsPoints(points) {
    for (let i = 0, l = points.length; i < l; i++) {
      if (!this.containsPoint(points[i])) {
        return false;
      }
    }
    return true;
  }

  /**
   * Get the size of the AABB.
   * @returns {object} - The size of the AABB, with width and height properties.
   */
  size() {
    return {
      width: this.maxX - this.minX,
      height: this.maxY - this.minY,
    };
  }
}

/**
 * The face class.
 * This represents a polygon area in the DCEL.
 */
class Face {
  /**
   * Create a new face.
   * @protected
   * @param {DCEL} dcel - The DCEL instance.
   */
  constructor(dcel) {
    /**
     * @type {number}
     * @readonly
     */
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

  /**
   * Get the area of the face.
   * @type {number}
   */
  get area() {
    if (this._areaDirty) {
      let h = this.wedge;
      let a = 0;
      let p1, p2;
      while (h.nexthedge !== this.wedge) {
        p1 = h.origin;
        p2 = h.nexthedge.origin;
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

  /**
   * Get the area of the face except holes.
   * @type {number}
   */
  get areaExceptHoles() {
    const holes = this.holes;

    let area = this.area;

    for (let i = 0, l = holes.length; i < l; i++) {
      area += holes[i].area;
    }

    return area;
  }

  /**
   * Whether this is an internal face. (area > 0)
   * @type {boolean}
   */
  get internal() {
    return this.area > 0;
  }

  /**
   * Whether this is an external face. (area <= 0)
   * @type {boolean}
   */
  get external() {
    return this.area <= 0;
  }

  /**
   * Get vertex list of the face.
   * If this face is internal, vertex order is ccw.
   * If this face is external, vertex order is cw.
   * @type {Vertex[]}
   */
  get vertexlist() {
    if (this._vertexlistDirty) {
      let h = this.wedge;

      const pl = this._vertexlist;

      pl.length = 0;
      pl.push(h.origin);
      while (h.nexthedge !== this.wedge) {
        h = h.nexthedge;
        // if(h.prevhedge !== h.twin) {
        pl.push(h.origin);
        // }
      }

      this._vertexlistDirty = false;
    }

    return this._vertexlist;
  }

  /**
   * Get the holes of the face.
   * @type {Face[]}
   */
  get holes() {
    if (this._holesDirty) {
      this._holesDirty = false;
      this._holes.length = 0; // clear

      // skip external or 0 faces
      if (this.internal) {
        const faces = this._dcel.faces;

        for (let i = 0, l = faces.length; i < l; i++) {
          this._tryAddHole(faces[i]);
        }
      }
    }

    return this._holes;
  }

  /**
   * Get the AABB of the face.
   * @type {AABB}
   */
  get aabb() {
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

  /**
   * Whether the face equals the target face.
   * @param {Face} f - The target face.
   * @returns {boolean} - True if the face equals the target face, false otherwise.
   */
  equals(f) {
    const list1 = this.vertexlist;
    const list2 = f.vertexlist;

    if (list1.length !== list2.length) {
      return false;
    }

    const l = list1.length;

    for (let offset = 0; offset < l; offset++) {
      for (let i = 0; i < l; i++) {
        if (list1[i] !== list2[(offset + i) % l]) {
          break;
        }
        if (i === l - 1) {
          return true;
        }
      }
    }

    return false;
  }

  /**
   * Mark the face as dirty.
   * @protected
   */
  dirty() {
    this._areaDirty = true;
    this._vertexlistDirty = true;
    this._holesDirty = true;
    this._aabbDirty = true;
  }

  /**
   * Dispose the face.
   * @protected
   */
  dispose() {
    this.wedge = null;
    this._vertexlist.length = 0;
    this._holes.length = 0;
    this._aabb = null;
    this._dcel = null;
  }

  /**
   * Try to add a hole.
   * @private
   */
  _tryAddHole(f) {
    // if holes dirty, skip try
    if (this._holesDirty) return;

    // hole's external should < 0
    // todo if area === 0, it's an hole??
    if (f.external) {
      if (this.area > Math.abs(f.area)) {
        // test aabb first
        if (this.aabb.containsPoints(f.vertexlist)) {
          // here make sure f is inside
          if (pointsInsidePolygon(this.vertexlist, f.vertexlist)) {
            this._holes.push(f);
          }
        }
      }
    }
  }
}

let counter = 0;

/**
 * Check if the point is inside the polygon.
 * @ignore
 * @param {Vertex[]} polygonPoints - The polygon points.
 * @param {Vertex} checkPoint - The check point.
 * @returns {boolean} - True if the point is inside the polygon, false otherwise.
 */
function pointInsidePolygon(polygonPoints, checkPoint) {
  let counter = 0;
  let i;
  let xinters;
  let p1, p2;

  const pointCount = polygonPoints.length;

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
            ((checkPoint.x - p1.x) * (p2.y - p1.y)) / (p2.x - p1.x) + p1.y;
          if (p1.y == p2.y || checkPoint.y <= xinters) {
            counter++;
          }
        }
      }
    }
    p1 = p2;
  }

  return counter % 2 == 1;
}

/**
 * Check if all the points are inside the polygon.
 * @ignore
 * @param {Vertex[]} polygonPoints - The polygon points.
 * @param {Vertex[]} checkPoints - The check points.
 * @returns {boolean} - True if all the points are inside the polygon, false otherwise.
 */
function pointsInsidePolygon(polygonPoints, checkPoints) {
  for (let i = 0, l = checkPoints.length; i < l; i++) {
    if (!pointInsidePolygon(polygonPoints, checkPoints[i])) {
      return false;
    }
  }

  return true;
}

/**
 * The Doubly-Connected Edge List (DCEL) data structure.
 * @see {@link https://en.wikipedia.org/wiki/Doubly_connected_edge_list}
 */
class DCEL {
  /**
   * Create a new DCEL.
   * @param {Array} [points=] - The vertices of the DCEL. [[x1, y1], [x2, y2], ...].
   * @param {Array} [edges=] - The edges of the DCEL. [[start1, end1], [start2, end2]...]. Starts and Ends are indices of vertices.
   */
  constructor(points, edges) {
    /**
     * The vertices of the DCEL.
     * @type {Vertex[]}
     */
    this.vertices = [];

    /**
     * The half edges of the DCEL.
     * @type {Hedge[]}
     */
    this.hedges = [];

    /**
     * The faces of the DCEL.
     * @type {Face[]}
     */
    this.faces = [];

    if (points && edges) {
      this.setDatas(points, edges);
    }
  }

  /**
   * Set the vertices and edges of the DCEL.
   * @param {Array} [points=] - The vertices of the DCEL. [[x1, y1], [x2, y2], ...].
   * @param {Array} [edges=] - The edges of the DCEL. [[start1, end1], [start2, end2]...]. Starts and Ends are indices of vertices.
   */
  setDatas(points, edges) {
    const vertices = this.vertices;
    const hedges = this.hedges;
    const faces = this.faces;

    // Step 1: vertex list creation
    for (let i = 0, l = points.length; i < l; i++) {
      const p = points[i];
      const v = new Vertex(p[0], p[1]);
      vertices.push(v);
    }

    // Step 2: hedge list creation. Assignment of twins and vertices
    for (let i = 0, l = edges.length; i < l; i++) {
      const e = edges[i];
      const h1 = new Hedge(vertices[e[0]], vertices[e[1]]);
      const h2 = new Hedge(vertices[e[1]], vertices[e[0]]);
      h1.twin = h2;
      h2.twin = h1;
      vertices[e[1]].hedgelist.push(h1);
      vertices[e[0]].hedgelist.push(h2);
      hedges.push(h2);
      hedges.push(h1);
    }

    // Step 3: Identification of next and prev hedges
    for (let j = 0, ll = vertices.length; j < ll; j++) {
      const v = vertices[j];
      v.sortincident();
      const l = v.hedgelist.length;
      if (l == 0) continue; // skip vertex that has no edges
      if (l < 2) {
        v.hedgelist[0].prevhedge = v.hedgelist[0].twin;
        v.hedgelist[0].twin.nexthedge = v.hedgelist[0];
      } else {
        for (let i = 0; i < l - 1; i++) {
          v.hedgelist[i].twin.nexthedge = v.hedgelist[i + 1];
          v.hedgelist[i + 1].prevhedge = v.hedgelist[i].twin;
        }
        v.hedgelist[l - 1].twin.nexthedge = v.hedgelist[0];
        v.hedgelist[0].prevhedge = v.hedgelist[l - 1].twin;
      }
    }

    // Step 4: Face assignment
    const provlist = hedges.slice(0);
    let nh = hedges.length;

    while (nh > 0) {
      let h = provlist.pop();
      nh -= 1;
      // We check if the hedge already points to a face
      if (h.face == null) {
        const f = new Face(this);
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

  /**
   * Get all internal (area > 0) faces
   * @returns {Face[]} - Internal faces
   */
  internalFaces() {
    const result = [],
      faces = this.faces;
    for (let i = 0, l = faces.length; i < l; i++) {
      const f = faces[i];
      if (f.internal) {
        result.push(f);
      }
    }
    return result;
  }

  /**
   * Get all external (area <= 0) faces
   * @returns {Face[]} - External faces
   */
  externalFaces() {
    const result = [],
      faces = this.faces;
    for (let i = 0, l = faces.length; i < l; i++) {
      const f = faces[i];
      if (f.external) {
        result.push(f);
      }
    }
    return result;
  }

  /**
   * Dispose old datas.
   */
  dispose() {
    const vertices = this.vertices;
    const hedges = this.hedges;
    const faces = this.faces;

    for (let i = 0, l = vertices.length; i < l; i++) {
      vertices[i].dispose();
    }

    for (let i = 0, l = hedges.length; i < l; i++) {
      hedges[i].dispose();
    }

    for (let i = 0, l = faces.length; i < l; i++) {
      faces[i].dispose();
    }

    vertices.length = 0;
    hedges.length = 0;
    faces.length = 0;
  }

  /**
   * Find vertex by x and y coordinate.
   * @param {number} x - The x coordinate of the vertex.
   * @param {number} y - The y coordinate of the vertex.
   * @returns {Vertex|null} - The vertex.
   */
  findVertex(x, y) {
    const vertices = this.vertices;
    let vertex;
    for (let i = 0, l = vertices.length; i < l; i++) {
      vertex = vertices[i];
      if (vertex.x === x && vertex.y === y) {
        return vertex;
      }
    }

    return null;
  }

  /**
   * Find half edge by start and end vertices coordinates.
   * @param {number} x1 - The x coordinate of the start vertex.
   * @param {number} y1 - The y coordinate of the start vertex.
   * @param {number} x2 - The x coordinate of the end vertex.
   * @param {number} y2 - The y coordinate of the end vertex.
   * @returns {Hedge|null} - The half edge.
   */
  findHedge(x1, y1, x2, y2) {
    const hedges = this.hedges;
    let hedge, twinHedge;
    for (let i = 0, l = hedges.length; i < l; i++) {
      hedge = hedges[i];
      twinHedge = hedge.twin;
      if (
        hedge.origin.x === x1 &&
        hedge.origin.y === y1 &&
        twinHedge.origin.x === x2 &&
        twinHedge.origin.y === y2
      ) {
        return hedge;
      }
    }

    return null;
  }

  /**
   * Add an edge to the DCEL.
   * @param {number} x1 - The x coordinate of the start vertex.
   * @param {number} y1 - The y coordinate of the start vertex.
   * @param {number} x2 - The x coordinate of the end vertex.
   * @param {number} y2 - The y coordinate of the end vertex.
   */
  addEdge(x1, y1, x2, y2) {
    const vertices = this.vertices;
    const hedges = this.hedges;
    const faces = this.faces;

    let v1Created = false;
    let v2Created = false;

    let holesDirty = false;

    // Step 1: try add/find vertex

    let v1 = this.findVertex(x1, y1);

    if (!v1) {
      v1 = new Vertex(x1, y1);
      vertices.push(v1);
      v1Created = true;
    }

    let v2 = this.findVertex(x2, y2);

    if (!v2) {
      v2 = new Vertex(x2, y2);
      vertices.push(v2);
      v2Created = true;
    }

    // Step 2: add hedge

    const h1 = new Hedge(v2, v1);
    hedges.push(h1);
    v1.hedgelist.push(h1);
    v1.sortincident();

    const h2 = new Hedge(v1, v2);
    hedges.push(h2);
    v2.hedgelist.push(h2);
    v2.sortincident();

    // Step 3: link hedges

    h1.twin = h2;
    h2.twin = h1;

    if (v1Created) {
      h1.prevhedge = h2;
      h2.nexthedge = h1;
    } else {
      const index = v1.hedgelist.indexOf(h1);
      let hprev, hnext;
      if (index === 0) {
        hprev = v1.hedgelist[v1.hedgelist.length - 1];
        hnext = v1.hedgelist[(index + 1) % v1.hedgelist.length];
      } else {
        hprev = v1.hedgelist[index - 1];
        hnext = v1.hedgelist[(index + 1) % v1.hedgelist.length];
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
      const index = v2.hedgelist.indexOf(h2);
      let hprev, hnext;
      if (index === 0) {
        hprev = v2.hedgelist[v2.hedgelist.length - 1];
        hnext = v2.hedgelist[(index + 1) % v2.hedgelist.length];
      } else {
        hprev = v2.hedgelist[index - 1];
        hnext = v2.hedgelist[(index + 1) % v2.hedgelist.length];
      }

      h2.prevhedge = hprev.twin;
      hprev.twin.nexthedge = h2;
      h1.nexthedge = hnext;
      hnext.prevhedge = h1;
    }

    // Step 4: remove face

    const head1 = h1.nexthedge;
    const head2 = h2.nexthedge;

    if (head1.face) {
      const index = faces.indexOf(head1.face);
      index > -1 && faces.splice(index, 1);
      head1.face.dispose();
      if (head1.face.area <= 0) {
        holesDirty = true;
      }
    }

    if (head2.face) {
      const index = faces.indexOf(head2.face);
      index > -1 && faces.splice(index, 1);
      head2.face.dispose();
      if (head2.face.area <= 0) {
        holesDirty = true;
      }
    }

    // Step 5: add new face

    const face1 = new Face(this);
    face1.wedge = head1;

    let face2 = new Face(this);
    face2.wedge = head2;
    if (face1.equals(face2)) {
      face2.dispose();
      face2 = null;
    }

    // set hedge face

    if (face1) {
      let h = face1.wedge;
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

    if (face2) {
      let h = face2.wedge;
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

    // Step 6: mark hole dirty

    if (holesDirty) {
      for (let i = 0, l = faces.length; i < l; i++) {
        faces[i]._holesDirty = true;
      }
    }
  }

  /**
   * Remove an edge from the DCEL.
   * @param {number} x1 - The x coordinate of the start vertex.
   * @param {number} y1 - The y coordinate of the start vertex.
   * @param {number} x2 - The x coordinate of the end vertex.
   * @param {number} y2 - The y coordinate of the end vertex.
   */
  removeEdge(x1, y1, x2, y2) {
    const vertices = this.vertices;
    const hedges = this.hedges;
    const faces = this.faces;

    const hedge = this.findHedge(x1, y1, x2, y2);

    if (!hedge) {
      console.warn("removeEdge: found no hedge to split!", x1, y1, x2, y2);
    }

    const twinHedge = hedge.twin;

    // store new faces head
    const head1 = hedge.nexthedge;
    const head2 = twinHedge.nexthedge;
    let useHead1 = true;
    let useHead2 = true;
    let holesDirty = false;

    let index;

    // Step 1: remove hedge from hedges

    index = hedges.indexOf(hedge);
    hedges.splice(index, 1);

    index = hedges.indexOf(twinHedge);
    hedges.splice(index, 1);

    // Step 2: remove face from faces
    // notice that two hedges may belong to the same face

    index = faces.indexOf(hedge.face);
    index > -1 && faces.splice(index, 1);
    hedge.face.dispose();
    if (hedge.face.area <= 0) {
      holesDirty = true;
    }

    index = faces.indexOf(twinHedge.face);
    index > -1 && faces.splice(index, 1);
    twinHedge.face.dispose();
    if (twinHedge.face.area <= 0) {
      holesDirty = true;
    }

    // Step 3: remove hedge from vertex.hedgelist
    // if vertex.hedgelist.length === 0 remove the vertex
    // else link the next edge

    index = hedge.origin.hedgelist.indexOf(hedge);
    hedge.origin.hedgelist.splice(index, 1);
    if (hedge.origin.hedgelist.length > 0) {
      let h1, h2;
      if (index === 0) {
        h1 = hedge.origin.hedgelist[hedge.origin.hedgelist.length - 1];
        h2 = hedge.origin.hedgelist[index];
      } else {
        h1 = hedge.origin.hedgelist[index - 1];
        h2 = hedge.origin.hedgelist[index % hedge.origin.hedgelist.length];
      }
      h2.prevhedge = h1.twin;
      h1.twin.nexthedge = h2;
    } else {
      const _index = vertices.indexOf(hedge.origin);
      vertices.splice(_index, 1);
      hedge.origin.dispose();
      useHead2 = false;
    }

    index = twinHedge.origin.hedgelist.indexOf(twinHedge);
    twinHedge.origin.hedgelist.splice(index, 1);
    if (twinHedge.origin.hedgelist.length > 0) {
      let h1, h2;
      if (index === 0) {
        h1 = twinHedge.origin.hedgelist[twinHedge.origin.hedgelist.length - 1];
        h2 = twinHedge.origin.hedgelist[index];
      } else {
        h1 = twinHedge.origin.hedgelist[index - 1];
        h2 =
          twinHedge.origin.hedgelist[index % twinHedge.origin.hedgelist.length];
      }
      h2.prevhedge = h1.twin;
      h1.twin.nexthedge = h2;
    } else {
      const _index = vertices.indexOf(twinHedge.origin);
      vertices.splice(_index, 1);
      twinHedge.origin.dispose();
      useHead1 = false;
    }

    hedge.dispose();
    twinHedge.dispose();

    // Step 4: add faces

    const face1 = useHead1 ? new Face(this) : null;
    if (face1) {
      face1.wedge = head1;
    }

    let face2 = useHead2 ? new Face(this) : null;
    if (face2) {
      face2.wedge = head2;
    }

    if (face1 && face2) {
      if (face1.equals(face2)) {
        face2.dispose();
        face2 = null;
      }
    }

    // set hedge face

    if (face1) {
      let h = face1.wedge;
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

    if (face2) {
      let h = face2.wedge;
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

    // Step 5: mark hole dirty

    if (holesDirty) {
      for (let i = 0, l = faces.length; i < l; i++) {
        faces[i]._holesDirty = true;
      }
    }
  }

  /**
   * Split an edge of the DCEL.
   * @param {number} x1 - The x coordinate of the start vertex.
   * @param {number} y1 - The y coordinate of the start vertex.
   * @param {number} x2 - The x coordinate of the end vertex.
   * @param {number} y2 - The y coordinate of the end vertex.
   * @param {number} splitX - The x coordinate of the split vertex.
   * @param {number} splitY - The y coordinate of the split vertex.
   */
  splitEdge(x1, y1, x2, y2, splitX, splitY) {
    const vertices = this.vertices;
    const hedges = this.hedges;

    const hedge = this.findHedge(x1, y1, x2, y2);

    if (!hedge) {
      console.warn("splitEdge: found no hedge to split!", x1, y1, x2, y2);
    }

    const twinHedge = hedge.twin;
    let index;

    // Step 1: add 1 Vertex and 4 Hedge

    const splitVertex = new Vertex(splitX, splitY);
    vertices.push(splitVertex);

    // hedge
    const h1 = new Hedge(splitVertex, hedge.origin);
    const h2 = new Hedge(twinHedge.origin, splitVertex);
    hedges.push(h1);
    hedges.push(h2);

    // twinHedge
    const h3 = new Hedge(splitVertex, twinHedge.origin);
    const h4 = new Hedge(hedge.origin, splitVertex);
    hedges.push(h3);
    hedges.push(h4);

    // Step 2: link faces

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

    // Step 3: link hedges

    h1.nexthedge = h2;
    h2.prevhedge = h1;

    h3.nexthedge = h4;
    h4.prevhedge = h3;

    h1.prevhedge = hedge.prevhedge !== twinHedge ? hedge.prevhedge : h4;
    h1.prevhedge.nexthedge = h1;

    h2.nexthedge = hedge.nexthedge !== twinHedge ? hedge.nexthedge : h3;
    h2.nexthedge.prevhedge = h2;

    h3.prevhedge = twinHedge.prevhedge !== hedge ? twinHedge.prevhedge : h2;
    h3.prevhedge.nexthedge = h3;

    h4.nexthedge = twinHedge.nexthedge !== hedge ? twinHedge.nexthedge : h1;
    h4.nexthedge.prevhedge = h4;

    h1.twin = h4;
    h2.twin = h3;
    h3.twin = h2;
    h4.twin = h1;

    // Step 4: handle hedgelist in vertex

    splitVertex.hedgelist.push(h2, h4);

    index = hedge.origin.hedgelist.indexOf(hedge);
    hedge.origin.hedgelist.splice(index, 1, h1);

    index = twinHedge.origin.hedgelist.indexOf(twinHedge);
    twinHedge.origin.hedgelist.splice(index, 1, h3);

    // Step 5: remove hedge & twinHedge

    hedge.dispose();
    twinHedge.dispose();

    index = hedges.indexOf(hedge);
    hedges.splice(index, 1);

    index = hedges.indexOf(twinHedge);
    hedges.splice(index, 1);
  }
}

module.exports = DCEL;
