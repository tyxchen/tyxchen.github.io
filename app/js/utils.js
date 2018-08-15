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

// leftPad(string: String, pad: Char, length: Int) - pad a string to its left to `length` with `pad`
export const leftPad = (str, pad, len) =>
  str.length < len ? (new Array(len - str.length + 1).join(pad) + str) : str;
