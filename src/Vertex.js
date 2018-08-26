// by this, internal face is ccw
// hedgelist is cw
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

export {Vertex};