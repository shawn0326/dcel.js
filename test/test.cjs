const DCEL = require("../build/dcel.cjs");
const assert = require("assert");

describe("DCEL: Add Edge Test.", function () {
  const dcel = new DCEL();

  /**
   * +————————+
   */
  it("Add first edge: has one face.", function () {
    dcel.addEdge(-1, 0, 1, 0);
    assert.equal(dcel.faces.length, 1);
  });

  /**
   *          +
   *          |
   *          |
   *          |
   * +————————+
   */
  it("Add second edge: has one face too.", function () {
    dcel.addEdge(1, 1, 1, 0);
    assert.equal(dcel.faces.length, 1);
  });

  /**
   *      +
   *    / |
   *   /  |
   *  /   |
   * +————+
   */
  it("Add third edge: triangle has two faces.", function () {
    dcel.addEdge(1, 1, -1, 0);
    assert.equal(dcel.faces.length, 2);
  });

  it("Dispose.", function () {
    dcel.dispose();
    assert.equal(dcel.faces.length, 0);
  });
});

describe("DCEL: Remove Edge Test.", function () {
  /**
   * +————+————+
   * |    |    |
   * |    |    |
   * |    |    |
   * |    |    |
   * +————+————+
   */
  const dcel = new DCEL(
    [
      [-1, 1],
      [0, 1],
      [1, 1],
      [-1, -1],
      [0, -1],
      [1, -1],
    ],
    [
      [0, 1],
      [1, 2],
      [2, 5],
      [5, 4],
      [4, 3],
      [3, 0],
      [1, 4],
    ]
  );

  it("Init: has two internal faces.", function () {
    assert.equal(dcel.internalFaces().length, 2);
  });

  /**
   * +————+————+
   * |         |
   * |         |
   * |         |
   * |         |
   * +————+————+
   */
  it("Remove first edge: has one internal face.", function () {
    dcel.removeEdge(0, 1, 0, -1);
    assert.equal(dcel.internalFaces().length, 1);
  });

  /**
   * +————+    +
   * |         |
   * |         |
   * |         |
   * |         |
   * +————+————+
   */
  it("Remove second edge: has one external face and no area.", function () {
    dcel.removeEdge(0, 1, 1, 1);
    assert.equal(dcel.internalFaces().length, 0);
    assert.equal(dcel.externalFaces().length, 1);
    assert.equal(dcel.externalFaces()[0].area, 0);
  });

  it("Dispose.", function () {
    dcel.dispose();
    assert.equal(dcel.faces.length, 0);
  });
});

describe("DCEL: Add edge to test holes.", function () {
  /**
   * +————————+
   * |        |
   * |  +——+  |
   * |  |  |  |
   * |  +——+  |
   * |        |
   * +————————+
   */
  const dcel = new DCEL(
    [
      [-2, 2],
      [2, 2],
      [-2, -2],
      [2, -2],
      [-1, 1],
      [1, 1],
      [-1, -1],
      [1, -1],
    ],
    [
      [0, 1],
      [1, 3],
      [3, 2],
      [2, 0],
      [4, 5],
      [5, 7],
      [7, 6],
      [6, 4],
    ]
  );

  it("Init: has two internal faces.", function () {
    assert.equal(dcel.internalFaces().length, 2);
  });

  it("And one has a hole.", function () {
    assert.equal(
      dcel.internalFaces()[0].holes.length +
        dcel.internalFaces()[1].holes.length,
      1
    );
  });

  it("All area is 20.", function () {
    assert.equal(
      dcel.internalFaces()[0].area + dcel.internalFaces()[1].area,
      20
    );
  });

  it("All area except holes is 16.", function () {
    assert.equal(
      dcel.internalFaces()[0].areaExceptHoles +
        dcel.internalFaces()[1].areaExceptHoles,
      16
    );
  });

  /**
   * +————————+
   * | \      |
   * |  +——+  |
   * |  |  |  |
   * |  +——+  |
   * |        |
   * +————————+
   */
  it("Add a conner edge: still has two internal faces", function () {
    dcel.addEdge(-2, 2, -1, 1);
    assert.equal(dcel.internalFaces().length, 2);
  });

  it("And no one have holes.", function () {
    assert.equal(
      dcel.internalFaces()[0].holes.length +
        dcel.internalFaces()[1].holes.length,
      0
    );
  });

  it("All area is 16.", function () {
    assert.equal(
      dcel.internalFaces()[0].area + dcel.internalFaces()[1].area,
      16
    );
  });

  it("Dispose.", function () {
    dcel.dispose();
    assert.equal(dcel.faces.length, 0);
  });
});

describe("DCEL: Remove edge to test holes.", function () {
  /**
   * +————————+
   * | \      |
   * |  +——+  |
   * |  |  |  |
   * |  +——+  |
   * |        |
   * +————————+
   */
  const dcel = new DCEL(
    [
      [-2, 2],
      [2, 2],
      [-2, -2],
      [2, -2],
      [-1, 1],
      [1, 1],
      [-1, -1],
      [1, -1],
    ],
    [
      [0, 1],
      [1, 3],
      [3, 2],
      [2, 0],
      [4, 5],
      [5, 7],
      [7, 6],
      [6, 4],
      [0, 4],
    ]
  );

  it("Init: has two internal faces.", function () {
    assert.equal(dcel.internalFaces().length, 2);
  });

  it("All area is 16.", function () {
    assert.equal(
      dcel.internalFaces()[0].area + dcel.internalFaces()[1].area,
      16
    );
  });

  it("And no holes.", function () {
    assert.equal(
      dcel.internalFaces()[0].holes.length +
        dcel.internalFaces()[1].holes.length,
      0
    );
  });

  /**
   * +————————+
   * |        |
   * |  +——+  |
   * |  |  |  |
   * |  +——+  |
   * |        |
   * +————————+
   */
  it("Remove the conner edge: still two internal faces", function () {
    dcel.removeEdge(-2, 2, -1, 1);
    assert.equal(dcel.internalFaces().length, 2);
  });

  it("But one has a hole.", function () {
    assert.equal(
      dcel.internalFaces()[0].holes.length +
        dcel.internalFaces()[1].holes.length,
      1
    );
  });

  it("All area is 20.", function () {
    assert.equal(
      dcel.internalFaces()[0].area + dcel.internalFaces()[1].area,
      20
    );
  });

  it("All area except holes is 16.", function () {
    assert.equal(
      dcel.internalFaces()[0].areaExceptHoles +
        dcel.internalFaces()[1].areaExceptHoles,
      16
    );
  });
});
