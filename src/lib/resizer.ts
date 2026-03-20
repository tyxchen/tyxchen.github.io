// Resizing things is difficult
// That's why we have this function

const Resizer = {
  listeners: {} as Record<symbol, (e: Event) => void>,
  addListener(listener: (e: Event) => void) {
    const key = Symbol();
  	this.listeners[key] = listener;
    return key;
  },
  removeListener(key: symbol) {
    delete this.listeners[key];
  },
};

// private variables
let resizeTimeout: number;
let lastWindowWidth = globalThis.innerWidth;

globalThis.addEventListener("resize", (e) => {
  if (globalThis.innerWidth === lastWindowWidth) return;

  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(() => {
    for (const l of Object.getOwnPropertySymbols(Resizer.listeners)) {
      Resizer.listeners[l](e);
    }
  }, Math.abs(globalThis.innerWidth - lastWindowWidth) > 100 ? 0 : 100);
  lastWindowWidth = globalThis.innerWidth;
});

export default Resizer;
