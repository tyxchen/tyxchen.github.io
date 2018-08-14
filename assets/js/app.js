(() => {
  const $ = (ctx, sel) => (!sel ? document : ctx).querySelector(sel || ctx),
        $$ = (ctx, sel) => Array.prototype.slice.call((!sel ? document : ctx).querySelectorAll(sel || ctx));

  // Basic router functionality
  
  //document.
  
  // Toggle theme
  $('#toggle-theme').addEventListener('click', function(e) {
    e.preventDefault();

    let prevTheme = localStorage.getItem('theme'), newTheme;
    
    if (prevTheme === 'dark') {
      newTheme = 'light';
    } else {
      newTheme = 'dark';
    }
    
    this.textContent = `Switch to ${prevTheme} mode`;
    
    document.documentElement.dataset.theme = newTheme;
    localStorage.setItem('theme', newTheme);
  });
  
  if (localStorage.getItem('theme') === 'dark') {
    $('#toggle-theme').textContent = 'Switch to light mode';
  }
  
  // Page-specific
  
  // Portfolio - trianglify background
  if ($('#showcase-bg')) {
    const canvas = $('#showcase-bg'),
          ctx = canvas.getContext('2d'),
          colors = ['#ccc', '#ddd', '#eee', '#fff'];
    
    canvas.width = $('main').getBoundingClientRect().width;
    canvas.height = window.innerHeight;
    
    const polys = generate_triangles({
      width: canvas.width,
      height: canvas.height,
      color_fcn: () => chooseRandomFromArray(colors)
    });
    
    ctx.lineWidth = 1.51;
    
    for (let [clr, poly] of polys) {
      ctx.fillStyle = ctx.strokeStyle = clr;
      ctx.beginPath();
      ctx.moveTo.apply(ctx, poly[0]);
      ctx.lineTo.apply(ctx, poly[1]);
      ctx.lineTo.apply(ctx, poly[2]);
      ctx.fill();
      ctx.stroke();
    }
  }
})();
