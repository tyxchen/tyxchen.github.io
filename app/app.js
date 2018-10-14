import {
  $,
  $$,
  chooseRandomIndex,
  chooseRandomFromArray,
  letterOffsets
} from './js/utils.js';

import {
  colors as allColors,
  hexToRGB,
  RGBToHex,
  luminance,
  mix
} from './js/colors.js';

import {
  generate_triangles
} from './js/generators.js';

import Resizer from './js/resizer.js';

import './js/trianglify.js';

// general import for css
import './app.css';

{
  let title = $('#title:not(.trianglify)');
  if (title) {
    title.style.textIndent = letterOffsets[title.textContent[0]] + 'em';
  }
}

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

if ($('.site-header__menu-toggler')) {
  $('.site-header__menu-toggler').addEventListener('click', (e) => {
    e.preventDefault();

    $('.site-header__menu-background').style.transform = $('body').classList.contains('menu-open') ?
      'scale(0)' :
      `scale(${
        2 * Math.sqrt(window.innerHeight * window.innerHeight + window.innerWidth * window.innerWidth) / 5
      })`;

    $('body').classList.toggle('menu-open');
  });
}

// Page-specific

// Portfolio showcases
if ($('.showcase')) {
  for (const [i, el] of $$('.showcase').entries()) {
    const clrs = allColors[el.dataset.clr || 'random'] || [el.dataset.clr],
          bgClr = clrs.length > 1 ? chooseRandomFromArray(clrs) : clrs[0],
          fgClr = luminance(hexToRGB(bgClr)) > 0.5 ? '#222' : '#fff';
    let dims = el.getBoundingClientRect();

    async function drawBg() {
      const canvas = $(el, '.showcase-canvas'),
            ctx = canvas.getContext('2d'),
            mixClrs = [
              [0x66, 0x66, 0x66],
              [0x77, 0x77, 0x77],
              [0x88, 0x88, 0x88],
              [0x99, 0x99, 0x99]
            ].map(c => RGBToHex(mix(hexToRGB(bgClr), c, .3))),
            polys = generate_triangles({
              width: dims.width,
              height: dims.height,
              color_fcn: () => chooseRandomFromArray(mixClrs)
            });

      canvas.width = dims.width;
      canvas.height = dims.height;

      for (const [clr, poly] of polys) {
        ctx.fillStyle = ctx.strokeStyle = clr;
        ctx.beginPath();
        ctx.moveTo(...poly[0]);
        ctx.lineTo(...poly[1]);
        ctx.lineTo(...poly[2]);
        ctx.fill();
        ctx.stroke();
      }
    }

    el.style.setProperty('--bg-color', bgClr);
    el.style.setProperty('--fg-color', fgClr);
    el.style.height = dims.height + 'px';

    el.classList.add('loaded');

    drawBg();

    if (location.hash.slice(1) === el.id) {
      const listener = () => {
        location.hash = 'null';
        history.replaceState({}, '', location.pathname);
        document.removeEventListener('click', listener);
      };
      document.addEventListener('click', listener);
    }

    Resizer.addListener(() => {
      const wasHidden = $('.showcase-more').classList.contains('hidden');

      if (wasHidden) {
        $('.showcase-more').classList.remove('hidden');
      }
      el.style.height = 'auto';
      el.classList.remove('loaded');

      dims = el.getBoundingClientRect();

      el.classList.add('loaded');
      el.style.height = dims.height + 'px';
      if (wasHidden) {
        $('.showcase-more').classList.add('hidden');
      }

      drawBg();
    });
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

// Image carousel

if ($('.image-carousel')) {
  for (const carousel of $$('.image-carousel')) {
    const pictures = $$(carousel, 'picture').map(p => p.dataset.id);
    let currentPic = pictures.indexOf(carousel.dataset.start);

    const loadPic = (pic) => {
      currentPic = pic
      carousel.dataset.start = pictures[pic];

      $(carousel, '.image-carousel-current').classList.remove('image-carousel-current');
      $(carousel, `[data-id="${pictures[pic]}"]`).classList.add('image-carousel-current');

      $(carousel, '.image-carousel-container').style.transform = `translateX(-${pic * carousel.getBoundingClientRect().width}px)`;
      $(carousel, '.image-carousel-pagination-current').textContent = pic + 1;

      $(carousel, '.image-carousel-lightbox img').src = $(carousel, `.image-carousel-current img`).src;
    };

    for (const img of $$(carousel, 'picture img')) {
      img.style.width = (carousel.getBoundingClientRect().width - 10) + 'px';
    }

    if ($(carousel, '.image-carousel-controls')) {
      const prevBtn = $(carousel, '.image-carousel-prev'),
            nextBtn = $(carousel, '.image-carousel-next');

      prevBtn.addEventListener('click', (e) => {
        e.preventDefault();
        loadPic((currentPic - 1 + pictures.length) % pictures.length);
      });

      nextBtn.addEventListener('click', (e) => {
        e.preventDefault();
        loadPic((currentPic + 1) % pictures.length);
      });
    }

    $(carousel, '.image-carousel-container').addEventListener('click', () => {
      $('.image-carousel-lightbox').classList.remove('hidden')
    });

    $(carousel, '.image-carousel-lightbox').addEventListener('click', () => {
      $('.image-carousel-lightbox').classList.add('hidden')
    });

    loadPic(currentPic);

    Resizer.addListener(() => {
      for (const img of $$(carousel, 'picture img')) {
        img.style.width = (carousel.getBoundingClientRect().width - 10) + 'px';
      }
      loadPic(currentPic);
    })
  }
}

Resizer.run();
