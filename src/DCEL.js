import { Vertex } from "./Vertex.js";
import { Hedge } from "./Hedge.js";
import { Face } from "./Face.js";

/**
 * The Doubly-Connected Edge List (DCEL) data structure.
 * @see {@link https://en.wikipedia.org/wiki/Doubly_connected_edge_list}
 */
class DCEL {
  /**
   * Create a new DCEL.
   * @param {Array} [points=] - The vertices of the DCEL. [[x1, y1], [x2, y2], ...].
   * @param {Array} [edges=] - The edges of the DCEL. [[start1, end1], [start2, end2]...]. Starts and Ends are indices of vertices.
   */
  constructor(points, edges) {
    /**
     * The vertices of the DCEL.
     * @type {Vertex[]}
     */
    this.vertices = [];

    /**
     * The half edges of the DCEL.
     * @type {Hedge[]}
     */
    this.hedges = [];

    /**
     * The faces of the DCEL.
     * @type {Face[]}
     */
    this.faces = [];

    if (points && edges) {
      this.setDatas(points, edges);
    }
  }

  /**
   * Set the vertices and edges of the DCEL.
   * @param {Array} [points=] - The vertices of the DCEL. [[x1, y1], [x2, y2], ...].
   * @param {Array} [edges=] - The edges of the DCEL. [[start1, end1], [start2, end2]...]. Starts and Ends are indices of vertices.
   */
  setDatas(points, edges) {
    const vertices = this.vertices;
    const hedges = this.hedges;
    const faces = this.faces;

    // Step 1: vertex list creation
    for (let i = 0, l = points.length; i < l; i++) {
      const p = points[i];
      const v = new Vertex(p[0], p[1]);
      vertices.push(v);
    }

    // Step 2: hedge list creation. Assignment of twins and vertices
    for (let i = 0, l = edges.length; i < l; i++) {
      const e = edges[i];
      const h1 = new Hedge(vertices[e[0]], vertices[e[1]]);
      const h2 = new Hedge(vertices[e[1]], vertices[e[0]]);
      h1.twin = h2;
      h2.twin = h1;
      vertices[e[1]].hedgelist.push(h1);
      vertices[e[0]].hedgelist.push(h2);
      hedges.push(h2);
      hedges.push(h1);
    }

    // Step 3: Identification of next and prev hedges
    for (let j = 0, ll = vertices.length; j < ll; j++) {
      const v = vertices[j];
      v.sortincident();
      const l = v.hedgelist.length;
      if (l == 0) continue; // skip vertex that has no edges
      if (l < 2) {
        v.hedgelist[0].prevhedge = v.hedgelist[0].twin;
        v.hedgelist[0].twin.nexthedge = v.hedgelist[0];
      } else {
        for (let i = 0; i < l - 1; i++) {
          v.hedgelist[i].twin.nexthedge = v.hedgelist[i + 1];
          v.hedgelist[i + 1].prevhedge = v.hedgelist[i].twin;
        }
        v.hedgelist[l - 1].twin.nexthedge = v.hedgelist[0];
        v.hedgelist[0].prevhedge = v.hedgelist[l - 1].twin;
      }
    }

    // Step 4: Face assignment
    const provlist = hedges.slice(0);
    let nh = hedges.length;

    while (nh > 0) {
      let h = provlist.pop();
      nh -= 1;
      // We check if the hedge already points to a face
      if (h.face == null) {
        const f = new Face(this);
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

  /**
   * Get all internal (area > 0) faces
   * @returns {Face[]} - Internal faces
   */
  internalFaces() {
    const result = [],
      faces = this.faces;
    for (let i = 0, l = faces.length; i < l; i++) {
      const f = faces[i];
      if (f.internal) {
        result.push(f);
      }
    }
    return result;
  }

  /**
   * Get all external (area <= 0) faces
   * @returns {Face[]} - External faces
   */
  externalFaces() {
    const result = [],
      faces = this.faces;
    for (let i = 0, l = faces.length; i < l; i++) {
      const f = faces[i];
      if (f.external) {
        result.push(f);
      }
    }
    return result;
  }

  /**
   * Dispose old datas.
   */
  dispose() {
    const vertices = this.vertices;
    const hedges = this.hedges;
    const faces = this.faces;

    for (let i = 0, l = vertices.length; i < l; i++) {
      vertices[i].dispose();
    }

    for (let i = 0, l = hedges.length; i < l; i++) {
      hedges[i].dispose();
    }

    for (let i = 0, l = faces.length; i < l; i++) {
      faces[i].dispose();
    }

    vertices.length = 0;
    hedges.length = 0;
    faces.length = 0;
  }

  /**
   * Find vertex by x and y coordinate.
   * @param {number} x - The x coordinate of the vertex.
   * @param {number} y - The y coordinate of the vertex.
   * @returns {Vertex|null} - The vertex.
   */
  findVertex(x, y) {
    const vertices = this.vertices;
    let vertex;
    for (let i = 0, l = vertices.length; i < l; i++) {
      vertex = vertices[i];
      if (vertex.x === x && vertex.y === y) {
        return vertex;
      }
    }

    return null;
  }

  /**
   * Find half edge by start and end vertices coordinates.
   * @param {number} x1 - The x coordinate of the start vertex.
   * @param {number} y1 - The y coordinate of the start vertex.
   * @param {number} x2 - The x coordinate of the end vertex.
   * @param {number} y2 - The y coordinate of the end vertex.
   * @returns {Hedge|null} - The half edge.
   */
  findHedge(x1, y1, x2, y2) {
    const hedges = this.hedges;
    let hedge, twinHedge;
    for (let i = 0, l = hedges.length; i < l; i++) {
      hedge = hedges[i];
      twinHedge = hedge.twin;
      if (
        hedge.origin.x === x1 &&
        hedge.origin.y === y1 &&
        twinHedge.origin.x === x2 &&
        twinHedge.origin.y === y2
      ) {
        return hedge;
      }
    }

    return null;
  }

  /**
   * Add an edge to the DCEL.
   * @param {number} x1 - The x coordinate of the start vertex.
   * @param {number} y1 - The y coordinate of the start vertex.
   * @param {number} x2 - The x coordinate of the end vertex.
   * @param {number} y2 - The y coordinate of the end vertex.
   */
  addEdge(x1, y1, x2, y2) {
    const vertices = this.vertices;
    const hedges = this.hedges;
    const faces = this.faces;

    let v1Created = false;
    let v2Created = false;

    let holesDirty = false;

    // Step 1: try add/find vertex

    let v1 = this.findVertex(x1, y1);

    if (!v1) {
      v1 = new Vertex(x1, y1);
      vertices.push(v1);
      v1Created = true;
    }

    let v2 = this.findVertex(x2, y2);

    if (!v2) {
      v2 = new Vertex(x2, y2);
      vertices.push(v2);
      v2Created = true;
    }

    // Step 2: add hedge

    const h1 = new Hedge(v2, v1);
    hedges.push(h1);
    v1.hedgelist.push(h1);
    v1.sortincident();

    const h2 = new Hedge(v1, v2);
    hedges.push(h2);
    v2.hedgelist.push(h2);
    v2.sortincident();

    // Step 3: link hedges

    h1.twin = h2;
    h2.twin = h1;

    if (v1Created) {
      h1.prevhedge = h2;
      h2.nexthedge = h1;
    } else {
      const index = v1.hedgelist.indexOf(h1);
      let hprev, hnext;
      if (index === 0) {
        hprev = v1.hedgelist[v1.hedgelist.length - 1];
        hnext = v1.hedgelist[(index + 1) % v1.hedgelist.length];
      } else {
        hprev = v1.hedgelist[index - 1];
        hnext = v1.hedgelist[(index + 1) % v1.hedgelist.length];
      }

      h1.prevhedge = hprev.twin;
      hprev.twin.nexthedge = h1;
      h2.nexthedge = hnext;
      hnext.prevhedge = h2;
    }

    if (v2Created) {
      h2.prevhedge = h1;
      h1.nexthedge = h2;
    } else {
      const index = v2.hedgelist.indexOf(h2);
      let hprev, hnext;
      if (index === 0) {
        hprev = v2.hedgelist[v2.hedgelist.length - 1];
        hnext = v2.hedgelist[(index + 1) % v2.hedgelist.length];
      } else {
        hprev = v2.hedgelist[index - 1];
        hnext = v2.hedgelist[(index + 1) % v2.hedgelist.length];
      }

      h2.prevhedge = hprev.twin;
      hprev.twin.nexthedge = h2;
      h1.nexthedge = hnext;
      hnext.prevhedge = h1;
    }

    // Step 4: remove face

    const head1 = h1.nexthedge;
    const head2 = h2.nexthedge;

    if (head1.face) {
      const index = faces.indexOf(head1.face);
      index > -1 && faces.splice(index, 1);
      head1.face.dispose();
      if (head1.face.area <= 0) {
        holesDirty = true;
      }
    }

    if (head2.face) {
      const index = faces.indexOf(head2.face);
      index > -1 && faces.splice(index, 1);
      head2.face.dispose();
      if (head2.face.area <= 0) {
        holesDirty = true;
      }
    }

    // Step 5: add new face

    const face1 = new Face(this);
    face1.wedge = head1;

    let face2 = new Face(this);
    face2.wedge = head2;
    if (face1.equals(face2)) {
      face2.dispose();
      face2 = null;
    }

    // set hedge face

    if (face1) {
      let h = face1.wedge;
      h.face = face1;
      // And we traverse the boundary of the new face
      while (h.nexthedge !== face1.wedge) {
        h = h.nexthedge;
        h.face = face1;
      }

      if (face1.area <= 0) {
        holesDirty = true;
      }

      faces.push(face1);
    }

    if (face2) {
      let h = face2.wedge;
      h.face = face2;
      // And we traverse the boundary of the new face
      while (h.nexthedge !== face2.wedge) {
        h = h.nexthedge;
        h.face = face2;
      }

      if (face2.area <= 0) {
        holesDirty = true;
      }

      faces.push(face2);
    }

    // Step 6: mark hole dirty

    if (holesDirty) {
      for (let i = 0, l = faces.length; i < l; i++) {
        faces[i]._holesDirty = true;
      }
    }
  }

  /**
   * Remove an edge from the DCEL.
   * @param {number} x1 - The x coordinate of the start vertex.
   * @param {number} y1 - The y coordinate of the start vertex.
   * @param {number} x2 - The x coordinate of the end vertex.
   * @param {number} y2 - The y coordinate of the end vertex.
   */
  removeEdge(x1, y1, x2, y2) {
    const vertices = this.vertices;
    const hedges = this.hedges;
    const faces = this.faces;

    const hedge = this.findHedge(x1, y1, x2, y2);

    if (!hedge) {
      console.warn("removeEdge: found no hedge to split!", x1, y1, x2, y2);
    }

    const twinHedge = hedge.twin;

    // store new faces head
    const head1 = hedge.nexthedge;
    const head2 = twinHedge.nexthedge;
    let useHead1 = true;
    let useHead2 = true;
    let holesDirty = false;

    let index;

    // Step 1: remove hedge from hedges

    index = hedges.indexOf(hedge);
    hedges.splice(index, 1);

    index = hedges.indexOf(twinHedge);
    hedges.splice(index, 1);

    // Step 2: remove face from faces
    // notice that two hedges may belong to the same face

    index = faces.indexOf(hedge.face);
    index > -1 && faces.splice(index, 1);
    hedge.face.dispose();
    if (hedge.face.area <= 0) {
      holesDirty = true;
    }

    index = faces.indexOf(twinHedge.face);
    index > -1 && faces.splice(index, 1);
    twinHedge.face.dispose();
    if (twinHedge.face.area <= 0) {
      holesDirty = true;
    }

    // Step 3: remove hedge from vertex.hedgelist
    // if vertex.hedgelist.length === 0 remove the vertex
    // else link the next edge

    index = hedge.origin.hedgelist.indexOf(hedge);
    hedge.origin.hedgelist.splice(index, 1);
    if (hedge.origin.hedgelist.length > 0) {
      let h1, h2;
      if (index === 0) {
        h1 = hedge.origin.hedgelist[hedge.origin.hedgelist.length - 1];
        h2 = hedge.origin.hedgelist[index];
      } else {
        h1 = hedge.origin.hedgelist[index - 1];
        h2 = hedge.origin.hedgelist[index % hedge.origin.hedgelist.length];
      }
      h2.prevhedge = h1.twin;
      h1.twin.nexthedge = h2;
    } else {
      const _index = vertices.indexOf(hedge.origin);
      vertices.splice(_index, 1);
      hedge.origin.dispose();
      useHead2 = false;
    }

    index = twinHedge.origin.hedgelist.indexOf(twinHedge);
    twinHedge.origin.hedgelist.splice(index, 1);
    if (twinHedge.origin.hedgelist.length > 0) {
      let h1, h2;
      if (index === 0) {
        h1 = twinHedge.origin.hedgelist[twinHedge.origin.hedgelist.length - 1];
        h2 = twinHedge.origin.hedgelist[index];
      } else {
        h1 = twinHedge.origin.hedgelist[index - 1];
        h2 =
          twinHedge.origin.hedgelist[index % twinHedge.origin.hedgelist.length];
      }
      h2.prevhedge = h1.twin;
      h1.twin.nexthedge = h2;
    } else {
      const _index = vertices.indexOf(twinHedge.origin);
      vertices.splice(_index, 1);
      twinHedge.origin.dispose();
      useHead1 = false;
    }

    hedge.dispose();
    twinHedge.dispose();

    // Step 4: add faces

    const face1 = useHead1 ? new Face(this) : null;
    if (face1) {
      face1.wedge = head1;
    }

    let face2 = useHead2 ? new Face(this) : null;
    if (face2) {
      face2.wedge = head2;
    }

    if (face1 && face2) {
      if (face1.equals(face2)) {
        face2.dispose();
        face2 = null;
      }
    }

    // set hedge face

    if (face1) {
      let h = face1.wedge;
      h.face = face1;
      // And we traverse the boundary of the new face
      while (h.nexthedge !== face1.wedge) {
        h = h.nexthedge;
        h.face = face1;
      }

      if (face1.area <= 0) {
        holesDirty = true;
      }

      faces.push(face1);
    }

    if (face2) {
      let h = face2.wedge;
      h.face = face2;
      // And we traverse the boundary of the new face
      while (h.nexthedge !== face2.wedge) {
        h = h.nexthedge;
        h.face = face2;
      }

      if (face2.area <= 0) {
        holesDirty = true;
      }

      faces.push(face2);
    }

    // Step 5: mark hole dirty

    if (holesDirty) {
      for (let i = 0, l = faces.length; i < l; i++) {
        faces[i]._holesDirty = true;
      }
    }
  }

  /**
   * Split an edge of the DCEL.
   * @param {number} x1 - The x coordinate of the start vertex.
   * @param {number} y1 - The y coordinate of the start vertex.
   * @param {number} x2 - The x coordinate of the end vertex.
   * @param {number} y2 - The y coordinate of the end vertex.
   * @param {number} splitX - The x coordinate of the split vertex.
   * @param {number} splitY - The y coordinate of the split vertex.
   */
  splitEdge(x1, y1, x2, y2, splitX, splitY) {
    const vertices = this.vertices;
    const hedges = this.hedges;

    const hedge = this.findHedge(x1, y1, x2, y2);

    if (!hedge) {
      console.warn("splitEdge: found no hedge to split!", x1, y1, x2, y2);
    }

    const twinHedge = hedge.twin;
    let index;

    // Step 1: add 1 Vertex and 4 Hedge

    const splitVertex = new Vertex(splitX, splitY);
    vertices.push(splitVertex);

    // hedge
    const h1 = new Hedge(splitVertex, hedge.origin);
    const h2 = new Hedge(twinHedge.origin, splitVertex);
    hedges.push(h1);
    hedges.push(h2);

    // twinHedge
    const h3 = new Hedge(splitVertex, twinHedge.origin);
    const h4 = new Hedge(hedge.origin, splitVertex);
    hedges.push(h3);
    hedges.push(h4);

    // Step 2: link faces

    if (hedge.face.wedge === hedge) {
      hedge.face.wedge = h1;
    }
    hedge.face._vertexlistDirty = true; // only vertexlist dirty

    h1.face = hedge.face;
    h2.face = hedge.face;

    if (twinHedge.face.wedge === twinHedge) {
      twinHedge.face.wedge = h3;
    }
    twinHedge.face._vertexlistDirty = true; // only vertexlist dirty

    h3.face = twinHedge.face;
    h4.face = twinHedge.face;

    // Step 3: link hedges

    h1.nexthedge = h2;
    h2.prevhedge = h1;

    h3.nexthedge = h4;
    h4.prevhedge = h3;

    h1.prevhedge = hedge.prevhedge !== twinHedge ? hedge.prevhedge : h4;
    h1.prevhedge.nexthedge = h1;

    h2.nexthedge = hedge.nexthedge !== twinHedge ? hedge.nexthedge : h3;
    h2.nexthedge.prevhedge = h2;

    h3.prevhedge = twinHedge.prevhedge !== hedge ? twinHedge.prevhedge : h2;
    h3.prevhedge.nexthedge = h3;

    h4.nexthedge = twinHedge.nexthedge !== hedge ? twinHedge.nexthedge : h1;
    h4.nexthedge.prevhedge = h4;

    h1.twin = h4;
    h2.twin = h3;
    h3.twin = h2;
    h4.twin = h1;

    // Step 4: handle hedgelist in vertex

    splitVertex.hedgelist.push(h2, h4);

    index = hedge.origin.hedgelist.indexOf(hedge);
    hedge.origin.hedgelist.splice(index, 1, h1);

    index = twinHedge.origin.hedgelist.indexOf(twinHedge);
    twinHedge.origin.hedgelist.splice(index, 1, h3);

    // Step 5: remove hedge & twinHedge

    hedge.dispose();
    twinHedge.dispose();

    index = hedges.indexOf(hedge);
    hedges.splice(index, 1);

    index = hedges.indexOf(twinHedge);
    hedges.splice(index, 1);
  }
}

export default DCEL;
