import {
  choosableColors,
  baseColors,
  colors,
  hexToRGB,
  RGBToHex,
  interpolate,
  getGradient,
  randBrightness
} from './colors.js';
import {
  $,
  $$,
  chooseRandomIndex,
  chooseRandomFromArray,
  letterOffsets
} from './utils.js';
import { generate_triangles } from './generators.js';

const trianglify = window.trianglify = (el, colorSet, animate = false, cell_size = 32) => {
  // wrap text to constraints of el
  // returns a SVG string
  // inspired by https://bl.ocks.org/mbostock/7555321
  const wrapText = (text, el) => {
    const SVG = "http://www.w3.org/2000/svg";
    let words = text.split(/\s/),
        line = [],
        lineHeight = 1,
        width = Math.ceil(el.getBoundingClientRect().width), // give some wiggle room
        fontSizeGr72 = parseInt(window.getComputedStyle(el, null).fontSize) > 72,
        builder = [],
        dy = 0.95,
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
    chosenColors = set;
    polys = polys.map((a) => [chooseRandomIndex(chosenColors), a[1]]);
    fading = new Array(polys.length);

    for (const [i, [clr, poly]] of polys.entries()) {
      ctx.fillStyle = ctx.strokeStyle = chosenColors[clr];
      ctx.beginPath();
      ctx.moveTo(...poly[0]);
      ctx.lineTo(...poly[1]);
      ctx.lineTo(...poly[2]);
      ctx.fill();
      ctx.stroke();

      if (animate && Math.random() < 0.1) {
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

const trianglifyHeaderBar = () => {
  const siteHeader_Bar = $('#site-header__bar'),
        ctx = siteHeader_Bar.getContext('2d');

  let polys;

  const init = () => {
    const barWidth = $('#site-header').getBoundingClientRect().width,
          barColors = [
            baseColors.Or[1],
            baseColors.Rd[1],
            baseColors.Pu[1],
            baseColors.Bu[1],
            baseColors.Gn[1]
          ].map(hexToRGB);

    siteHeader_Bar.width = barWidth

    polys = generate_triangles({
      width: barWidth,
      height: siteHeader_Bar.height,
      cell_size: 15,
      color_fcn: ([x]) => RGBToHex(
        randBrightness(interpolate(barColors, 0.015, x / barWidth), 50)
      ),
      variance: 1
    });

    resetBarColors();

    ctx.lineWidth = 1.51;
  };

  const changeBarColors = (set) => {
    for (const [, poly] of polys) {
      ctx.fillStyle = ctx.strokeStyle = chooseRandomFromArray(set);
      ctx.globalAlpha = Math.random() * 0.2 + 0.8;
      ctx.beginPath();
      ctx.moveTo(...poly[0]);
      ctx.lineTo(...poly[1]);
      ctx.lineTo(...poly[2]);
      ctx.fill();
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  };

  const resetBarColors = () => {
    for (const [clr, poly] of polys) {
      ctx.fillStyle = ctx.strokeStyle = clr;
      ctx.beginPath();
      ctx.moveTo(...poly[0]);
      ctx.lineTo(...poly[1]);
      ctx.lineTo(...poly[2]);
      ctx.fill();
      ctx.stroke();
    }
  };

  init();

  return {
    init,
    changeBarColors,
    resetBarColors
  }
};

let chosenTitleClr,
    titleCanvas,
    changeTitleColorSet,
    initHeaderBarTrianglify;

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
      if (a.classList.contains('resume-link')) {
        a.style.color = chosenClr[3];
      }
    }

    if (title.dataset.hasOwnProperty('changeable') && title.dataset.changeable !== 'false') {
      title.onclick = () => {
        const choosableClrs = Object.keys(choosableColors);
        if (~choosableClrs.indexOf(chosenTitleClr)) {
          choosableClrs.splice(choosableClrs.indexOf(chosenTitleClr), 1);
        }

        chosenTitleClr = chooseRandomFromArray(choosableClrs);
        chosenClr = choosableColors[chosenTitleClr];

        changeTitleColorSet(chosenClr);

        for (const a of $$('#header .subtitle a')) {
          a.style.color = chosenClr[2];
          if (a.classList.contains('resume-link')) {
            a.style.color = chosenClr[3];
          }
        }
      };
    }

    title.classList.remove('trianglify');
  }

  for (const t of $$('.trianglify')) {
    trianglify(t, colors[t.dataset.clr || chooseRandomFromArray(Object.keys(choosableColors))]);
    t.classList.remove('trianglify');
  }

  // trianglify bar
  if ($('#site-header__bar')) {
    const { init, changeBarColors, resetBarColors } = trianglifyHeaderBar();
    for (const l of $$('#site-header dt a')) {
      l.addEventListener('mouseover', () => {
        changeBarColors(colors[l.parentNode.dataset.clr].slice(0,3));
      });
      l.addEventListener('mouseout', () => {
        resetBarColors();
      });
    }

    initHeaderBarTrianglify = init;
  }
});

let resizeTimeout, lastWindowWidth = window.innerWidth;

window.addEventListener('resize', () => {
  if (window.innerWidth === lastWindowWidth) return;

  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(() => {
    if ($('#title.trianglify')) {
      let title = $('#title.trianglify'),
          childNodes = Array.prototype.slice.call(title.childNodes);

      for (const n of childNodes) {
        if (n.className === 'trianglify-text' || n.className === 'trianglify-canvas') {
          title.removeChild(n);
        } else if (n.className === 'trianglify-ghost-text') {
          n.className = 'text-wrap';
        }
      }

      title.setAttribute('style', '');

      const { canvas, changeColorSet } = trianglify(title, colors[chosenTitleClr], true);

      titleCanvas = canvas;
      changeTitleColorSet = changeColorSet;
    }

    // resize site header bar; put last so errors don't affect anything else
    initHeaderBarTrianglify();
  }, Math.abs(window.innerWidth - lastWindowWidth) > 100 ? 0 : 100);
  lastWindowWidth = window.innerWidth;
});
