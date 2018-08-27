// half edge angle
function hangle(dx, dy) {
    var l = Math.sqrt(dx * dx + dy * dy);

    if (dy > 0) {
        return Math.acos(dx / l);
    } else {
        return 2 * Math.PI - Math.acos(dx / l);
    }
}

var counter = 0;

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
    this.id = counter++;
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

export {Hedge};