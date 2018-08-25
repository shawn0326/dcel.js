/**
 * AABB 
 */
function AABB() {

    this.minX = + Infinity;
    this.minY = + Infinity;

    this.maxX = - Infinity;
    this.maxY = - Infinity;

}

Object.defineProperties(AABB.prototype, {

    width: {

        get: function() {
            return this.maxX - this.minX;
        }

    },

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

export {AABB};