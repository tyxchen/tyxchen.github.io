import {
  $,
  $$,
  chooseRandomIndex,
  chooseRandomFromArray
} from './js/utils.js';

import {
  generate_triangles
} from './js/generators.js';

import './js/trianglify.js';

// general import for css
import './app.css';

const ABCDEF = "";

// Basic router functionality

//document.

// Toggle theme
$('#toggle-theme').addEventListener('click', function(e) {
  e.preventDefault();

  let prevTheme = localStorage.getItem('theme') || 'light',
      newTheme;

  if (prevTheme === 'dark') {
    newTheme = 'light';
  } else {
    newTheme = 'dark';
  }

  this.textContent = `Switch to ${prevTheme} mode`;

  document.documentElement.dataset.theme = newTheme;
  localStorage.setItem('theme', newTheme);
});

if (localStorage.getItem('theme') === 'dark') {
  $('#toggle-theme').textContent = 'Switch to light mode';
}

// Page-specific

// Portfolio - trianglify background
if ($('.showcase')) {
  const canvas = document.createElement('canvas'),
        ctx = canvas.getContext('2d'),
        colors = ['#ccc', '#ddd', '#eee', '#fff'];

  canvas.width = $('main').getBoundingClientRect().width;
  canvas.height = window.innerHeight;

  const polys = generate_triangles({
    width: canvas.width,
    height: canvas.height,
    color_fcn: () => chooseRandomFromArray(colors)
  });

  ctx.lineWidth = 1.51;

  for (const [clr, poly] of polys) {
    ctx.fillStyle = ctx.strokeStyle = clr;
    ctx.beginPath();
    ctx.moveTo.apply(ctx, poly[0]);
    ctx.lineTo.apply(ctx, poly[1]);
    ctx.lineTo.apply(ctx, poly[2]);
    ctx.fill();
    ctx.stroke();
  }

  const img = canvas.toDataURL('image/png');

  for (const [i, el] of $$('.showcase').entries()) {
    el.style.backgroundImage = `url(${img})`;
  }
}
