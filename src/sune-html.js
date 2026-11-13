import { el } from './dom.js';
import { esc } from './utils.js';

export const resolveSuneSrc = src => {
  if (!src) return null;
  if (src.startsWith('gh://')) {
    const path = src.substring(5), parts = path.split('/');
    if (parts.length < 3) return null;
    const[owner, repo, ...filePathParts] = parts;
    return `https://raw.githubusercontent.com/${owner}/${repo}/main/${filePathParts.join('/')}`;
  }
  return src;
};

export const processSuneIncludes = async (html, depth = 0) => {
  if (depth > 5) return '<!-- Sune include depth limit reached -->';
  if (!html) return '';
  
  // Bypass Sanitizer API by parsing into an inert document
  const doc = Document.parseHTMLUnsafe ? Document.parseHTMLUnsafe(html) : new DOMParser().parseFromString(html, 'text/html');
  const c = doc.body;

  // Includes load side by side; each one only replaces its own node
  await Promise.all([...c.querySelectorAll('sune')].map(async n => {
    if (!n.hasAttribute('src')) return n.replaceWith(...Array.from(n.childNodes));
    if (n.hasAttribute('private') && depth > 0) return n.remove();
    const s = n.getAttribute('src'), u = resolveSuneSrc(s);
    if (!u) return n.replaceWith(document.createComment(` Invalid src: ${esc(s)} `));
    try {
      const r = await fetch(u);
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const d = await r.json(), o = Array.isArray(d) ? d[0] : d, h =[o?.settings?.extension_html || '', o?.settings?.html || ''].join('\n');
      
      const subHtml = await processSuneIncludes(h, depth + 1);
      const subDoc = Document.parseHTMLUnsafe ? Document.parseHTMLUnsafe(subHtml) : new DOMParser().parseFromString(subHtml, 'text/html');
      n.replaceWith(...Array.from(subDoc.body.childNodes));
    } catch (e) {
      n.replaceWith(document.createComment(` Fetch failed: ${esc(u)} `));
    }
  }));
  return c.innerHTML;
};

/* A sune's life: its HTML is mounted, its scripts run, and later it is torn down (another sune, a thread opening, saved settings).
   On teardown the outgoing sune gets `sune:unmount` and SUNE.signal aborts, so it can undo what it set up:
     addEventListener('resize', fn, { signal: SUNE.signal })      SUNE.signal.addEventListener('abort', () => observer.disconnect()) */
let gen = 0, ac;
export const suneSignal = () => ac?.signal;
const isJs = s => !s.type || /^(text|application)\/(java|ecma)script$/i.test(s.type);

export const renderSuneHTML = async () => {
  const SUNE = window.SUNE, g = ++gen;
  const h = await processSuneIncludes([SUNE.extension_html, SUNE.html].map(x => (x || '').trim()).join('\n'));
  // A newer render started while the includes were loading: that one wins
  if (g !== gen) return;
  const c = el.suneHtml;
  // The event doesn't bubble, and a sune may listen on #suneHtml or on one of its own elements, so each gets it
  for (const n of [c, ...c.querySelectorAll('*')]) n.dispatchEvent(new CustomEvent('sune:unmount'));
  ac?.abort();
  ac = new AbortController();
  c.innerHTML = '';
  const t = h.trim();
  c.classList.toggle('hidden', !t);
  if (!t) return;
  const doc = Document.parseHTMLUnsafe ? Document.parseHTMLUnsafe(h) : new DOMParser().parseFromString(h, 'text/html');
  c.append(...Array.from(doc.body.childNodes));

  // Re-create script tags so they execute, in document order
  for (const old of c.querySelectorAll('script')) {
    const s = document.createElement('script');
    Array.from(old.attributes).forEach(attr => s.setAttribute(attr.name, attr.value));
    // An inline script runs through a global eval: its var and functions are global as usual (so onclick="..." finds them),
    // but its top-level let/const/class are its own, so the same script can run again on the next render
    s.textContent = s.src || !isJs(s) ? old.textContent : `(0,eval)(${JSON.stringify(old.textContent)})`;
    // A classic external script holds up the scripts after it, like the parser would
    const wait = s.src && isJs(s) && !s.noModule && !old.hasAttribute('async') && new Promise(r => s.onload = s.onerror = r);
    if (!old.hasAttribute('async')) s.async = false;
    old.replaceWith(s);
    if (wait) {
      await wait;
      if (g !== gen) return;
    }
  }
  window.Alpine?.initTree(c);
};
