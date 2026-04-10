import { chooseRandomFromObject, leftPad, lerp } from '$lib/utils.ts';

export type ColourRGB = [number, number, number];
export type ColourLAB = [number, number, number];
export type Colour = ColourRGB | ColourLAB;

// Colours from ColorBrewer
// https://bl.ocks.org/mbostock/5577023
export const choosableColors = {
  //YlGn: ["#addd8e","#78c679","#41ab5d","#238443"],
  YlGn: ["#8ec070", "#75b466", "#5faf5f", "#4ba056"],
  GnBu: ["#64bfcb", "#4fb0cd", "#3c9ec7", "#2a8cbe"],
  BuPu: ["#8c80bb", "#8c70b3", "#8b60ac", "#894fa3"],
  RdPu: ["#f882ab", "#f368a2", "#e94d9c", "#d93394"],
  YlOrRd: ["#f09540", "#ee7f36", "#ee652f", "#e74b28"]
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

export const hexToRGB = (hexClr: string) => {
  const rgbClrs = new Array(3);

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

  rgbClrs[0] /= 255;
  rgbClrs[1] /= 255;
  rgbClrs[2] /= 255;

  return Array.from(rgbClrs) as ColourRGB;
};

export const RGBToHex = (rgbClr: ColourRGB) => {
  return '#' + Array.from(rgbClr).map((x) => leftPad((255 * x).toString(16).split('.')[0], '0', 2)).join('');
};

export const lerpColour = (from: Colour, to: Colour, factor: number) => {
  return [lerp(from[0], to[0], factor), lerp(from[1], to[1], factor), lerp(from[2], to[2], factor)] as Colour;
};

// Gaussian interpolation of colors
export const interpolate = (colors: Array<Colour>, sigma_2 = 0.035, x = 0.5) => {
  const step = 1.0 / (colors.length - 1);
  let r = 0.0, g = 0.0, b = 0.0;
  let total = 0.0;
  let mu = 0.0;

  for (const _ of colors) {
    total += Math.exp(-(x - mu) * (x - mu) / (2.0 * sigma_2)) / Math.sqrt(2.0 * Math.PI * sigma_2);
    mu += step;
  }

  mu = 0.0;
  for (const color of colors) {
    const percent = Math.exp(-(x - mu) * (x - mu) / (2.0 * sigma_2)) / Math.sqrt(2.0 * Math.PI * sigma_2);
    mu += step;

    r += color[0] * percent / total;
    g += color[1] * percent / total;
    b += color[2] * percent / total;
  }

  return [r, g, b] as Colour;
};

export const getGradient = (fromClr: Colour, toClr: Colour, numStops: number) => {
  const stops = new Array(numStops);

  const steps = [
    toClr[0] - fromClr[0],
    toClr[1] - fromClr[1],
    toClr[2] - fromClr[2]
  ];

  for (let i=0; i<stops.length; i++) {
    stops[i] = fromClr.map((f: number, k: number) => f + (i + 1) * steps[k] / numStops);
  }

  return stops as Colour[];
};

export const luminance = (clr: ColourRGB) => {
  return (Math.max(...clr) + Math.min(...clr)) / 2;
};

export const mix = <Clr extends Colour,>(clrA: Clr, clrB: Clr, factor = 0.5) => {
  return clrA.map((c, i) => c + (clrB[i] - c) * factor) as Clr;
};

export const shade = (clr: ColourRGB, factor: number) => mix(clr, [0, 0, 0], factor);

export const tint = (clr: ColourRGB, factor: number) => mix(clr, [1, 1, 1], factor);

export const randBrightness = (clr: ColourRGB, variance = 40) => {
  return clr.map((x) => x + variance * (Math.random() - 0.5));
};
