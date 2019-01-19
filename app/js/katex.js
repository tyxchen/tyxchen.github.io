import {
  $,
  $$
} from '@js/utils.js';

export default function() {
  const renderKatex = (tex) => {
    tex.insertAdjacentHTML('afterend', katex.renderToString(tex.textContent.replace(/%.*/g, ''), {
      throwOnError: false,
      displayMode: tex.type.includes('mode=display')
    }));
  };

  if ($('[type*="math/tex"]')) {
    const loadKatex = new Promise((res, rej) => {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/katex@0.10.0/dist/katex.min.js';
        script.integrity = 'sha256-q01RVaHUJiYq9aq0FwkI6GAmMtOmRgToK8aEHHm4Xl8=';
        script.crossOrigin = 'anonymous';
        script.onload = res;
        script.onerror = rej;
        $('head').appendChild(script);
      
        $('head').insertAdjacentHTML('beforeend',
          `<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.10.0/dist/katex.min.css" integrity="sha256-BZ71u1P7NUocEN9mKkcAovn3q5JPm/r9xVyjWh/Kqrc=" crossorigin="anonymous">`)
      });

    loadKatex.then(() => {
      $$('[type*="math/tex"]').forEach(renderKatex);

      $('html').classList.remove('no-katex');
    }).catch((e) => {
      console.error("KaTeX script failed to load: " + e.message);
    })
  }
};
