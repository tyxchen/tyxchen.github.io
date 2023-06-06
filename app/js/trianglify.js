import {
  choosableColors,
  baseColors,
  colors,
  hexToRGB,
  RGBToHex,
  interpolate,
  getGradient,
  randBrightness
} from '@js/colors.js';
import {
  $,
  $$,
  chooseRandomIndex,
  chooseRandomFromArray,
  letterOffsets
} from '@js/utils.js';
import { generate_triangles } from '@js/generators.js';

import Resizer from '@js/resizer.js';

const trianglify = window.trianglify = (el, colorSet, animate = false, cell_size = 32) => {
  // wrap text to constraints of el
  // returns a SVG string
  // inspired by https://bl.ocks.org/mbostock/7555321
  const wrapText = (text, el) => {
    const SVG = "http://www.w3.org/2000/svg";
    let words = text.split(/\s/),
        line = [],
        lineHeight = 1,
        width = Math.ceil(el.getBoundingClientRect().width * 1.0125), // give some wiggle room
        fontSizeGr72 = parseInt(window.getComputedStyle(el, null).fontSize) > 72,
        builder = [],
        dy = 1,
        word;

    let svg = document.createElementNS(SVG, 'svg'),
        textNode = document.createElementNS(SVG, 'text'),
        tspan = document.createElementNS(SVG, 'tspan');

    tspan.setAttributeNS(SVG, 'x', 0);
    tspan.setAttributeNS(SVG, 'y', 0);
    textNode.appendChild(tspan);
    svg.appendChild(textNode);
    el.appendChild(svg);

    while (word = words.shift()) {
      line.push(word);
      tspan.textContent = line.join(' ');
      if (tspan.getComputedTextLength() > width) {
        line.pop();
        builder.push(`<tspan x="0" y="0" dx="${fontSizeGr72 ? (letterOffsets[line[0][0]] || 0) : 0}em" dy="${dy}em">${line.join(' ')}</tspan>`);
        line = [word];
        dy += lineHeight;
      }
    }
    builder.push(`<tspan x="0" y="0" dx="${fontSizeGr72 ? (letterOffsets[line[0][0]] || 0) : 0}em" dy="${dy}em">${line.join(' ')}</tspan>`);

    el.removeChild(svg);

    return builder.join('');
  };

  let wrapper = $(el, '.text-wrap'),
      wrapperParent = wrapper.parentNode, // no guarantee wrapper.parentNode === el
      text = wrapper.textContent,
      maskId = 'mask-' + el.getAttribute('id'),
      { width, height } = wrapper.getBoundingClientRect(),
      canvas = document.createElement('canvas'),
      ctx = canvas.getContext('2d'),
      fading = [],
      defaultNumStops = 75, // 4500 / 60; each change takes 4.5 seconds
      lastTimestamp = 0, // for animation
      chosenColors;

  let polys = generate_triangles({
        width,
        height,
        cell_size, //Math.floor(parseInt(window.getComputedStyle(el, null).fontSize) / 4),
        variance: .69
      });

  const templ = `<span class="trianglify-text" style="width:${width + 2}px;height:${height + 2}px">
  <svg class="trianglify-svg" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <mask id="${maskId}" x="0" y="0" width="100%" height="100%">
        <rect x="0" y="0" width="100%" height="100%"></rect>
        <text x="0" y="0" dy=".95em">${wrapText(text, wrapper)}</text>
      </mask>
    </defs>
    <rect x="0" y="0" width="100%" height="100%" fill="white" mask="url(#${maskId})"/>
</span>
<span class="trianglify-ghost-text">${text}</span>`;

  const changeColorSet = (set) => {
    let oldChosenColors = chosenColors;

    chosenColors = set;
    polys = polys.map((a) => [chooseRandomIndex(chosenColors), a[1]]);
    fading = new Array(polys.length);

    for (const [i, [clr, poly]] of polys.entries()) {
      if (animate && oldChosenColors) {
        setTimeout(() => { fading[i] = [
          0,
          getGradient(
            oldChosenColors[clr],
            chosenColors[clr],
            16
          ),
          poly
        ]; }, Math.floor(690 * Math.exp(-4 * (Math.random() - 1) ** 2) / Math.PI));
      } else {
        ctx.fillStyle = ctx.strokeStyle = chosenColors[clr];
        ctx.beginPath();
        ctx.moveTo(...poly[0]);
        ctx.lineTo(...poly[1]);
        ctx.lineTo(...poly[2]);
        ctx.fill();
        ctx.stroke();
      }

      if (animate && Math.random() < 0.1) {
        setTimeout(() => {
          const randClr = chooseRandomIndex(chosenColors);
          fading[i] = [
            0,
            getGradient(
              chosenColors[clr],
              chosenColors[randClr],
              defaultNumStops
            ),
            poly
          ];
          polys[i][0] = randClr;
        }, 500);
      }
    }
  };

  ctx.lineWidth = 0.001;

  el.style.position = 'relative';
  el.style.height = (height + 2) + 'px';
  el.style.width = (width + 2) + 'px';
  el.classList.add('trianglify-rendered');

  canvas.width = width;
  canvas.height = height;
  canvas.className = 'trianglify-canvas';

  changeColorSet(colorSet);

  wrapperParent.removeChild(wrapper);

  wrapperParent.insertAdjacentHTML('beforeend', templ);
  wrapperParent.appendChild(canvas);

  if (animate) {
    const animFrame = (timestamp) => {
      // randomly fade a few polygons
      for (const [i, entry] of fading.entries()) {
        if (!entry) {
          continue;
        }

        const [stop, clrStops, poly] = entry;

        ctx.fillStyle = ctx.strokeStyle = clrStops[stop];
        ctx.beginPath();
        ctx.moveTo(...poly[0]);
        ctx.lineTo(...poly[1]);
        ctx.lineTo(...poly[2]);
        ctx.fill();
        ctx.stroke();

        if (stop + 1 < clrStops.length) {
          fading[i][0] = stop + 1;
        } else {
          delete fading[i];
        }
      }

      // every 1/2 second, fade a few more
      if (timestamp - lastTimestamp > 500) {
        for (const [i, [clr, poly]] of polys.entries()) {
          if (!!fading[i]) {
            continue;
          }

          if (Math.random() < 0.03) {
            const randClr = chooseRandomIndex(chosenColors);
            fading[i] = [
              0,
              getGradient(chosenColors[clr],
                chosenColors[randClr],
                defaultNumStops),
              poly
            ];
            polys[i][0] = randClr;
          }
        }

        lastTimestamp = timestamp;
      }

      return requestAnimationFrame(animFrame);
    };

    animFrame(0);
  }

  return {
    canvas,
    changeColorSet
  };
}

let chosenTitleClr,
    titleCanvas,
    changeTitleColorSet = () => {};

window.addEventListener('load', () => {
  if ($('#title.trianglify')) {
    let title = $('#title.trianglify'),
        chosenClr;

    chosenTitleClr = title.dataset.clr || chooseRandomFromArray(Object.keys(choosableColors));
    chosenClr = colors[chosenTitleClr];

    const { canvas, changeColorSet } = trianglify(title, chosenClr, true);

    titleCanvas = canvas;
    changeTitleColorSet = changeColorSet;

    for (const a of $$('#header .subtitle a')) {
      a.style.color = chosenClr[2]; 
    }

    if (title.dataset.hasOwnProperty('changeable') && title.dataset.changeable !== 'false') {
      $(title, '.clicky').addEventListener('click', (e) => {
        e.preventDefault();

        const choosableClrs = Object.keys(choosableColors);
        if (~choosableClrs.indexOf(chosenTitleClr)) {
          choosableClrs.splice(choosableClrs.indexOf(chosenTitleClr), 1);
        }

        chosenTitleClr = chooseRandomFromArray(choosableClrs);
        chosenClr = choosableColors[chosenTitleClr];

        for (const a of $$('#header .subtitle a')) {
          a.style.color = chosenClr[2];
        }

        changeTitleColorSet(chosenClr);
      });
    }

    title.classList.remove('trianglify');
  }

  for (const t of $$('.trianglify')) {
    trianglify(t, colors[t.dataset.clr || chooseRandomFromArray(Object.keys(choosableColors))], 
      t.dataset.hasOwnProperty('animate'), parseInt(t.dataset.cellSize) || undefined);
    t.classList.remove('trianglify');
  }
});

Resizer.addListener(() => {
  if ($('#title.trianglify-rendered')) {
    let title = $('#title.trianglify-rendered'),
        childWrap = $(title, '.clicky') || title;

    for (const n of Array.from(childWrap.childNodes)) {
      if (n.className === 'trianglify-text' || n.className === 'trianglify-canvas') {
        childWrap.removeChild(n);
      } else if (n.className === 'trianglify-ghost-text') {
        n.className = 'text-wrap';
      }
    }

    title.setAttribute('style', '');

    const { canvas, changeColorSet } = trianglify(title, colors[chosenTitleClr], true);

    titleCanvas = canvas;
    changeTitleColorSet = changeColorSet;
  }
});
