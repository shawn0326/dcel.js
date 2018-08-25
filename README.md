dcel.js
=======================

dcel.js is lightweight JavaScript implementation of [Doubly connected edge list](https://en.wikipedia.org/wiki/Doubly_connected_edge_list), inspired by [dcel(python)](https://github.com/anglyan/dcel).

[demo1](https://shawn0326.github.io/dcel.js/examples/test1.html) ---- 
[demo2](https://shawn0326.github.io/dcel.js/examples/test2.html)

### Usage ###

````html
<script src="dcel.js"></script>
````

````javascript
// points [[x1, y1], [x2, y2], ...]
// edges [[start1, end1], [start2, end2]...] starts and ends are indices of points
var dcel = new dcel(points, edges);
var areas = dcel.areas(); // return internal faces
````

### About Me ###

Blog: [Half Lab](http://www.halflab.me)

Email: shawn0326@163.com

Weibo: [@谢帅shawn](http://weibo.com/shawn0326)