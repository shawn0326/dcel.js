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
    this.id = counter++;

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

let counter = 0;

// Get the angle of half edge.
function hangle(dx, dy) {
  const l = Math.sqrt(dx * dx + dy * dy);

  if (dy > 0) {
    return Math.acos(dx / l);
  } else {
    return 2 * Math.PI - Math.acos(dx / l);
  }
}

export { Hedge };
