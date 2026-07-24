import { renderToString } from 'katex';

export default function(options = {}) {
  return {
    name: 'satteri-katex',
    math(node, ctx) {
      const html = renderToString(node.value, {
        ...options,
        displayMode: true,
        throwOnError: false,
      });
      return {
        // need to escape curly braces otherwise they will be parsed as JSX
        raw: html.replace(/{/g, '&#123;').replace(/}/g, '&#125;'),
        mdxExpressions: false,
      };
    },
    inlineMath(node, ctx) {
      const html = renderToString(node.value, {
        ...options,
        displayMode: false,
        throwOnError: false,
      });
      return {
        raw: html.replace(/{/g, '&#123;').replace(/}/g, '&#125;'),
        mdxExpressions: false,
      };
    },
  };
}
