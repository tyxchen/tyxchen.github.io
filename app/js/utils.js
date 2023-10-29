// Utility functions

// DOM selection aliases
// $(el, selector) - alias for el.querySelector(selector)
// $$(el, selector) - alias for el.querySelectorAll(selector)

export const $ = (ctx, sel) =>
  (!sel ? document : ctx).querySelector(sel || ctx);
export const $$ = (ctx, sel) =>
  Array.from((!sel ? document : ctx).querySelectorAll(sel || ctx));

// Array fcns
// chooseRandomIndex(array: Any[]) - get a random index that is valid for `array`
// chooseRandomFromArray(array: Any[]) - choose a random element from `array`
// chooseRandomFromObject(object: Object) - choose a random value from `object`

export const chooseRandomIndex      = (arr) =>
  Math.floor(Math.random() * arr.length);
export const chooseRandomFromArray  = (arr) =>
  arr[chooseRandomIndex(arr)];
export const chooseRandomFromObject = (obj) =>
  obj[chooseRandomFromArray(Object.keys(obj))];

export const escapeText = (str) =>
  str.replaceAll('&', '&amp;')
    .replaceAll('<', '&lt')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');

// leftPad(string: String, pad: Char, length: Int) - pad a string to its left to `length` with `pad`
export const leftPad = (str, pad, len) =>
  str.length < len ? (new Array(len - str.length + 1).join(pad) + str) : str;

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
