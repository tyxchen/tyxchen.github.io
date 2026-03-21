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

// Horizontal offsets of capital letters, in em, for optical left-alignment 
export const letterOffsets = {
  A: 0.0078,
  B: -0.0625,
  C: -0.0391,
  D: -0.0625,
  E: -0.0625,
  F: -0.0625,
  G: -0.0391,
  H: -0.0625,
  I: -0.0625,
  J: -0.0313,
  K: -0.0625,
  L: -0.0625,
  M: -0.0625,
  N: -0.0625,
  O: -0.0391,
  P: -0.0625,
  Q: -0.0391,
  R: -0.0625,
  S: -0.0156,
  U: -0.0547,
  V: -0.0156,
  W: -0.0078,
  Z: -0.0625
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
  
  while (/%[aAwdbBmyYHIpMSF]|%-d|%-m/.test(format)) {
    format = format.replace(/%([aAwdbBmyYHIpMSF]|-d|-m)/g, (_, match) => substitutes[match as keyof typeof substitutes]);
  }

  return format;
};
