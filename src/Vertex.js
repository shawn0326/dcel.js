// by this, internal face is ccw
// hedgelist is cw
function sortByAngle(a, b) {
    return b.angle - a.angle;
}

var counter = 0;

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

    this.id = counter++;

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

export {Vertex};