"use strict";

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

(function () {
  // Colours from ColorBrewer
  // https://bl.ocks.org/mbostock/5577023
  var choosableColors = {
    //YlGn: ["#addd8e","#78c679","#41ab5d","#238443"],
    YlGn: ["#addd8e", "#89cc7d", "#65bb6d", "#41ab5d"],
    GnBu: ["#7bccc4", "#4eb3d3", "#2b8cbe", "#0868ac"],
    BuPu: ["#8c96c6", "#8c6bb1", "#88419d", "#810f7c"],
    PuRd: ["#e7298a", "#ce1256", "#980043", "#67001f"],
    RdPu: ["#f768a1", "#dd3497", "#ae017e", "#7a0177"],
    YlOrRd: ["#feb24c", "#fd8d3c", "#fc4e2a", "#e31a1c"]
  };
  var baseColors = {
    //Pu: ["#8c6bb1","#807dba","#6a51a3","#54278f"], // [0] from BuPu[1]
    Pu: ["#807dba", "#7160ab", "#62439d", "#54278f"],
    //Bu: ["#6baed6","#4292c6","#2171b5","#08519c"],
    Bu: ["#4292c6", "#2e7cb8", "#1b66aa", "#08519c"],
    Gn: ["#41ab5d", "#2b964c", "#15813c", "#006d2c"],
    //Or: ["#fd8d3c","#f16913","#d94801","#a63603"],
    Or: ["#f16913", "#d8580d", "#bf4708", "#a63603"],
    Rd: ["#fb6a4a", "#ef3b2c", "#cb181d", "#a50f15"]
  };
  var constColors = {
    red: ['#f00'],
    green: ['#0c0'],
    blue: ['#00f'],
    black: ['#000'],
    white: ['#fff']
  };
  var colors = _extends({}, choosableColors, baseColors, constColors);

  var $ = function $(ctx, sel) {
    return (!sel ? document : ctx).querySelector(sel || ctx);
  },
      $$ = function $$(ctx, sel) {
    return Array.prototype.slice.call((!sel ? document : ctx).querySelectorAll(sel || ctx));
  };

  var chooseRandomFromArray = function chooseRandomFromArray(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  };

  var chooseRandomFromObject = function chooseRandomFromObject(obj) {
    return obj[chooseRandomFromArray(Object.keys(obj))];
  };

  var leftPad = function leftPad(str, pad, len) {
    return str.length < len ? new Array(len - str.length + 1).join(pad) + str : str;
  };

  var getGradient = function getGradient(fromClr, toClr, numStops) {
    var stops = new Array(numStops);

    fromClr = fromClr.slice(1);
    toClr = toClr.slice(1);

    if (fromClr.length === 6) {
      fromClr = [fromClr.slice(0, 2), fromClr.slice(2, 4), fromClr.slice(4)].map(function (x) {
        return parseInt(x, 16);
      });
    } else {
      fromClr = [fromClr[0], fromClr[1], fromClr[2]].map(function (x) {
        return 17 * parseInt(x, 16);
      });
    }
    if (toClr.length === 6) {
      toClr = [toClr.slice(0, 2), toClr.slice(2, 4), toClr.slice(4)].map(function (x) {
        return parseInt(x, 16);
      });
    } else {
      toClr = [toClr[0], toClr[1], toClr[2]].map(function (x) {
        return 17 * parseInt(x, 16);
      });
    }

    var _loop = function _loop(i) {
      stops[i] = '#' + fromClr.map(function (f, k) {
        return leftPad(Math.floor(f + (i + 1) * (toClr[k] - f) / numStops).toString(16), 0, 2);
      }).join('');
    };

    for (var i = 0; i < stops.length; i++) {
      _loop(i);
    }

    return stops;
  };

  var trianglify = function trianglify(el, colorSet) {
    var animate = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
    var cell_size = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 32;

    // wrap text to constraints of el
    // returns a SVG string
    // inspired by https://bl.ocks.org/mbostock/7555321
    var wrapText = function wrapText(text, el) {
      var SVG = "http://www.w3.org/2000/svg",
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
      var words = text.split(/\s/),
          line = [],
          lineHeight = 1,
          svg = document.createElementNS(SVG, 'svg'),
          textNode = document.createElementNS(SVG, 'text'),
          tspan = document.createElementNS(SVG, 'tspan'),
          width = Math.ceil(el.getBoundingClientRect().width),
          // give some wiggle room
      fontSize = parseInt(window.getComputedStyle(el, null).fontSize),
          builder = [],
          dy = 0.95,
          word = void 0;

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
          builder.push("<tspan x=\"0\" y=\"0\" dx=\"-" + (fontSize > 72 ? offset[line[0][0]] || 0 : 0) + "em\" dy=\"" + dy + "em\">" + line.join(' ') + "</tspan>");
          line = [word];
          dy += lineHeight;
        }
      }
      builder.push("<tspan x=\"0\" y=\"0\" dx=\"-" + (fontSize > 72 ? offset[line[0][0]] || 0 : 0) + "em\" dy=\"" + dy + "em\">" + line.join(' ') + "</tspan>");

      el.removeChild(svg);

      return builder.join('');
    };

    var wrapper = $(el, '.text-wrap'),
        wrapperParent = wrapper.parentNode,
        text = wrapper.textContent,
        maskId = 'mask-' + el.getAttribute('id'),
        _wrapper$getBoundingC = wrapper.getBoundingClientRect(),
        width = _wrapper$getBoundingC.width,
        height = _wrapper$getBoundingC.height,
        canvas = document.createElement('canvas'),
        ctx = canvas.getContext('2d'),
        _Trianglify = Trianglify({
      width: width,
      height: height,
      cell_size: cell_size, //Math.floor(parseInt(window.getComputedStyle(el, null).fontSize) / 4),
      variance: .69
    }),
        polys = _Trianglify.polys,
        templ = "<span class=\"trianglify-text\" style=\"width:" + (width + 2) + "px;height:" + (height + 2) + "px\">\n    <svg class=\"trianglify-svg\" xmlns=\"http://www.w3.org/2000/svg\">\n      <defs>\n        <mask id=\"" + maskId + "\" x=\"0\" y=\"0\" width=\"100%\" height=\"100%\">\n          <rect x=\"0\" y=\"0\" width=\"100%\" height=\"100%\"></rect>\n          <text class=\"" + el.className + "\" x=\"0\" y=\"0\" dy=\".95em\">" + wrapText(text, wrapper) + "</text>\n        </mask>\n      </defs>\n      <rect x=\"0\" y=\"0\" width=\"100%\" height=\"100%\" fill=\"white\" mask=\"url(#" + maskId + ")\"/>\n  </span>\n  <span class=\"trianglify-ghost-text\">" + text + "</span>",
        fading = [],
        defaultNumStops = 75,
        lastTimestamp = 0,
        chosenColors = void 0;


    var changeColorSet = function changeColorSet(set) {
      chosenColors = set;
      polys = polys.map(function (a) {
        return [chosenColors.indexOf(chooseRandomFromArray(chosenColors)), a[1]];
      });
      fading = new Array(polys.length);

      for (var i = 0; i < polys.length; i++) {
        var _polys$i = _slicedToArray(polys[i], 2),
            clr = _polys$i[0],
            p = _polys$i[1];

        ctx.fillStyle = ctx.strokeStyle = chosenColors[clr];
        ctx.beginPath();
        ctx.moveTo.apply(ctx, p[0]);
        ctx.lineTo.apply(ctx, p[1]);
        ctx.lineTo.apply(ctx, p[2]);
        ctx.fill();
        ctx.stroke();

        if (Math.random() < 0.1) {
          var randClr = chooseRandomFromArray(chosenColors);
          fading[i] = [0, getGradient(chosenColors[clr], randClr, defaultNumStops), p];
          polys[i][0] = chosenColors.indexOf(randClr);
        }
      }
    };

    ctx.lineWidth = 0.001;

    el.style.position = 'relative';
    el.style.height = height + 2 + 'px';
    el.style.width = width + 2 + 'px';

    canvas.width = width;
    canvas.height = height;
    canvas.className = 'trianglify-canvas';

    changeColorSet(colorSet);

    wrapperParent.removeChild(wrapper);

    wrapperParent.insertAdjacentHTML('beforeend', templ);
    wrapperParent.appendChild(canvas);

    if (animate) {
      var animFrame = function animFrame(timestamp) {
        // randomly fade a few polygons
        for (var i = 0; i < fading.length; i++) {
          if (!fading[i]) continue;

          var _fading$i = _slicedToArray(fading[i], 3),
              stop = _fading$i[0],
              clrStops = _fading$i[1],
              p = _fading$i[2];

          ctx.fillStyle = ctx.strokeStyle = clrStops[stop];
          ctx.beginPath();
          ctx.moveTo.apply(ctx, p[0]);
          ctx.lineTo.apply(ctx, p[1]);
          ctx.lineTo.apply(ctx, p[2]);
          ctx.fill();
          ctx.stroke();

          if (stop + 1 < clrStops.length) fading[i][0] = stop + 1;else delete fading[i];
        }

        // every 1/2 second, fade a few more
        if (timestamp - lastTimestamp > 500) {
          for (var _i = 0; _i < polys.length; _i++) {
            var _polys$_i = _slicedToArray(polys[_i], 2),
                clr = _polys$_i[0],
                _p = _polys$_i[1];

            if (!!fading[_i]) continue;
            if (Math.random() < 0.03) {
              var randClr = chooseRandomFromArray(chosenColors);
              fading[_i] = [0, getGradient(chosenColors[clr], randClr, defaultNumStops), _p];
              polys[_i][0] = chosenColors.indexOf(randClr);
            }
          }

          lastTimestamp = timestamp;
        }

        return requestAnimationFrame(animFrame);
      };

      animFrame(0);
    }

    return {
      canvas: canvas,
      changeColorSet: changeColorSet
    };
  };

  var chosenTitleClr = title.dataset.clr || chooseRandomFromArray(Object.keys(choosableColors)),
      titleCanvas = void 0,
      changeTitleColorSet = void 0;

  window.onload = function () {
    var title = $('#title'),
        chosenClr = colors[chosenTitleClr],
        _trianglify = trianglify(title, chosenClr, true),
        canvas = _trianglify.canvas,
        changeColorSet = _trianglify.changeColorSet;


    titleCanvas = canvas;
    changeTitleColorSet = changeColorSet;

    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = $$('#header .subtitle a')[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var a = _step.value;

        a.style.color = chosenClr[2];
        if (a.classList.contains('resume-link')) {
          a.style.color = chosenClr[3];
        }
      }
    } catch (err) {
      _didIteratorError = true;
      _iteratorError = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion && _iterator.return) {
          _iterator.return();
        }
      } finally {
        if (_didIteratorError) {
          throw _iteratorError;
        }
      }
    }

    if (title.dataset.hasOwnProperty('changeable') && title.dataset.changeable !== 'false') {
      title.onclick = function () {
        var choosableClrs = Object.keys(choosableColors);
        if (~choosableClrs.indexOf(chosenTitleClr)) {
          choosableClrs.splice(choosableClrs.indexOf(chosenTitleClr), 1);
        }

        chosenTitleClr = chooseRandomFromArray(choosableClrs);
        chosenClr = choosableColors[chosenTitleClr];

        changeTitleColorSet(chosenClr);

        var _iteratorNormalCompletion2 = true;
        var _didIteratorError2 = false;
        var _iteratorError2 = undefined;

        try {
          for (var _iterator2 = $$('#header .subtitle a')[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
            var _a = _step2.value;

            _a.style.color = chosenClr[2];
            if (_a.classList.contains('resume-link')) {
              _a.style.color = chosenClr[3];
            }
          }
        } catch (err) {
          _didIteratorError2 = true;
          _iteratorError2 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion2 && _iterator2.return) {
              _iterator2.return();
            }
          } finally {
            if (_didIteratorError2) {
              throw _iteratorError2;
            }
          }
        }
      };
    }

    var _iteratorNormalCompletion3 = true;
    var _didIteratorError3 = false;
    var _iteratorError3 = undefined;

    try {
      for (var _iterator3 = $$('.trianglify')[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
        var t = _step3.value;

        trianglify(t, colors[t.dataset.clr || chooseRandomFromArray(Object.keys(choosableColors))]);
      }
    } catch (err) {
      _didIteratorError3 = true;
      _iteratorError3 = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion3 && _iterator3.return) {
          _iterator3.return();
        }
      } finally {
        if (_didIteratorError3) {
          throw _iteratorError3;
        }
      }
    }

    var _iteratorNormalCompletion4 = true;
    var _didIteratorError4 = false;
    var _iteratorError4 = undefined;

    try {
      for (var _iterator4 = $$('#site-header dt')[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
        var l = _step4.value;

        $(l, '.trianglify-ghost-text').style.color = colors[l.dataset.clr][1];
      }
    } catch (err) {
      _didIteratorError4 = true;
      _iteratorError4 = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion4 && _iterator4.return) {
          _iterator4.return();
        }
      } finally {
        if (_didIteratorError4) {
          throw _iteratorError4;
        }
      }
    }
  };

  var resizeTimeout = void 0,
      lastWindowWidth = window.innerWidth;

  window.onresize = function () {
    if (window.innerWidth === lastWindowWidth) return;

    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(function () {
      var title = $('#title'),
          childNodes = Array.prototype.slice.call(title.childNodes);

      var _iteratorNormalCompletion5 = true;
      var _didIteratorError5 = false;
      var _iteratorError5 = undefined;

      try {
        for (var _iterator5 = childNodes[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
          var n = _step5.value;

          if (n.className === 'trianglify-text' || n.className === 'trianglify-canvas') {
            title.removeChild(n);
          } else if (n.className === 'trianglify-ghost-text') {
            n.className = 'text-wrap';
          }
        }
      } catch (err) {
        _didIteratorError5 = true;
        _iteratorError5 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion5 && _iterator5.return) {
            _iterator5.return();
          }
        } finally {
          if (_didIteratorError5) {
            throw _iteratorError5;
          }
        }
      }

      title.setAttribute('style', '');

      var _trianglify2 = trianglify(title, colors[chosenTitleClr], true),
          canvas = _trianglify2.canvas,
          changeColorSet = _trianglify2.changeColorSet;

      titleCanvas = canvas;
      changeTitleColorSet = changeColorSet;
    }, Math.abs(window.innerWidth - lastWindowWidth) > 100 ? 0 : 100);
    lastWindowWidth = window.innerWidth;
  };
})();
//# sourceMappingURL=app.js.map
