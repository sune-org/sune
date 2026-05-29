import { USER } from './user.js';
import { btou } from './utils.js';

export const ghApi = async (path, method = 'GET', body = null) => {
  const t = USER.githubToken;
  if (!t) throw new Error('No GH token');
  const r = await fetch(`https://api.github.com/repos/${path}`, {
    method,
    headers: {
      'Authorization': `token ${t}`,
      'Accept': 'application/vnd.github.v3+json',
      'Content-Type': 'application/json'
    },
    body: body ? JSON.stringify(body) : null
  });
  if (!r.ok && r.status !== 404) throw new Error(`GH API ${r.status}`);
  return r.status === 404 ? null : r.json();
};

export const parseGhUrl = u => {
  const p = u.substring(5).split('/'), owner = p[0], repoPart = p[1] || '',
    branch = repoPart.includes('@') ? repoPart.split('@')[1] : 'main',
    repo = repoPart.split('@')[0], path = p.slice(2).join('/').replace(/\/$/, '');
  return { owner, repo, branch, path, apiPath: `${owner}/${repo}/contents${path ? '/' + path : ''}` };
};

// Fetch a file's text content, transparently handling GitHub's 1MB Contents API
// limit. Files >1MB come back from the Contents API with encoding "none" and an
// empty `content` field, so we fall back to the Git Blobs API (supports up to 100MB).
export const ghGetFileContent = async (info, fileName) => {
  const meta = await ghApi(`${info.apiPath}/${fileName}?ref=${info.branch}`);
  if (!meta) { console.warn('[Sune] GH file not found:', fileName); return null; }
  console.log('[Sune] GH file meta:', { name: fileName, size: meta.size, encoding: meta.encoding, hasContent: !!(meta.content && meta.content.trim()), sha: meta.sha });
  if (meta.content && meta.encoding === 'base64') {
    try { return btou(meta.content); } catch (e) { console.error('[Sune] decode (contents) failed:', e); }
  }
  // Large file path: Contents API omitted the body, retrieve the raw blob by sha.
  if (meta.sha) {
    try {
      const blob = await ghApi(`${info.owner}/${info.repo}/git/blobs/${meta.sha}`);
      console.log('[Sune] GH blob:', { size: blob?.size, encoding: blob?.encoding, hasContent: !!(blob?.content && blob.content.trim()) });
      if (blob && blob.content && blob.encoding === 'base64') return btou(blob.content);
    } catch (e) { console.error('[Sune] blob fetch failed:', e); }
  }
  console.warn('[Sune] Could not retrieve content for', fileName);
  return null;
};
