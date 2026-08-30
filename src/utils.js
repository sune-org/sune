export const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
export const num = (v, d) => v == null || v === '' || isNaN(+v) ? d : +v;
export const int = (v, d) => v == null || v === '' || isNaN(parseInt(v)) ? d : parseInt(v);
export const gid = () => Math.random().toString(36).slice(2, 9);
export const esc = s => String(s).replace(/[&<>'"`]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;", "`": "&#96;" }[c]));
export const positionPopover = (a, p) => {
  const r = a.getBoundingClientRect();
  p.style.top = `${r.bottom + p.offsetHeight + 4 > window.innerHeight ? r.top - p.offsetHeight - 4 : r.bottom + 4}px`;
  p.style.left = `${Math.max(8, Math.min(r.right - p.offsetWidth, window.innerWidth - p.offsetWidth - 8))}px`;
};
export const sid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
export const fmtSize = b => {
  const u = ['B', 'KB', 'MB', 'GB', 'TB'];
  let i = 0, x = b;
  while (x >= 1024 && i < u.length - 1) { x /= 1024; i++; }
  return (x >= 10 ? Math.round(x) : Math.round(x * 10) / 10) + ' ' + u[i];
};
export const asDataURL = f => new Promise(r => { const fr = new FileReader(); fr.onload = () => r(String(fr.result || '')); fr.readAsDataURL(f); });
export const imgToWebp = (f, D = 128, q = 80) => new Promise((r, j) => {
  if (!f) return j();
  const i = new Image;
  i.onload = () => {
    const c = document.createElement('canvas'), x = c.getContext('2d');
    let w = i.width, h = i.height;
    if (D > 0 && Math.max(w, h) > D) w > h ? (h = D * h / w, w = D) : (w = D * w / h, h = D);
    c.width = w; c.height = h; x.drawImage(i, 0, 0, w, h);
    r(c.toDataURL('image/webp', clamp(q, 0, 100) / 100));
    URL.revokeObjectURL(i.src);
  };
  i.onerror = j; i.src = URL.createObjectURL(f);
});
export const b64 = x => x.split(',')[1] || '';
export const utob = s => btoa(unescape(encodeURIComponent(s)));
export const btou = s => decodeURIComponent(escape(atob(s.replace(/\s/g, ''))));

export async function copyToClipboard(text) {
  if (typeof text !== 'string') text = String(text ?? '');
  if (navigator.clipboard?.writeText) {
    try { await navigator.clipboard.writeText(text); return true; } catch {}
  }
  try {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    ta.style.left = '-9999px';
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    const ok = document.execCommand('copy');
    ta.remove();
    return ok;
  } catch { return false; }
}

export function partsToText(m, stripData = false) {
  if (!m) return '';
  const c = m.content, i = m.images, out = [];
  if (Array.isArray(c)) {
    for (const p of c) {
      if (p?.type === 'text') {
        if (p.text) out.push(p.text);
      } else if (p?.type === 'image_url') {
        const u = p.image_url?.url || '';
        if (!stripData || !u.startsWith('data:')) out.push(`![](${u})`);
      } else if (p?.type === 'file') {
        out.push(`[${p.file?.filename || 'file'}]`);
      } else if (p?.type === 'input_audio') {
        out.push(`(audio:${p.input_audio?.format || ''})`);
      }
    }
  } else if (c != null) {
    out.push(String(c));
  }
  if (Array.isArray(i)) {
    for (const x of i) {
      const u = x.image_url?.url || '';
      if (!stripData || !u.startsWith('data:')) out.push(`![](${u})`);
    }
  }
  return out.join('\n');
}

export function dl(name, obj) {
  const blob = new Blob([JSON.stringify(obj, null, 2)], { type: name.endsWith('.sune') ? 'application/octet-stream' : 'application/json' }),
    url = URL.createObjectURL(blob),
    a = document.createElement('a');
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export const ts = () => {
  const d = new Date(), p = n => String(n).padStart(2, '0');
  return `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}`;
};
