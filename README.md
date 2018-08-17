decl.js
=======================

decl.js is lightweight JavaScript implementation of [Doubly connected edge list](https://en.wikipedia.org/wiki/Doubly_connected_edge_list), inspired by [decl(python)](https://github.com/anglyan/dcel).

[demo1](https://shawn0326.github.io/decl.js/examples/test1.html) ---- 
[demo2](https://shawn0326.github.io/decl.js/examples/test2.html)

### Usage ###

````html
<script src="decl.js"></script>
````

````javascript
// points [[x1, y1], [x2, y2], ...]
// edges [[start1, end1], [start2, end2]...] starts and ends are indices of points
var decl = new DECL(points, edges);
var areas = decl.areas(); // return internal faces
````

### About Me ###

Blog: [Half Lab](http://www.halflab.me)

Email: shawn0326@163.com

Weibo: [@谢帅shawn](http://weibo.com/shawn0326)