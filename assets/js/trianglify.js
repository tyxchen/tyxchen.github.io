(() => {
  // Colours from ColorBrewer
  // https://bl.ocks.org/mbostock/5577023
  const choosableColors = {
    //YlGn: ["#addd8e","#78c679","#41ab5d","#238443"],
    YlGn: ["#addd8e","#89cc7d","#65bb6d","#41ab5d"],
    GnBu: ["#7bccc4","#4eb3d3","#2b8cbe","#0868ac"],
    BuPu: ["#8c96c6","#8c6bb1","#88419d","#810f7c"],
    PuRd: ["#e7298a","#ce1256","#980043","#67001f"],
    RdPu: ["#f768a1","#dd3497","#ae017e","#7a0177"],
    YlOrRd: ["#feb24c","#fd8d3c","#fc4e2a","#e31a1c"]
  }
  const baseColors = {
    //Pu: ["#8c6bb1","#807dba","#6a51a3","#54278f"], // [0] from BuPu[1]
    Pu: ["#807dba","#7160ab","#62439d","#54278f"],
    //Bu: ["#6baed6","#4292c6","#2171b5","#08519c"],
    Bu: ["#4292c6","#2e7cb8","#1b66aa","#08519c"],
    Gn: ["#41ab5d","#2b964c","#15813c","#006d2c"],
    //Or: ["#fd8d3c","#f16913","#d94801","#a63603"],
    Or: ["#f16913","#d8580d","#bf4708","#a63603"],
    Rd: ["#fb6a4a","#ef3b2c","#cb181d","#a50f15"]
  };
  const constColors = {
    red: ['#f00'],
    green: ['#0c0'],
    blue: ['#00f'],
    black: ['#000'],
    white: ['#fff']
  };
  const colors = { ...choosableColors, ...baseColors, ...constColors };

  // Utility functions
  
  // DOM selection aliases
  // $(el, selector) - alias for el.querySelector(selector)
  // $$(el, selector) - alias for el.querySelectorAll(selector)

  const $ = (ctx, sel) => (!sel ? document : ctx).querySelector(sel || ctx),
        $$ = (ctx, sel) => Array.prototype.slice.call((!sel ? document : ctx).querySelectorAll(sel || ctx));

  // Array fcns
  // chooseRandomIndex(array: Any[]) - get a random index that is valid for `array`
  // chooseRandomFromArray(array: Any[]) - choose a random element from `array`
  // chooseRandomFromObject(object: Object) - choose a random value from `object`
  
  const chooseRandomIndex      = window.chooseRandomIndex      = (arr) => Math.floor(Math.random() * arr.length);
  const chooseRandomFromArray  = window.chooseRandomFromArray  = (arr) => arr[chooseRandomIndex(arr)];
  const chooseRandomFromObject = window.chooseRandomFromObject = (obj) => obj[chooseRandomFromArray(Object.keys(obj))];

  // leftPad(string: String, pad: Char, length: Int) - pad a string to its left to `length` with `pad`
  const leftPad = (str, pad, len) => str.length < len ? (new Array(len - str.length + 1).join(pad) + str) : str;
  
  // Color functions
  
  const hexToRGB = (hexClr) => {
    let rgbClrs = new Uint8ClampedArray(3);
    
    if (hexClr[0] === '#') {
      hexClr = hexClr.slice(1);
    }

    if (hexClr.length === 6) {
      rgbClrs[0] = parseInt(hexClr.slice(0, 2), 16);
      rgbClrs[1] = parseInt(hexClr.slice(2, 4), 16);
      rgbClrs[2] = parseInt(hexClr.slice(4), 16);
    } else {
      rgbClrs[0] = 17 * parseInt(hexClr[0], 16);
      rgbClrs[1] = 17 * parseInt(hexClr[1], 16);
      rgbClrs[2] = 17 * parseInt(hexClr[2], 16);
    }

    return rgbClrs;
  };

  const RGBToHex = (rgbClr) => {
    return '#' + Array.from(rgbClr).map((x) => leftPad((x).toString(16), 0, 2)).join('');
  };

  const interpolate = (colors, sigma_2 = 0.035, x = 0.5) => {
    let r = 0.0, g = 0.0, b = 0.0;
    let total = 0.0;
    let step = 1.0 / (colors.length - 1);
    let mu = 0.0;

    for (let color of colors) {                
      total += Math.exp(-(x - mu) * (x - mu) / (2.0 * sigma_2)) / Math.sqrt(2.0 * Math.PI * sigma_2);
      mu += step;
    }

    mu = 0.0;
    for (let color of colors) {                
      let percent = Math.exp(-(x - mu) * (x - mu) / (2.0 * sigma_2)) / Math.sqrt(2.0 * Math.PI * sigma_2);
      mu += step;

      r += color[0] * percent / total;
      g += color[1] * percent / total;
      b += color[2] * percent / total;
    }

    return new Uint8ClampedArray([r, g, b]);
  };
  
  const getGradient = (fromClr, toClr, numStops) => {
    let stops = new Array(numStops);

    fromClr = Array.from(hexToRGB(fromClr));
    toClr = hexToRGB(toClr);
    
    const steps = [
      toClr[0] - fromClr[0],
      toClr[1] - fromClr[1],
      toClr[2] - fromClr[2]
    ], mapFcn = (i, f, k) => {
      let s = Math.floor(f + (i + 1) * steps[k] / numStops).toString(16);
      if (s.length < 2) return '0' + s;
      else return s;
    };

    for (let i=0; i<stops.length; i++) {
      stops[i] = '#' + fromClr.map(mapFcn.bind(this, i)).join('');
    }

    return stops;
  };

  const randBrightness = (clr, variance = 40) => {
    return clr.map(x => x + variance * (Math.random() - 0.5));
  };
  
  // generate triangles
  const generate_triangles = window.generate_triangles = (opts) => {
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

  let perfMark = 0;
  
  const trianglify = window.trianglify = (el, colorSet, animate = false, cell_size = 32) => {
    performance.mark('begin whole' + perfMark);
    
    // wrap text to constraints of el
    // returns a SVG string
    // inspired by https://bl.ocks.org/mbostock/7555321
    const wrapText = (text, el) => {
      performance.mark('begin wrap' + perfMark);
      
      const SVG = "http://www.w3.org/2000/svg",
            offset = {
              A: -0.0078,
              B: 0.0625,
              C: 0.0391,
              D: 0.0625,
              E: 0.0625,
              F: 0.0625,
              G: 0.0391,
              H: 0.0625,
              I: 0.0625,
              J: 0.0313,
              K: 0.0625,
              L: 0.0625,
              M: 0.0625,
              N: 0.0625,
              O: 0.0391,
              P: 0.0625,
              Q: 0.0391,
              R: 0.0625,
              S: 0.0156,
              U: 0.0547,
              V: 0.0156,
              W: 0.0078,
              Z: 0.0625
            };
      let words = text.split(/\s/),
          line = [],
          lineHeight = 1,
          width = Math.ceil(el.getBoundingClientRect().width), // give some wiggle room
          fontSizeGr72 = parseInt(window.getComputedStyle(el, null).fontSize) > 72,
          builder = [],
          dy = 0.95,
          word;
          
      performance.mark('begin wrap dom' + perfMark);
      
      let svg = document.createElementNS(SVG, 'svg'),
          textNode = document.createElementNS(SVG, 'text'),
          tspan = document.createElementNS(SVG, 'tspan');

      tspan.setAttributeNS(SVG, 'x', 0);
      tspan.setAttributeNS(SVG, 'y', 0);
      textNode.appendChild(tspan);
      svg.appendChild(textNode);
      el.appendChild(svg);
      
      performance.mark('fin wrap dom' + perfMark);

      while (word = words.shift()) {
        line.push(word);
        tspan.textContent = line.join(' ');
        if (tspan.getComputedTextLength() > width) {
          line.pop();
          builder.push(`<tspan x="0" y="0" dx="${fontSizeGr72 ? (-offset[line[0][0]] || 0) : 0}em" dy="${dy}em">${line.join(' ')}</tspan>`);
          line = [word];
          dy += lineHeight;
        }
      }
      builder.push(`<tspan x="0" y="0" dx="${fontSizeGr72 ? (-offset[line[0][0]] || 0) : 0}em" dy="${dy}em">${line.join(' ')}</tspan>`);

      el.removeChild(svg);

      let builderjoined = builder.join('');
      performance.mark('fin wrap' + perfMark);
      return builderjoined;
    };
    
    performance.mark('begin init' + perfMark);
    let wrapper = $(el, '.text-wrap'),
        wrapperParent = wrapper.parentNode, // no guarantee wrapper.parentNode === el
        text = wrapper.textContent,
        maskId = 'mask-' + el.getAttribute('id'),
        { width, height } = wrapper.getBoundingClientRect(),
        canvas = document.createElement('canvas'),
        ctx = canvas.getContext('2d');
    performance.mark('fin init' + perfMark);
    performance.mark('begin polys' + perfMark);
    let polys = generate_triangles({
          width,
          height,
          cell_size, //Math.floor(parseInt(window.getComputedStyle(el, null).fontSize) / 4),
          variance: .69
        });
    performance.mark('fin polys' + perfMark);
    let templ = `<span class="trianglify-text" style="width:${width + 2}px;height:${height + 2}px">
    <svg class="trianglify-svg" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <mask id="${maskId}" x="0" y="0" width="100%" height="100%">
          <rect x="0" y="0" width="100%" height="100%"></rect>
          <text x="0" y="0" dy=".95em">${wrapText(text, wrapper)}</text>
        </mask>
      </defs>
      <rect x="0" y="0" width="100%" height="100%" fill="white" mask="url(#${maskId})"/>
  </span>
  <span class="trianglify-ghost-text">${text}</span>`,
        fading = [],
        defaultNumStops = 75, // 4500 / 60; each change takes 4.5 seconds
        lastTimestamp = 0, // for animation
        chosenColors;

    let changeColorSet = (set) => {
      chosenColors = set;
      polys = polys.map((a) => [chooseRandomIndex(chosenColors), a[1]]);
      fading = new Array(polys.length);

      for (let i=0; i<polys.length; i++) {
        let [clr, p] = polys[i];
        ctx.fillStyle = ctx.strokeStyle = chosenColors[clr];
        ctx.beginPath();
        ctx.moveTo.apply(ctx, p[0]);
        ctx.lineTo.apply(ctx, p[1]);
        ctx.lineTo.apply(ctx, p[2]);
        ctx.fill();
        ctx.stroke();

        if (animate && Math.random() < 0.1) {
          let randClr = chooseRandomIndex(chosenColors);
          fading[i] = [0, getGradient(chosenColors[clr], chosenColors[randClr], defaultNumStops), p];
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

    performance.mark('begin change color' + perfMark);
    changeColorSet(colorSet);
    performance.mark('fin change color' + perfMark);

    performance.mark('begin main dom' + perfMark);
    wrapperParent.removeChild(wrapper);

    wrapperParent.insertAdjacentHTML('beforeend', templ);
    wrapperParent.appendChild(canvas);
    performance.mark('fin main dom' + perfMark);

    if (animate) {
      let animFrame = (timestamp) => {
        // randomly fade a few polygons
        for (let i=0; i<fading.length; i++) {
          if (!fading[i]) continue;
          let [stop, clrStops, p] = fading[i];
          ctx.fillStyle = ctx.strokeStyle = clrStops[stop];
          ctx.beginPath();
          ctx.moveTo.apply(ctx, p[0]);
          ctx.lineTo.apply(ctx, p[1]);
          ctx.lineTo.apply(ctx, p[2]);
          ctx.fill();
          ctx.stroke();

          if (stop + 1 < clrStops.length)
            fading[i][0] = stop + 1;
          else
            delete fading[i];
        }

        // every 1/2 second, fade a few more
        if (timestamp - lastTimestamp > 500) {
          for (let i=0; i<polys.length; i++) {
            let [clr, p] = polys[i];
            if (!!fading[i]) continue;
            if (Math.random() < 0.03) {
              let randClr = chooseRandomIndex(chosenColors);
              fading[i] = [0, getGradient(chosenColors[clr], chosenColors[randClr], defaultNumStops), p];
              polys[i][0] = randClr;
            }
          }

          lastTimestamp = timestamp;
        }

        return requestAnimationFrame(animFrame);
      };

      performance.mark('begin anim frame' + perfMark);
      animFrame(0);
      performance.mark('fin anim frame' + perfMark);
    }
    
    performance.mark('fin whole' + perfMark);
    performance.measure('from nav' + perfMark);
    
    const marks = [
      'whole',
      'init',
      'polys',
      'change color',
      'main dom',
      'wrap',
      'wrap dom',
    ];
    
    if (animate) marks.push('anim frame');
    
    for (const mark of marks) {
      performance.measure(mark + perfMark, `begin ${mark}${perfMark}`, `fin ${mark}${perfMark}`);
      performance.clearMarks(`begin ${mark}${perfMark}`);
      performance.clearMarks(`fin ${mark}${perfMark}`);
    }
    perfMark++;
    
    for (const { name, startTime, duration } of performance.getEntriesByType('measure')) {
      console.log(`Measure ${name}: start = ${startTime}, duration = ${duration}`);
      performance.clearMeasures(name);
    }

    return {
      canvas,
      changeColorSet
    };
  }

  let trianglifyHeaderBar = () => {
    const siteHeader_Bar = $('#site-header__bar'),
          ctx = siteHeader_Bar.getContext('2d');

    let polys;

    let init = () => {
      const barWidth = $('#site-header').getBoundingClientRect().width,
            barColors = [baseColors.Or[1], baseColors.Rd[1], baseColors.Pu[1], baseColors.Bu[1], baseColors.Gn[1]].map(hexToRGB);
      
      siteHeader_Bar.width = barWidth

      polys = generate_triangles({
        width: barWidth,
        height: siteHeader_Bar.height,
        cell_size: 15,
        color_fcn: ([x]) => RGBToHex(randBrightness(interpolate(barColors, 0.015, x / barWidth), 50)),
        variance: 1
      });

      resetBarColors();
      
      ctx.lineWidth = 1.51;
    };
    let changeBarColors = (set) => {
      for (let [, p] of polys) {
        ctx.fillStyle = ctx.strokeStyle = chooseRandomFromArray(set);
        ctx.globalAlpha = Math.random() * 0.2 + 0.8;
        ctx.beginPath();
        ctx.moveTo(...p[0]);
        ctx.lineTo(...p[1]);
        ctx.lineTo(...p[2]);
        ctx.fill();
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
    };
    let resetBarColors = () => {
      for (let [clr, p] of polys) {
        ctx.fillStyle = ctx.strokeStyle = clr;
        ctx.beginPath();
        ctx.moveTo(...p[0]);
        ctx.lineTo(...p[1]);
        ctx.lineTo(...p[2]);
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

      let { canvas, changeColorSet } = trianglify(title, chosenClr, true);

      titleCanvas = canvas;
      changeTitleColorSet = changeColorSet;

      for (let a of $$('#header .subtitle a')) {
        a.style.color = chosenClr[2];
        if (a.classList.contains('resume-link')) {
          a.style.color = chosenClr[3];
        }
      }

      if (title.dataset.hasOwnProperty('changeable') && title.dataset.changeable !== 'false') {
        title.onclick = () => {
          let choosableClrs = Object.keys(choosableColors);
          if (~choosableClrs.indexOf(chosenTitleClr)) {
            choosableClrs.splice(choosableClrs.indexOf(chosenTitleClr), 1);
          }

          chosenTitleClr = chooseRandomFromArray(choosableClrs);
          chosenClr = choosableColors[chosenTitleClr];

          changeTitleColorSet(chosenClr);

          for (let a of $$('#header .subtitle a')) {
            a.style.color = chosenClr[2];
            if (a.classList.contains('resume-link')) {
              a.style.color = chosenClr[3];
            }
          }
        };
      }
      
      title.classList.remove('trianglify');
    }

    for (let t of $$('.trianglify')) {
      trianglify(t, colors[t.dataset.clr || chooseRandomFromArray(Object.keys(choosableColors))]);
      t.classList.remove('trianglify');
    }

    // trianglify bar
    if ($('#site-header__bar')) {
      let { init, changeBarColors, resetBarColors } = trianglifyHeaderBar();
      for (let l of $$('#site-header dt a')) {
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

        for (let n of childNodes) {
          if (n.className === 'trianglify-text' || n.className === 'trianglify-canvas') {
            title.removeChild(n);
          } else if (n.className === 'trianglify-ghost-text') {
            n.className = 'text-wrap';
          }
        }

        title.setAttribute('style', '');

        let { canvas, changeColorSet } = trianglify(title, colors[chosenTitleClr], true);

        titleCanvas = canvas;
        changeTitleColorSet = changeColorSet;
      }

      // resize site header bar; put last so errors don't affect anything else
      initHeaderBarTrianglify();
    }, Math.abs(window.innerWidth - lastWindowWidth) > 100 ? 0 : 100);
    lastWindowWidth = window.innerWidth;
  });
})();
