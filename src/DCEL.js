import {Vertex} from './Vertex';
import {Hedge} from './Hedge';
import {Face} from './Face';

/**
 * DCEL
 * @param {Number[]} points [[x1, y1], [x2, y2], ...]
 * @param {Number[]} edges [[start1, end1], [start2, end2]...] starts and ends are indices of points
 */
function DCEL(points, edges) {

    var vertices = [];
    var hedges = [];
    var faces = [];

    var scope = this;

    function init() {

        // Step 1: vertex list creation
        for (var i = 0, l = points.length; i < l; i++) {
            var p = points[i];
            var v = new Vertex(p[0], p[1]);
            v.id = i;
            vertices.push(v);
        }

        // Step 2: hedge list creation. Assignment of twins and vertices
        for (var i = 0, l = edges.length; i < l; i++) {
            var e = edges[i];
            var h1 = new Hedge(vertices[e[0]], vertices[e[1]]);
            var h2 = new Hedge(vertices[e[1]], vertices[e[0]]);
            h1.twin = h2;
            h2.twin = h1;
            vertices[e[1]].hedgelist.push(h1);
            vertices[e[0]].hedgelist.push(h2);
            hedges.push(h2);
            hedges.push(h1);
        }

        // Step 3: Identification of next and prev hedges
        for (var j = 0, ll = vertices.length; j < ll; j++) {
            var v = vertices[j];
            v.sortincident();
            var l = v.hedgelist.length;
            if (l == 0) continue; // skip vertex that has no edges
            if (l < 2) {
                v.hedgelist[0].prevhedge = v.hedgelist[0].twin;
                v.hedgelist[0].twin.nexthedge = v.hedgelist[0];
            } else {
                for(var i = 0; i < l - 1; i++) {
                    v.hedgelist[i].twin.nexthedge = v.hedgelist[i+1];
                    v.hedgelist[i+1].prevhedge = v.hedgelist[i].twin;
                }
                v.hedgelist[l-1].twin.nexthedge = v.hedgelist[0];
                v.hedgelist[0].prevhedge = v.hedgelist[l-1].twin;
            }
        }

        // Step 4: Face assignment
        var provlist = hedges.slice(0);
        var nh = hedges.length;

        while (nh > 0) {
            var h = provlist.pop();
            nh -= 1;
            // We check if the hedge already points to a face
            if (h.face == null) {
                var f = new Face(scope);
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

    init();

    /**
     * return internal faces 
     */
    function areas() {
        var result = [];
        for (var i = 0, l = faces.length; i < l; i++) {
            var f = faces[i];
            if (!f.external) {
                result.push(f);
            }
        }
        return result;
    }

    /**
     * dispose
     */
    function dispose() {
        for (var i = 0, l = vertices.length; i < l; i++) {
            vertices[i].dispose();
        }

        for (var i = 0, l = hedges.length; i < l; i++) {
            hedges[i].dispose();
        }

        for (var i = 0, l = faces.length; i < l; i++) {
            faces[i].dispose();
        }

        vertices.length = 0;
        hedges.length = 0;
        faces.length = 0;
    }

    return {
        vertices: vertices,
        hedges: hedges,
        faces: faces,
        areas: areas,
        dispose: dispose
    };

}

export {DCEL};