// generate triangles
export const generate_triangles = (opts) => {
  const { width, height, color_fcn, cell_size, variance } = {
    width: 600,
    height: 400,
    color_fcn: ([x, y]) => '#000',
    cell_size: 75,
    variance: 0.75,
    ...opts
  };

  // grid generation fcn taken from qrohlf/trianglify
  const generate_grid = (width, height, bleed_x, bleed_y, cell_size, variance, rand_fn) => {
    var w = width + bleed_x;
    var h = height + bleed_y;
    var half_cell_size = cell_size * 0.5;
    var double_v = variance * 2;
    var negative_v = -variance;

    var points = [];
    for (var i = -bleed_x; i < w; i += cell_size) {
      for (var j = -bleed_y; j < h; j += cell_size) {
        var x = (i + half_cell_size) + (rand_fn() * double_v + negative_v);
        var y = (j + half_cell_size) + (rand_fn() * double_v + negative_v);
        points.push([Math.floor(x), Math.floor(y)]);
      }
    }

    return points;
  };

  const points = generate_grid(
    width,
    height,
    ((Math.floor((width + 4 * cell_size) / cell_size) * cell_size) - width) / 2,
    ((Math.floor((height + 4 * cell_size) / cell_size) * cell_size) - height) / 2,
    cell_size,
    cell_size * variance / 2,
    Math.random
  );

  const delaunay_triangles = Delaunator.from(points).triangles;

  let polys = [];
  for (let i = 0; i < delaunay_triangles.length; i += 3) {
    const vertices = [points[delaunay_triangles[i]], points[delaunay_triangles[i + 1]], points[delaunay_triangles[i + 2]]];
    const centroid = [
      (vertices[0][0] + vertices[1][0] + vertices[2][0]) / 3,
      (vertices[0][1] + vertices[1][1] + vertices[2][1]) / 3
    ];

    const color = color_fcn(centroid);

    polys.push([
      color,
      vertices
    ]);
  }

  return polys;
}
