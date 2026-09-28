# Third-Party Notices

Sune's own code is covered by [LICENSE](./LICENSE). This file covers third-party code that this repository redistributes in the committed build output (`dist/`).

## Bundled in `dist/`

| Component | Where | License | Copyright |
|---|---|---|---|
| [Workbox](https://github.com/GoogleChrome/workbox) | `dist/workbox-*.js`, `dist/sw.js` | MIT | Copyright 2018 Google LLC |
| [Vite](https://github.com/vitejs/vite) (modulepreload polyfill) | `dist/assets/index-*.js` | MIT | Copyright (c) 2019-present, VoidZero Inc. and Vite contributors |
| [vite-plugin-pwa](https://github.com/vite-pwa/vite-plugin-pwa) | `dist/registerSW.js`, `dist/manifest.webmanifest` | MIT | Copyright (c) 2020-PRESENT Anthony Fu |

All three are distributed under the MIT License:

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

These libraries are fetched by the browser from their CDNs and are not included in this repository. They are listed here for reference.

| Library | License |
|---|---|
| [Tailwind CSS](https://github.com/tailwindlabs/tailwindcss) (Play CDN) | MIT |
| [Alpine.js](https://github.com/alpinejs/alpine) | MIT |
| [cash-dom](https://github.com/fabiospampinato/cash) | MIT |
| [Lucide](https://github.com/lucide-icons/lucide) | ISC |
| [markdown-it](https://github.com/markdown-it/markdown-it) | MIT |
| [markdown-it-mathjax3](https://github.com/tani/markdown-it-mathjax3) | MIT |
| [highlight.js](https://github.com/highlightjs/highlight.js) | BSD-3-Clause |
| [github-markdown-css](https://github.com/sindresorhus/github-markdown-css) | MIT |
| [localForage](https://github.com/localForage/localForage) | Apache-2.0 |
| [CodeJar](https://github.com/antonmedv/codejar) | MIT |
| [tiny-ripple](https://www.npmjs.com/package/tiny-ripple) | See its LICENSE |
