import { chooseRandomFromObject, leftPad } from '$lib/utils.ts';

export type Colour = [number, number, number];

// Colours from ColorBrewer
// https://bl.ocks.org/mbostock/5577023
export const choosableColors = {
  //YlGn: ["#addd8e","#78c679","#41ab5d","#238443"],
  YlGn: ["#abdc8e", "#92d183", "#77c577", "#5cb86a"],
  GnBu: ["#64bfcb", "#4fb0cd", "#3c9ec7", "#2a8cbe"],
  BuPu: ["#8c80bb", "#8c70b3", "#8b60ac", "#894fa3"],
  RdPu: ["#f882ab", "#f368a2", "#e94d9c", "#d93394"],
  YlOrRd: ["#fd9e44", "#fd883b", "#fc6c33", "#f84f2a"]
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
  const rgbClrs = new Uint8ClampedArray(3);

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

  return Array.from(rgbClrs) as Colour;
};

export const RGBToHex = (rgbClr: Colour) => {
  return '#' + Array.from(rgbClr).map((x) => leftPad((x).toString(16), '0', 2)).join('');
};

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

  return Array.from(new Uint8ClampedArray([r, g, b])) as Colour;
};

export const getGradient = (fromClr: Colour, toClr: Colour, numStops: number) => {
  const stops = new Array(numStops);

  const steps = [
    toClr[0] - fromClr[0],
    toClr[1] - fromClr[1],
    toClr[2] - fromClr[2]
  ];

  for (let i=0; i<stops.length; i++) {
    stops[i] = fromClr.map((f: number, k: number) => Math.floor(f + (i + 1) * steps[k] / numStops));
  }

  return stops as Colour[];
};

export const luminance = (clr: Colour) => {
  return (Math.max(...clr) + Math.min(...clr)) / 510; // 510 = 2 * 255
};

export const mix = (clrA: Colour, clrB: Colour, factor = 0.5) => {
  return clrA.map((c, i) => c + (clrB[i] - c) * factor);
};

export const shade = (clr: Colour, factor: number) => mix(clr, [0, 0, 0], factor);

export const tint = (clr: Colour, factor: number) => mix(clr, [255, 255, 255], factor);

export const randBrightness = (clr: Colour, variance = 40) => {
  return clr.map((x) => x + variance * (Math.random() - 0.5));
};
