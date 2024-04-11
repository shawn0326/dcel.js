import { AABB } from "./AABB.js";

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

export { Face };
