# dcel.js

dcel.js is lightweight JavaScript implementation of [Doubly connected edge list](https://en.wikipedia.org/wiki/Doubly_connected_edge_list), inspired by [dcel(python)](https://github.com/anglyan/dcel).

[demo1](https://shawn0326.github.io/dcel.js/examples/test1.html) |
[demo2](https://shawn0326.github.io/dcel.js/examples/test2.html) |
[API](https://shawn0326.github.io/dcel.js/docs/)

## More Features

* get internal face's holes.
* edges modify.

## Import

Use `dcel.js` in your page:

````html
<script src="dcel.js"></script>
````

or import as es6 module:

````javascript
import DCEL from 'dcel';
````

or require as commonjs module:

````javascript
require('dcel');
````

## Usage

````javascript

// points [[x1, y1], [x2, y2], ...]
// edges [[start1, end1], [start2, end2]...] starts and ends are indices of points
const dcel = new DCEL(points, edges);

// return internal faces
const faces = dcel.internalFaces();

// get holes
faces[0].holes

// get area
faces[0].area

// get area except holes
faces[0].areaExceptHoles

// return external faces
dcel.externalFaces();

// modify edges
dcel.addEdge(x1, y1, x2, y2);
dcel.removeEdge(x1, y1, x2, y2);
dcel.splitEdge(x1, y1, x2, y2, splitX, splitY);

````