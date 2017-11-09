"use strict";

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

(function () {
  // Colours from ColorBrewer
  // https://bl.ocks.org/mbostock/5577023
  var choosableColors = {
    YlGn: ["#addd8e", "#78c679", "#41ab5d", "#238443"],
    GnBu: ["#7bccc4", "#4eb3d3", "#2b8cbe", "#0868ac"],
    BuPu: ["#8c96c6", "#8c6bb1", "#88419d", "#810f7c"],
    PuRd: ["#e7298a", "#ce1256", "#980043", "#67001f"],
    RdPu: ["#f768a1", "#dd3497", "#ae017e", "#7a0177"],
    YlOrRd: ["#feb24c", "#fd8d3c", "#fc4e2a", "#e31a1c"]
  };
  var baseColors = {
    Pu: ["#807dba", "#6a51a3", "#54278f", "#3f007d"],
    Bu: ["#4292c6", "#2171b5", "#08519c", "#08306b"],
    Gn: ["#41ab5d", "#238b45", "#006d2c", "#00441b"],
    Or: ["#f16913", "#d94801", "#a63603", "#7f2704"],
    Rd: ["#ef3b2c", "#cb181d", "#a50f15", "#67000d"]
  };
  var colors = _extends({}, choosableColors, baseColors);

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

  // wrap text to constraints of el
  // returns a SVG string
  // inspired by https://bl.ocks.org/mbostock/7555321
  var wrapText = function wrapText(text, el) {
    var SVG = "http://www.w3.org/2000/svg";
    var words = text.split(/\s/),
        line = [],
        lineHeight = 1,
        svg = document.createElementNS(SVG, 'svg'),
        textNode = document.createElementNS(SVG, 'text'),
        tspan = document.createElementNS(SVG, 'tspan'),
        width = Math.ceil(el.getBoundingClientRect().width),
        // give some wiggle room
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
        builder.push("<tspan x=\"0\" y=\"0\" dy=\"" + dy + "em\">" + line.join(' ') + "</tspan>");
        line = [word];
        dy += lineHeight;
      }
    }
    builder.push("<tspan x=\"0\" y=\"0\" dy=\"" + dy + "em\">" + line.join(' ') + "</tspan>");

    el.removeChild(svg);

    return builder.join('');
  };

  var trianglify = function trianglify(el, colorSet) {
    var animate = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
    var cell_size = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 32;
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
        templ = "<span class=\"trianglify-text\" style=\"width:" + width + "px;height:" + height + "px\">\n    <svg class=\"trianglify-svg\" xmlns=\"http://www.w3.org/2000/svg\">\n      <defs>\n        <mask id=\"" + maskId + "\" x=\"0\" y=\"0\" width=\"100%\" height=\"100%\">\n          <rect x=\"0\" y=\"0\" width=\"100%\" height=\"100%\"></rect>\n          <text class=\"" + el.className + "\" x=\"0\" y=\"0\" dy=\".95em\">" + wrapText(text, wrapper) + "</text>\n        </mask>\n      </defs>\n      <rect x=\"0\" y=\"0\" width=\"100%\" height=\"100%\" fill=\"white\" mask=\"url(#" + maskId + ")\"/>\n  </span>\n  <span class=\"trianglify-ghost-text\">" + text + "</span>",
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
    el.style.height = height + 'px';
    el.style.width = width + 'px';

    canvas.width = width - 2;
    canvas.height = height - 2;
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

  var chosenRandClr = chooseRandomFromArray(Object.keys(choosableColors)),
      titleCanvas = void 0,
      changeTitleColorSet = void 0;
  window.onload = function () {
    var randClr = choosableColors[chosenRandClr],
        _trianglify = trianglify($('#title'), randClr, true),
        canvas = _trianglify.canvas,
        changeColorSet = _trianglify.changeColorSet;


    titleCanvas = canvas;
    changeTitleColorSet = changeColorSet;

    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = $$('#site-header .subtitle a')[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var a = _step.value;

        a.style.color = randClr[2];
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

    $('#title').style.cursor = 'pointer';
    $('#title').onclick = function () {
      var choosableClrs = Object.keys(choosableColors);
      choosableClrs.splice(choosableClrs.indexOf(chosenRandClr), 1);

      chosenRandClr = chooseRandomFromArray(choosableClrs);
      randClr = choosableColors[chosenRandClr];

      changeTitleColorSet(randClr);

      var _iteratorNormalCompletion2 = true;
      var _didIteratorError2 = false;
      var _iteratorError2 = undefined;

      try {
        for (var _iterator2 = $$('#site-header .subtitle a')[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
          var _a = _step2.value;

          _a.style.color = randClr[2];
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

    trianglify($('#about-heading'), colors.Or);
    trianglify($('#portfolio-heading'), colors.Rd);
    trianglify($('#blog-heading'), colors.Bu);
    trianglify($('#contact-heading'), colors.Gn);
  };

  window.onresize = function () {
    var _trianglify2 = trianglify($('#title'), choosableColors[chosenRandClr], true),
        canvas = _trianglify2.canvas,
        changeColorSet = _trianglify2.changeColorSet;

    titleCanvas = canvas;
    changeTitleColorSet = changeColorSet;
  };
})();
//# sourceMappingURL=app.js.map
