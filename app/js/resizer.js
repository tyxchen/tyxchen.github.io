// Resizing things is difficult
// That's why we have this function

const Resizer = {
  listeners: [],
  addListener(listener) {
  	this.listeners.push(listener);
  },
  run() {
  	const frozen = this.listeners.slice();
    let resizeTimeout, lastWindowWidth = window.innerWidth;

  	window.addEventListener("resize", (e) => {
      if (window.innerWidth === lastWindowWidth) return;

      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
    		for (const l of frozen) {
    			l(e);
    		}
      }, Math.abs(window.innerWidth - lastWindowWidth) > 100 ? 0 : 100);
      lastWindowWidth = window.innerWidth;
  	});

    delete this.listeners;
    delete this.addListener;
  	delete this.run;
  }
};

export default Resizer;
