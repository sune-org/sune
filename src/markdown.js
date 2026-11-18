import latexPlus from 'markdown-it-latex-plus';
import { copyToClipboard } from './utils.js';

// LaTeX and figures (tikz, mermaid, dot, vega-lite, abc, smiles, svg) come from markdown-it-latex-plus.
// It is tiny; MathJax and the figure libraries are fetched the first time a message needs them.
export const md = window.md = window.markdownit({ html: false, linkify: true, typographer: true, breaks: true }).use(latexPlus);
md.linkify.set({ fuzzyLink: true });

export function enhanceCodeBlocks(root, doHL = true) {
  window.$(root).find('pre>code').each((i, code) => {
    // Figures waiting to be drawn, or that failed, show their source in a <pre> the plugin owns
    if (code.textContent.length > 200000 || code.closest('.mlp')) return;
    const $pre = window.$(code).parent().addClass('relative rounded-xl border border-gray-200');
    if (!$pre.find('.code-actions').length) {
      const len = code.textContent.length, countText = len >= 1e3 ? (len / 1e3).toFixed(1) + 'K' : len;
      const $btn = window.$('<button class="bg-slate-900 text-white rounded-lg py-1 px-2 text-xs opacity-85">Copy</button>').on('click', async e => {
        e.stopPropagation();
        if (await copyToClipboard(code.innerText)) {
          $btn.text('Copied');
          setTimeout(() => $btn.text('Copy'), 1200);
        }
      });
      const $container = window.$('<div class="code-actions absolute top-2 right-2 flex items-center gap-2"></div>');
      $container.append(window.$(`<span class="text-xs text-gray-500">${countText} chars</span>`), $btn);
      $pre.append($container);
    }
    if (doHL && window.hljs && code.textContent.length < 100000) window.hljs.highlightElement(code);
  });
}

export const renderMarkdown = window.renderMarkdown = function (node, text, opt = { enhance: true, highlight: true }) {
  node.innerHTML = md.render(text);
  if (opt.enhance) enhanceCodeBlocks(node, opt.highlight);
  // Finished formulas and figures come back from the plugin's cache on every repaint; this draws the new ones
  md.latexPlus.hydrate(node);
};
