import {
  choosableColors,
  colors,
  hexToRGB,
  RGBToHex,
  interpolate,
  getGradient,
} from '@js/colors.js';
import {
  $,
  $$,
  chooseRandomIndex,
  chooseRandomFromArray,
  escapeText,
  letterOffsets,
} from '@js/utils.js';
import { generate_triangles } from '@js/generators.js';

const trianglify = (el, colorSet, animate = false, cell_size = 32) => {
  // wrap text to constraints of el
  // returns a SVG string
  // inspired by https://bl.ocks.org/mbostock/7555321
  const wrapText = (text, el) => {
    const SVG = "http://www.w3.org/2000/svg";
    let words = escapeText(text).split(/\s/),
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
      if (Math.floor(tspan.getComputedTextLength()) > width) {
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

  let textIterator = document.createNodeIterator(el, NodeFilter.SHOW_TEXT),
      textRange = document.createRange(),
      textNode,
      tmpNode;

  // get first text node only
  while (tmpNode = textIterator.nextNode()) {
    if (!tmpNode.textContent.match(/^\s*$/)) {
      textNode = tmpNode;
    }
  }

  textRange.selectNode(textNode);

  let textParent = textNode.parentNode, // no guarantee textNode.parentNode === el
      text = textNode.textContent,
      maskId = 'mask-' + Math.random().toString(36).slice(2),
      { width, height } = textRange.getBoundingClientRect(),
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

  const templ = `<span class="trianglify-text" style="width:${width + 2}px;height:${height + 2}px" aria-hidden="true">
  <svg class="trianglify-svg" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <mask id="${maskId}" x="0" y="0" width="100%" height="100%">
        <rect x="0" y="0" width="100%" height="100%"></rect>
        <text x="0" y="0" dy=".95em">${wrapText(text, textParent)}</text>
      </mask>
    </defs>
    <rect x="0" y="0" width="100%" height="100%" fill="white" mask="url(#${maskId})"/>
</span>`.replace(/>\s+</g, '><');

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
  el.style.top = '-1px';
  el.style.height = (height + 2) + 'px';
  el.style.width = (width + 2) + 'px';
  el.style.color = 'transparent';
  el.classList.add('trianglify-rendered');

  canvas.width = Math.ceil(width);
  canvas.height = Math.ceil(height);
  canvas.className = 'trianglify-canvas';

  changeColorSet(colorSet);

  textParent.insertAdjacentHTML('beforeend', templ);
  textParent.appendChild(canvas);

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

  textRange.detach();

  return {
    canvas,
    changeColorSet
  };
};

const initTrianglify = () => {
  for (const el of $$('.trianglify')) {
    trianglify(el, colors[el.dataset.clr || chooseRandomFromArray(Object.keys(choosableColors))],
      el.dataset.hasOwnProperty('animate') && !window.matchMedia('(prefers-reduced-motion)').matches,
      parseInt(el.dataset.cellSize) || undefined);
    el.classList.remove('trianglify');
  }
};

export { trianglify, initTrianglify };
