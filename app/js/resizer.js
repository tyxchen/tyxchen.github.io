// Resizing things is difficult
// That's why we have this function

const Resizer = {
  listeners: {},
  addListener(listener) {
    const key = Symbol();
  	this.listeners[key] = listener;
    return key;
  },
  removeListener(key) {
    delete this.listeners[key];
  },
};

// private variables
let resizeTimeout, lastWindowWidth = window.innerWidth;

window.addEventListener("resize", (e) => {
  if (window.innerWidth === lastWindowWidth) return;

  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(() => {
    for (const l in Resizer.listeners) {
      Resizer.listeners[l](e);
    }
  }, Math.abs(window.innerWidth - lastWindowWidth) > 100 ? 0 : 100);
  lastWindowWidth = window.innerWidth;
});

export default Resizer;
