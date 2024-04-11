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

export { AABB };
