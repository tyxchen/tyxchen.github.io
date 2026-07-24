// Utility functions

// DOM selection aliases
// $(el, selector) - alias for el.querySelector(selector)
// $$(el, selector) - alias for el.querySelectorAll(selector)

export function $(ctx: Element, sel: string): Element | null;
export function $(sel: string): Element | null;
export function $(ctx: Element | string, sel?: string) { return (!sel ? document : ctx as Element).querySelector(sel ?? ctx as string); }

export function $$(ctx: Element, sel: string): Element[];
export function $$(sel: string): Element[];
export function $$(ctx: Element | string, sel?: string) { return Array.from((!sel ? document : ctx as Element).querySelectorAll(sel ?? ctx as string)); }

// Array fcns

// get a random index that is valid for `array`
export const chooseRandomIndex      = <T>(arr: T[]) =>
  Math.floor(Math.random() * arr.length);
// choose a random element from `array`
export const chooseRandomFromArray  = <T>(arr: T[]) =>
  arr[chooseRandomIndex(arr)];
// choose a random value from `object`
export const chooseRandomFromObject = <K extends string | number | symbol, T>(obj: Record<K, T>) =>
  obj[chooseRandomFromArray(Object.keys(obj) as K[])];
// Fisher-Yates shuffle
export const shuffle = <T>(arr: T[], curVal?: T) => {
  arr = arr.slice();
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = arr[j];
    arr[j] = arr[i];
    arr[i] = tmp;
  }
  // don't repeat between shuffles
  if (curVal === arr[0]) {
    arr[0] = arr[arr.length >> 1];
    arr[arr.length >> 1] = curVal!;
  }
  return arr;
};

// Escape text for HTML insertion
export const escapeText = (str: string) =>
  str.replaceAll('&', '&amp;')
    .replaceAll('<', '&lt')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');

// leftPad(string: String, pad: Char, length: Int) - pad a string to its left to `length` with `pad`
export const leftPad = (str: string, pad: string, len: number) =>
  str.length < len ? (new Array(len - str.length + 1).join(pad) + str) : str;

// Turns a boolean into an attribute value for conditional attributes in JSX. (e.g. `disabled={toAttributeBool(isDisabled)}`)
export const toConditionalValue = (value: boolean) => {
  return value ? "" : undefined;
};

// Horizontal offsets of capital letters, in em, for optical left-alignment 
export const letterOffsets = {
  A: -0.002,
  B: -0.0465,
  C: -0.0252,
  D: -0.0465,
  E: -0.0465,
  F: -0.0465,
  G: -0.0252,
  H: -0.0465,
  I: -0.0465,
  J: -0.0252,
  K: -0.0465,
  L: -0.0465,
  M: -0.0465,
  N: -0.0465,
  O: -0.0252,
  P: -0.0465,
  Q: -0.0252,
  R: -0.0465,
  S: -0.032,
  T: -0.0203,
  U: -0.0455,
  V: -0.002,
  W: -0.002,
  X: -0.002,
  Y: -0.002,
  Z: -0.0252,
};

// lerp function
export const lerp = (a: number, b: number, s: number) => a + (b - a) * s;

export const formatDate = (date: Date, format: string = "%Y.%m.%d", locale: string = "en-CA") => {
  const substitutes = {
    get a() { return date.toLocaleDateString(locale, { weekday: 'short' }); },
    get A() { return date.toLocaleDateString(locale, { weekday: 'long' }); },
    get w() { return date.getDay().toString(); },
    get d() { return date.toLocaleDateString(locale, { day: '2-digit' }); },
    get ["-d"]() { return date.toLocaleDateString(locale, { day: 'numeric' }); },
    get b() { return date.toLocaleDateString(locale, { month: 'short' }); },
    get B() { return date.toLocaleDateString(locale, { month: 'long' }); },
    get m() { return date.toLocaleDateString(locale, { month: '2-digit' }); },
    get ["-m"]() { return date.toLocaleDateString(locale, { month: 'numeric' }); },
    get y() { return date.toLocaleDateString(locale, { year: '2-digit' }); },
    get Y() { return date.toLocaleDateString(locale, { year: 'numeric' }); },
    get H() { return date.toLocaleTimeString(locale, { hour: '2-digit', hour12: false }); },
    get I() { return date.toLocaleTimeString(locale, { hour: '2-digit', hour12: true }).split(' ')[0]; },
    get p() { return date.toLocaleTimeString(locale, { hour: '2-digit', hour12: true }).split(' ')[1]; },
    get M() { return date.toLocaleTimeString(locale, { minute: '2-digit' }); },
    get S() { return date.toLocaleTimeString(locale, { second: '2-digit' }); },
    'F': '%Y-%m-%d'
  };
  const regex = /%([aAwdbBmyYHIpMSF]|-d|-m)/;
  
  while (regex.test(format)) {
    format = format.replace(new RegExp(regex, "g"), (_, match) => substitutes[match as keyof typeof substitutes]);
  }

  return format;
};

// wrap text to constraints of el
// returns a SVG string
// inspired by https://bl.ocks.org/mbostock/7555321
export const wrapText = (text: string, el: HTMLElement) => {
  const SVG = "http://www.w3.org/2000/svg";
  const words = escapeText(text).split(/\s/);
  const lineHeight = 1;
  const width = Math.ceil(el.getBoundingClientRect().width * 1.0125); // give some wiggle room
  const fontSizeGr72 = parseInt(getComputedStyle(el, null).fontSize) > 72;
  const builder: string[] = [];
  let line: string[] = [];
  let dy = 1;
  let word: string | undefined;

  const svg = document.createElementNS(SVG, "svg");
  const textNode = document.createElementNS(SVG, "text");
  const tspan = document.createElementNS(SVG, "tspan");

  svg.setAttribute("width", "0");
  svg.setAttribute("height", "0");
  tspan.setAttributeNS(SVG, "x", "0");
  tspan.setAttributeNS(SVG, "y", "0");
  tspan.style.display = "inline-block";

  textNode.appendChild(tspan);
  svg.appendChild(textNode);
  el.appendChild(svg);

  while ((word = words.shift())) {
    if (word.trim().length === 0) continue;
    line.push(word);
    tspan.textContent = line.join(" ");
    if (Math.floor(tspan.getComputedTextLength()) > width && line.length > 1) {
      line.pop();
      builder.push(
        `<tspan x="0" y="0" dx="${fontSizeGr72 ? (letterOffsets[line[0][0] as keyof typeof letterOffsets] || 0) : 0}em" dy="${dy}em">${line.join(" ")}</tspan>`,
      );
      line = [word];
      dy += lineHeight;
    }
  }
  builder.push(
    `<tspan x="0" y="0" dx="${fontSizeGr72 ? (letterOffsets[line[0][0] as keyof typeof letterOffsets] || 0) : 0}em" dy="${dy}em">${line.join(" ")}</tspan>`,
  );

  el.removeChild(svg);

  return builder.join("");
};
