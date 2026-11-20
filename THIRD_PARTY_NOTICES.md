# Third-Party Notices

Sune's own code is covered by [LICENSE](./LICENSE). This file covers third-party code that ends up in the built site (`dist/`). The build is not committed here: Cloudflare Pages produces it on every deploy and serves it from sune.planetrenox.com.

## Bundled in `dist/`

| Component | Where | License | Copyright |
|---|---|---|---|
| [Workbox](https://github.com/GoogleChrome/workbox) | `dist/workbox-*.js`, `dist/sw.js` | MIT | Copyright 2018 Google LLC |
| [Vite](https://github.com/vitejs/vite) (modulepreload polyfill) | `dist/assets/index-*.js` | MIT | Copyright (c) 2019-present, VoidZero Inc. and Vite contributors |
| [vite-plugin-pwa](https://github.com/vite-pwa/vite-plugin-pwa) | `dist/registerSW.js`, `dist/manifest.webmanifest` | MIT | Copyright (c) 2020-PRESENT Anthony Fu |
| [markdown-it-latex-plus](https://github.com/sune-org/markdown-it-latex-plus) | `dist/assets/index-*.js` | MIT-0 | Copyright 2026 PlanetRenox |

markdown-it-latex-plus is MIT No Attribution and asks for no notice. The other three are distributed under the MIT License:

```
MIT License

Copyright 2018 Google LLC
Copyright (c) 2019-present, VoidZero Inc. and Vite contributors
Copyright (c) 2020-PRESENT Anthony Fu <https://github.com/antfu>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## Loaded at runtime from CDNs (not redistributed)

These libraries are fetched by the browser from their CDNs and are not included in this repository or in the build. They are listed here for reference.

| Library | License |
|---|---|
| [Tailwind CSS](https://github.com/tailwindlabs/tailwindcss) (Play CDN) | MIT |
| [Alpine.js](https://github.com/alpinejs/alpine) | MIT |
| [cash-dom](https://github.com/fabiospampinato/cash) | MIT |
| [Lucide](https://github.com/lucide-icons/lucide) | ISC |
| [markdown-it](https://github.com/markdown-it/markdown-it) | MIT |
| [MathJax](https://github.com/mathjax/MathJax) | Apache-2.0 |
| [XyJax-v4](https://github.com/sonoisa/XyJax-v4) | Apache-2.0 |
| [TikZJax](https://github.com/drgrice1/tikzjax) | GPL-3.0-or-later (TeX files LPPL) |
| [Mermaid](https://github.com/mermaid-js/mermaid) | MIT |
| [viz-js](https://github.com/mdaines/viz-js) (Graphviz) | MIT (Graphviz EPL) |
| [Vega](https://github.com/vega/vega) and [Vega-Lite](https://github.com/vega/vega-lite) | BSD-3-Clause |
| [abcjs](https://github.com/paulrosen/abcjs) | MIT |
| [SmilesDrawer](https://github.com/reymond-group/smilesDrawer) | MIT |
| [DOMPurify](https://github.com/cure53/DOMPurify) | Apache-2.0 or MPL-2.0 |
| [highlight.js](https://github.com/highlightjs/highlight.js) | BSD-3-Clause |
| [github-markdown-css](https://github.com/sindresorhus/github-markdown-css) | MIT |
| [localForage](https://github.com/localForage/localForage) | Apache-2.0 |
| [CodeJar](https://github.com/antonmedv/codejar) | MIT |
| [tiny-ripple](https://www.npmjs.com/package/tiny-ripple) | See its LICENSE |
