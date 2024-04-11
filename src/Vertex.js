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
    this.id = counter++;

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

let counter = 0;

function sortByAngle(a, b) {
  return b.angle - a.angle;
}

export { Vertex };
