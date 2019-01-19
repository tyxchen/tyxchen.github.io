import { chooseRandomFromObject, leftPad } from '@js/utils.js';

// Colours from ColorBrewer
// https://bl.ocks.org/mbostock/5577023
export const choosableColors = {
  //YlGn: ["#addd8e","#78c679","#41ab5d","#238443"],
  YlGn: ["#addd8e","#89cc7d","#65bb6d","#41ab5d"],
  GnBu: ["#7bccc4","#4eb3d3","#2b8cbe","#0868ac"],
  BuPu: ["#8c96c6","#8c6bb1","#88419d","#810f7c"],
  PuRd: ["#e7298a","#ce1256","#980043","#67001f"],
  RdPu: ["#f768a1","#dd3497","#ae017e","#7a0177"],
  YlOrRd: ["#feb24c","#fd8d3c","#fc4e2a","#e31a1c"]
};

export const baseColors = {
  //Pu: ["#8c6bb1","#807dba","#6a51a3","#54278f"], // [0] from BuPu[1]
  Pu: ["#807dba","#7160ab","#62439d","#54278f"],
  //Bu: ["#6baed6","#4292c6","#2171b5","#08519c"],
  Bu: ["#4292c6","#2e7cb8","#1b66aa","#08519c"],
  Gn: ["#41ab5d","#2b964c","#15813c","#006d2c"],
  //Or: ["#fd8d3c","#f16913","#d94801","#a63603"],
  Or: ["#f16913","#d8580d","#bf4708","#a63603"],
  Rd: ["#fb6a4a","#ef3b2c","#cb181d","#a50f15"]
};

export const constColors = {
  red: ['#f00'],
  green: ['#0c0'],
  blue: ['#00f'],
  black: ['#000'],
  white: ['#fff']
};

export const colors = {
  ...choosableColors,
  ...baseColors,
  ...constColors,
  get random() {
    return chooseRandomFromObject(choosableColors);
  }
};

// Color functions

export const hexToRGB = (hexClr) => {
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

export const RGBToHex = (rgbClr) => {
  return '#' + Array.from(rgbClr).map((x) => leftPad((x).toString(16), 0, 2)).join('');
};

export const interpolate = (colors, sigma_2 = 0.035, x = 0.5) => {
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

export const getGradient = (fromClr, toClr, numStops) => {
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

export const luminance = (clr) => {
  return (Math.max(...clr) + Math.min(...clr)) / 510; // 510 = 2 * 255
};

export const mix = (clrA, clrB, factor = 0.5) => {
  return clrA.map((c, i) => c + (clrB[i] - c) * factor);
};

export const shade = (clr, factor) => mix(clr, [0, 0, 0], factor);

export const tint = (clr, factor) => mix(clr, [255, 255, 255], factor);

export const randBrightness = (clr, variance = 40) => {
  return clr.map(x => x + variance * (Math.random() - 0.5));
};
