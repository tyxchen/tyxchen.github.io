(() => {
  // Colours from ColorBrewer
  // https://bl.ocks.org/mbostock/5577023
  const choosableColors = {
    YlGn: ["#addd8e","#78c679","#41ab5d","#238443"],
    GnBu: ["#7bccc4","#4eb3d3","#2b8cbe","#0868ac"],
    BuPu: ["#8c96c6","#8c6bb1","#88419d","#810f7c"],
    PuRd: ["#e7298a","#ce1256","#980043","#67001f"],
    RdPu: ["#f768a1","#dd3497","#ae017e","#7a0177"],
    YlOrRd: ["#feb24c","#fd8d3c","#fc4e2a","#e31a1c"]
  }
  const baseColors = {
    Pu: ["#807dba","#6a51a3","#54278f","#3f007d"],
    Bu: ["#4292c6","#2171b5","#08519c","#08306b"],
    Gn: ["#41ab5d","#238b45","#006d2c","#00441b"],
    Or: ["#f16913","#d94801","#a63603","#7f2704"],
    Rd: ["#ef3b2c","#cb181d","#a50f15","#67000d"]
  };
  const colors = { ...choosableColors, ...baseColors };

  const chooseRandomFromArray = (arr) => arr[Math.floor(Math.random()*arr.length)];

  const chooseRandomFromObject = (obj) => obj[chooseRandomFromArray(Object.keys(obj))];

  const leftPad = (str, pad, len) => str.length < len ? (new Array(len - str.length + 1).join(pad) + str) : str;

  const getGradient = (fromClr, toClr, numStops) => {
    let stops = new Array(numStops);
    
    fromClr = fromClr.slice(1);
    toClr = toClr.slice(1);

    if (fromClr.length === 6) {
      fromClr = [fromClr.slice(0, 2), fromClr.slice(2, 4), fromClr.slice(4)].map((x) => parseInt(x, 16));
    } else {
      fromClr = [fromClr[0], fromClr[1], fromClr[2]].map((x) => 17 * parseInt(x, 16));
    }
    if (toClr.length === 6) {
      toClr = [toClr.slice(0, 2), toClr.slice(2, 4), toClr.slice(4)].map((x) => parseInt(x, 16));
    } else {
      toClr = [toClr[0], toClr[1], toClr[2]].map((x) => 17 * parseInt(x, 16));
    }

    for (let i=0; i<stops.length; i++) {
      stops[i] = '#' + fromClr.map((f, k) => leftPad(Math.floor(f + (i + 1) * (toClr[k] - f) / numStops).toString(16), 0, 2)).join('');
    }

    return stops;
  };
    
  // wrap text to constraints of el
  // returns a SVG string
  // inspired by https://bl.ocks.org/mbostock/7555321
  let wrapText = (text, el) => {
    const SVG = "http://www.w3.org/2000/svg";
    let words = text.split(/\s/),
        line = [],
        lineHeight = 1,
        svg = document.createElementNS(SVG, 'svg'),
        textNode = document.createElementNS(SVG, 'text'),
        tspan = document.createElementNS(SVG, 'tspan'),
        width = Math.ceil(el.getBoundingClientRect().width), // give some wiggle room
        builder = [],
        dy = 0.95,
        word;
    
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
        builder.push(`<tspan x="0" y="0" dy="${dy}em">${line.join(' ')}</tspan>`);
        line = [word];
        dy += lineHeight;
      }
    }
    builder.push(`<tspan x="0" y="0" dy="${dy}em">${line.join(' ')}</tspan>`);
    
    el.removeChild(svg);
    
    return builder.join('');
  };

  let trianglify = (el, colorSet, animate = false, cell_size = 32) => {
    let text = el.textContent,
        maskId = 'mask-' + el.getAttribute('id'),
        { width, height } = el.querySelector('.text-wrap').getBoundingClientRect(),
        canvas = document.createElement('canvas'),
        ctx = canvas.getContext('2d'),
        { polys } = Trianglify({
          width,
          height,
          cell_size, //Math.floor(parseInt(window.getComputedStyle(el, null).fontSize) / 4),
          variance: .69
        }),
        templ = `<span class="trianglify-text" style="width:${width}px;height:${height}px">
    <svg class="trianglify-svg" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <mask id="${maskId}" x="0" y="0" width="100%" height="100%">
          <rect x="0" y="0" width="100%" height="100%"></rect>
          <text class="${el.className}" x="0" y="0" dy=".95em">${wrapText(text, el.querySelector('.text-wrap'))}</text>
        </mask>
      </defs>
      <rect x="0" y="0" width="100%" height="100%" fill="white" mask="url(#${maskId})"/>
  </span>`,
        fading = [],
        defaultNumStops = 75, // 4500 / 60; each change takes 4.5 seconds
        lastTimestamp = 0, // for animation
        chosenColors;
    
    let changeColorSet = (set) => {
      chosenColors = set;
      polys = polys.map((a) => [chosenColors.indexOf(chooseRandomFromArray(chosenColors)), a[1]]);
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
        
        if (Math.random() < 0.1) {
          let randClr = chooseRandomFromArray(chosenColors);
          fading[i] = [0, getGradient(chosenColors[clr], randClr, defaultNumStops), p];
          polys[i][0] = chosenColors.indexOf(randClr);
        }
      }
    };
      
    ctx.lineWidth = 0.0001;

    el.style.position = 'relative';
    el.style.height = height + 'px';
    el.style.width = width + 'px';
    
    canvas.width = width - 2;
    canvas.height = height - 2;
    canvas.className = 'trianglify-canvas';
    
    changeColorSet(colorSet);
    
    for (let n of el.childNodes) {
      el.removeChild(n);
    }
    
    el.insertAdjacentHTML('beforeend', templ);
    el.appendChild(canvas);
    
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
              let randClr = chooseRandomFromArray(chosenColors);
              fading[i] = [0, getGradient(chosenColors[clr], randClr, defaultNumStops), p];
              polys[i][0] = chosenColors.indexOf(randClr);
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

  let chosenRandClr = chooseRandomFromObject(choosableColors), titleCanvas, changeTitleColorSet;
  window.onload = () => {
    let { canvas, changeColorSet } = trianglify(document.querySelector('#title'), chosenRandClr, true);
    titleCanvas = canvas;
    changeTitleColorSet = changeColorSet;
    
    for (let a of document.querySelectorAll('#site-header .subtitle a'))
      a.style.color = chosenRandClr[3];
    document.querySelector('#title').onclick = () => {
      chosenRandClr = chooseRandomFromObject(choosableColors);
      changeTitleColorSet(chosenRandClr);
      for (let a of document.querySelectorAll('#site-header .subtitle a'))
        a.style.color = chosenRandClr[3];
    };

    trianglify(document.querySelector('#about-heading'), colors.Or);
    trianglify(document.querySelector('#portfolio-heading'), colors.Rd);
    trianglify(document.querySelector('#blog-heading'), colors.Bu);
    trianglify(document.querySelector('#contact-heading'), colors.Gn);
  };
})();