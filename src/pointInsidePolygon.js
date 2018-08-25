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

export { pointInsidePolygon, pointsInsidePolygon }