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
  
  const $ = (ctx, sel) => (!sel ? document : ctx).querySelector(sel || ctx),
        $$ = (ctx, sel) => Array.prototype.slice.call((!sel ? document : ctx).querySelectorAll(sel || ctx));

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

  const trianglify = (el, colorSet, animate = false, cell_size = 32) => {
    // wrap text to constraints of el
    // returns a SVG string
    // inspired by https://bl.ocks.org/mbostock/7555321
    const wrapText = (text, el) => {
      const SVG = "http://www.w3.org/2000/svg",
            offset = {
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
          svg = document.createElementNS(SVG, 'svg'),
          textNode = document.createElementNS(SVG, 'text'),
          tspan = document.createElementNS(SVG, 'tspan'),
          width = Math.ceil(el.getBoundingClientRect().width), // give some wiggle room
          fontSize = parseInt(window.getComputedStyle(el, null).fontSize),
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
          builder.push(`<tspan x="0" y="0" dx="-${fontSize > 72 ? (offset[line[0][0]] || 0) : 0}em" dy="${dy}em">${line.join(' ')}</tspan>`);
          line = [word];
          dy += lineHeight;
        }
      }
      builder.push(`<tspan x="0" y="0" dx="-${fontSize > 72 ? (offset[line[0][0]] || 0) : 0}em" dy="${dy}em">${line.join(' ')}</tspan>`);
      
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
        { polys } = Trianglify({
          width,
          height,
          cell_size, //Math.floor(parseInt(window.getComputedStyle(el, null).fontSize) / 4),
          variance: .69
        }),
        templ = `<span class="trianglify-text" style="width:${width + 2}px;height:${height + 2}px">
    <svg class="trianglify-svg" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <mask id="${maskId}" x="0" y="0" width="100%" height="100%">
          <rect x="0" y="0" width="100%" height="100%"></rect>
          <text class="${el.className}" x="0" y="0" dy=".95em">${wrapText(text, wrapper)}</text>
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
      
    ctx.lineWidth = 0.001;

    el.style.position = 'relative';
    el.style.height = (height + 2) + 'px';
    el.style.width = (width + 2) + 'px';
    
    canvas.width = width;
    canvas.height = height;
    canvas.className = 'trianglify-canvas';
    
    changeColorSet(colorSet);
    
    wrapperParent.removeChild(wrapper);
    
    wrapperParent.insertAdjacentHTML('beforeend', templ);
    wrapperParent.appendChild(canvas);
    
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

  let chosenTitleClr = title.dataset.clr || chooseRandomFromArray(Object.keys(choosableColors)),
      titleCanvas,
      changeTitleColorSet;
      
  window.onload = () => {
    let title = $('#title'),
        chosenClr = colors[chosenTitleClr],
        { canvas, changeColorSet } = trianglify(title, chosenClr, true);
    
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
    
    for (let t of $$('.trianglify')) {
      trianglify(t, colors[t.dataset.clr || chooseRandomFromArray(Object.keys(choosableColors))]);
    }
  
    for (let l of $$('#site-header dt')) {
      $(l, '.trianglify-ghost-text').style.color = colors[l.dataset.clr][1];
    }
  };
  
  let resizeTimeout, lastWindowWidth = window.innerWidth;
  
  window.onresize = () => {
    if (window.innerWidth === lastWindowWidth) return;
    
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      let title = $('#title'),
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
    }, Math.abs(window.innerWidth - lastWindowWidth) > 100 ? 0 : 100);
    lastWindowWidth = window.innerWidth;
  }
})();