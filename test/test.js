var DCEL = require('../build/dcel.c.js').DCEL;
var assert = require('assert');

describe('DCEL: addEdge', function() {

	var dcel = new DCEL();

	it('add one edge', function() {
		dcel.addEdge(-1, 0, 1, 0);
		assert.equal(dcel.faces.length, 1);
	});
	
	it('add two edge', function() {
		dcel.addEdge(1, 1, 1, 0);
		assert.equal(dcel.faces.length, 1);
	});

	it('add three edge: triangle has two faces', function() {
		dcel.addEdge(1, 1, -1, 0);
		assert.equal(dcel.faces.length, 2);
	});

});

describe('DCEL: removeEdge', function() {

	var dcel = new DCEL([
		[-1, 1], [0, 1], [1, 1],
		[-1, -1], [0, -1], [1, -1]
	],[
		[0, 1], [1, 2], [2, 5],
		[5, 4], [4, 3], [3, 0],
		[1, 4]
	]);

	it('init two areas', function() {
		assert.equal(dcel.internalFaces().length, 2);
	});

	it('remove one edge', function() {
		dcel.removeEdge(0, 1, 0, -1);
		assert.equal(dcel.internalFaces().length, 1);
	});

	it('remove two edges', function() {
		dcel.removeEdge(0, 1, 1, 1);
		assert.equal(dcel.externalFaces().length, 1);
	});

	it('only left a line', function() {
		assert.equal(dcel.faces[0].area, 0);
	});

});

describe('DCEL: addEdge & test holes', function() {

	var dcel = new DCEL([
		[-2, 2], [2, 2],
		[-2, -2], [2, -2],
		[-1, 1], [1, 1],
		[-1, -1], [1, -1],
	],[
		[0, 1], [1, 3], [3, 2], [2, 0],
		[4, 5], [5, 7], [7, 6], [6, 4]
	]);

	it('init two internal faces', function() {
		assert.equal(dcel.internalFaces().length, 2);
	});

	it('one is hole', function() {
		assert.equal(dcel.internalFaces()[0].holes.length + dcel.internalFaces()[1].holes.length, 1);
	});

	it('add a conner edge still two internal faces', function() {
		dcel.addEdge(-2, 2, -1, 1);
		assert.equal(dcel.internalFaces().length, 2);
	});

	it('area is 16', function() {
		assert.equal(dcel.internalFaces()[0].area + dcel.internalFaces()[1].area, 16);
	});

	it('but no holes', function() {
		assert.equal(dcel.internalFaces()[0].holes.length + dcel.internalFaces()[1].holes.length, 0);
	});

});

describe('DCEL: removeEdge & test holes', function() {

	var dcel = new DCEL([
		[-2, 2], [2, 2],
		[-2, -2], [2, -2],
		[-1, 1], [1, 1],
		[-1, -1], [1, -1],
	],[
		[0, 1], [1, 3], [3, 2], [2, 0],
		[4, 5], [5, 7], [7, 6], [6, 4],
		[0, 4]
	]);

	it('init two internal faces', function() {
		assert.equal(dcel.internalFaces().length, 2);
	});

	it('area is 16', function() {
		assert.equal(dcel.internalFaces()[0].area + dcel.internalFaces()[1].area, 16);
	});

	it('no holes', function() {
		assert.equal(dcel.internalFaces()[0].holes.length + dcel.internalFaces()[1].holes.length, 0);
	});

	it('remove the conner edge still two internal faces', function() {
		dcel.removeEdge(-2, 2, -1, 1);
		assert.equal(dcel.internalFaces().length, 2);
	});

	it('one is hole', function() {
		assert.equal(dcel.internalFaces()[0].holes.length + dcel.internalFaces()[1].holes.length, 1);
	});

});