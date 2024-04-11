# dcel.js

[![NPM Package][npm]][npm-url]

dcel.js is a JavaScript implementation of [Doubly connected edge list](https://en.wikipedia.org/wiki/Doubly_connected_edge_list).
Inspired by [dcel(python)](https://github.com/anglyan/dcel), but with more features.

[Example](https://shawn0326.github.io/dcel.js/examples/index.html) |
[API](https://shawn0326.github.io/dcel.js/docs/)

## Features

* Create a `DCEL` object with points and edges.
* Get internal and external faces of the DCEL.
* Get area of faces.
* Get vertices of faces (clockwise or counterclockwise). 
* Get holes of faces (if there are any).
* Add, remove, split edges to the DCEL.

## Import

Use `dcel.js` (UMD) in your page:

````html
<script src="dcel.js"></script>
````

or import as es6 module:

````javascript
import DCEL from 'dcel.module.js';
````

You can find these files in `build` folder.

## Npm

`dcel-js` is published on npm. You can install it with:

````bash
npm install dcel-js --save
````

This will allow you to import dcel.js using:

````javascript
import DCEL from 'dcel-js';
````
or require as commonjs module:

````javascript
require('dcel-js');
````

## CDN

* https://unpkg.com/dcel-js@latest/build/dcel.js
* https://unpkg.com/dcel-js@latest/build/dcel.module.js
* https://unpkg.com/dcel-js@latest/build/dcel.cjs

## Usage

````javascript

// points [[x1, y1], [x2, y2], ...]
// edges [[start1, end1], [start2, end2]...] starts and ends are indices of points
const dcel = new DCEL(points, edges);

// get internal faces
const faces = dcel.internalFaces();

// get vertices
faces[0].vertexlist

// get holes
faces[0].holes

// get area
faces[0].area

// get area except holes
faces[0].areaExceptHoles

// get external faces
dcel.externalFaces();

// modify edges
dcel.addEdge(x1, y1, x2, y2);
dcel.removeEdge(x1, y1, x2, y2);
dcel.splitEdge(x1, y1, x2, y2, splitX, splitY);

````

[npm]: https://img.shields.io/npm/v/dcel-js
[npm-url]: https://www.npmjs.com/package/dcel-js