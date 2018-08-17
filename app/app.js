import {
  $,
  $$,
  chooseRandomIndex,
  chooseRandomFromArray
} from './js/utils.js';

import {
  colors as allColors,
  hexToRGB,
  RGBToHex,
  luminance,
  shade
} from './js/colors.js';

import {
  generate_triangles
} from './js/generators.js';

import './js/trianglify.js';

// general import for css
import './app.css';

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

// Portfolio showcases
if ($('.showcase')) {
  for (const [i, el] of $$('.showcase').entries()) {
    const clrs = allColors[el.dataset.clr || 'random'] || [el.dataset.clr],
          bgClr = clrs.length > 1 ? chooseRandomFromArray(clrs) : clrs[0],
          fgClr = luminance(hexToRGB(bgClr)) > 0.5 ? '#222' : '#fff';

    el.style.setProperty('--bg-color', bgClr);
    el.style.setProperty('--fg-color', fgClr);
    el.style.height = (el.getBoundingClientRect().height - 10) + 'px';
    el.classList.add('loaded');
  }

  $('.showcase-show-more').addEventListener('click', (e) => {
    e.preventDefault();

    $('.showcase-more').classList.remove('hidden');
    $('.showcase-show-more').classList.add('hidden');
  });

  $('.showcase-show-less').addEventListener('click', (e) => {
    e.preventDefault();

    $('.showcase-more').classList.add('hidden');
    $('.showcase-show-more').classList.remove('hidden');
  });

  $('.showcase-more').classList.add('hidden');
}
