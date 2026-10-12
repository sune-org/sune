import { asDataURL } from './utils.js';

// Videos are shrunk to 360p @ 4 fps before attaching; HEVC when the device can encode it, H.264 otherwise.
const SHORT_SIDE = 360, FPS = 4, VIDEO_BPS = { hevc: 130e3, avc: 160e3 }, AUDIO_BPS = 32e3;
const even = n => Math.max(2, Math.round(n / 2) * 2);
let mb;
const loadMb = async () => {
  if (mb) return mb;
  const m = await import('mediabunny');
  if (!(await m.canEncodeAudio('aac', { numberOfChannels: 1, sampleRate: 48000, bitrate: AUDIO_BPS }))) (await import('@mediabunny/aac-encoder')).registerAacEncoder();
  return mb = m;
};

export const isVideo = (name, mime) => /^video\//.test(mime) || /\.(mp4|m4v|mov|webm|mkv|3gp)$/i.test(name);

export async function compressVideo(file, { onProgress, signal } = {}) {
  const { Input, Output, Conversion, ALL_FORMATS, BlobSource, BufferTarget, Mp4OutputFormat, Quality, canEncodeVideo } = await loadMb();
  const input = new Input({ source: new BlobSource(file), formats: ALL_FORMATS }), track = await input.getPrimaryVideoTrack();
  if (!track) throw new Error('no video track');
  const w = await track.getDisplayWidth(), h = await track.getDisplayHeight(), s = Math.min(1, SHORT_SIDE / Math.min(w, h)), width = even(w * s), height = even(h * s);
  let codec = null;
  for (const c of ['hevc', 'avc']) if (await canEncodeVideo(c, { width, height, frameRate: FPS, bitrate: VIDEO_BPS[c] })) { codec = c; break; }
  if (!codec) throw new Error('this device cannot encode HEVC or H.264');
  const output = new Output({ format: new Mp4OutputFormat({ fastStart: 'in-memory' }), target: new BufferTarget() });
  const video = { frameRate: FPS, codec, quality: new Quality({ bitrate: VIDEO_BPS[codec] }), forceTranscode: true };
  // Mediabunny resizes every decoded frame before dropping to FPS, so resize in `process` (runs after the drop) instead.
  // `draw` bakes in each frame's rotation, so cancelling the track rotation skips Mediabunny's per-frame re-render too.
  if (await track.getFlip()) Object.assign(video, { width, height, fit: 'fill' });
  else {
    const cx = new OffscreenCanvas(width, height).getContext('2d'), rot = await track.getRotation();
    cx.imageSmoothingQuality = 'high';
    Object.assign(video, { process: f => (f.draw(cx, 0, 0, width, height), cx.canvas), processedWidth: width, processedHeight: height, rotate: (360 - rot) % 360 });
  }
  const conv = await Conversion.init({
    input, output, tracks: 'primary', video,
    audio: { numberOfChannels: 1, codec: 'aac', quality: new Quality({ bitrate: AUDIO_BPS }), forceTranscode: true }
  });
  if (!conv.isValid) throw new Error(conv.discardedTracks.map(t => t.reason).join(', ') || 'unsupported video');
  if (signal) { if (signal.aborted) return null; signal.addEventListener('abort', () => conv.cancel(), { once: true }); }
  conv.onProgress = p => onProgress?.(p);
  try { await conv.execute(); } catch (e) { if (signal?.aborted) return null; throw e; }
  return { type: 'video_url', video_url: { url: await asDataURL(new Blob([output.target.buffer], { type: 'video/mp4' })) } };
}

const blobUrls = new Set();
const toBlobUrl = async u => { const o = URL.createObjectURL(await (await fetch(u)).blob()); blobUrls.add(o); return o; };
export const revokeVideoUrls = () => { blobUrls.forEach(u => URL.revokeObjectURL(u)); blobUrls.clear(); };

function openPlayer(src) {
  const o = document.createElement('div');
  o.className = 'fixed inset-0 z-[70] bg-black flex items-center justify-center';
  o.innerHTML = '<video controls autoplay playsinline class="h-full w-full object-contain"></video><button type="button" aria-label="Close" class="absolute top-3 right-3 h-10 w-10 rounded-full bg-white/15 text-white inline-flex items-center justify-center"><i data-lucide="x" class="h-6 w-6"></i></button>';
  const v = o.querySelector('video'), done = () => { v.pause(); o.remove(); removeEventListener('keydown', esc); document.fullscreenElement && document.exitFullscreen().catch(() => {}); },
    esc = e => e.key === 'Escape' && history.back();
  v.src = src;
  history.pushState({ video: 1 }, '');
  addEventListener('popstate', done, { once: true });
  addEventListener('keydown', esc);
  o.querySelector('button').onclick = () => history.back();
  o.addEventListener('fullscreenchange', () => !document.fullscreenElement && o.isConnected && history.back());
  document.body.append(o);
  window.lucide?.createIcons();
  o.requestFullscreen?.().catch(() => {});
}

export function videoStrip(parts) {
  const wrap = document.createElement('div');
  wrap.className = 'flex gap-2 overflow-x-auto no-scrollbar px-4';
  for (const p of parts) {
    const b = document.createElement('button');
    b.type = 'button';
    b.setAttribute('aria-label', 'Play video');
    b.className = 'relative shrink-0 h-40 rounded-xl overflow-hidden bg-black';
    b.innerHTML = '<video muted playsinline preload="metadata" class="h-full w-auto min-w-24 object-cover pointer-events-none"></video><span class="absolute inset-0 flex items-center justify-center"><span class="h-10 w-10 rounded-full bg-black/60 text-white inline-flex items-center justify-center"><i data-lucide="play" class="h-5 w-5"></i></span></span>';
    const src = toBlobUrl(p.video_url?.url || '');
    src.then(u => b.querySelector('video').src = u + '#t=0.1').catch(() => {});
    b.onclick = async () => openPlayer(await src);
    wrap.append(b);
  }
  return wrap;
}
