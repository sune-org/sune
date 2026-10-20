import { el } from './dom.js';
import { partsToText } from './utils.js';
import { renderMarkdown, enhanceCodeBlocks } from './markdown.js';
import { SUNE_LOGO_SVG } from './sune-logo.js';

// The proxy's maxPayloadLength; it drops anything bigger with no useful close code
const WS_URL='wss://us.proxy.sune.chat/ws',MAX_REQ=100*1024*1024,LIVE_KEY='threads_live';

export const buildBody=()=>{
  const {USER,SUNE,state,payloadWithSampling}=window;
  const msgs=[];

  const mPrompt = (USER.masterPrompt || '').trim();
  if(mPrompt && !SUNE.ignore_master_prompt) {
    msgs.push({role:'system', content: mPrompt});
  }

  const modelName=SUNE.model.replace(/^(or:|oai:|g:|cla:)/,'').replace(/^[^/]*\//,'').replace(/(?::online|:free)+$/,'');
  const sPrompt = (SUNE.system_prompt || '').trim().replaceAll('{{model_name}}',()=>modelName);
  if(sPrompt) {
    msgs.push({role:'system', content: sPrompt});
  }

  state.messages.filter(m=>m.role!=='system').forEach(m=>{
    let content = Array.isArray(m.content) ? [...m.content] : [{type:'text',text:String(m.content||'')}];

    // Filter out empty text parts which cause 400 errors on strict providers like Moonshot
    content = content.filter(p => p.type !== 'text' || (p.text && p.text.trim().length > 0));

    msgs.push({
      role: m.role,
      content: content,
      ...(m.images?.length ? {images: m.images} : {})
    });
  });

  // Strip trailing empty assistant message (prevents 400 on models without prefill support)
  // We keep the UI bubble in main.js, but the API never sees the empty placeholder.
  if (msgs.length > 0) {
    const last = msgs[msgs.length - 1];
    if (last.role === 'assistant' && last.content.length === 0 && (!last.images || last.images.length === 0)) {
      msgs.pop();
    }
  }

  const b=payloadWithSampling({model:SUNE.model.replace(/^(or:|oai:|g:|cla:)/,''),messages:msgs,stream:true});
  b.reasoning={...(SUNE.reasoning_effort&&SUNE.reasoning_effort!=='default'?{effort:SUNE.reasoning_effort}:{}),exclude:!SUNE.include_thoughts};
  if(SUNE.img_output){b.modalities=['image'];b.image_config={aspect_ratio:SUNE.aspect_ratio||'1:1',image_size:SUNE.image_size||'1K'}}
  return b
}

/* Replies stream over one socket each and outlive the view: they keep saving into their own thread while
   you're elsewhere, reconnect on drops, and get picked back up after a reload. A streaming message carries
   stream:{seq} (the last chunk it holds) until it's finished. */
const live=new Map();
const threadKey=tid=>(el.threadRepoInput.value.trim().startsWith('gh://')?'rem_t_':'t_')+tid;
const saveLive=()=>localStorage.setItem(LIVE_KEY,JSON.stringify([...live.values()].map(s=>[s.rid,s.tid,s.key])));
const onScreen=s=>window.state.currentThreadId===s.tid&&window.state.messages.includes(s.msg);

export const curReply=()=>[...live.values()].find(s=>s.tid===window.state.currentThreadId);

export function syncBtn(){
  const on=!!curReply();window.state.busy=on;
  if(el.sendBtn.dataset.mode!==(on?'stop':'send'))on?window.setBtnStop():window.setBtnSend()
}

function paint(s,final){
  const b=onScreen(s)&&window.getBubbleById(s.rid);if(!b)return;
  const t=partsToText(s.msg);
  if(!t&&!final)return b.innerHTML=SUNE_LOGO_SVG;
  renderMarkdown(b,t,{enhance:false});if(final)enhanceCodeBlocks(b,true)
}

async function write(s){
  const {THREAD}=window;
  if(onScreen(s))return THREAD.persist(!s.msg.stream);
  const a=await localforage.getItem(s.key),i=Array.isArray(a)?a.findIndex(m=>m?.id===s.rid):-1;
  if(i<0)return drop(s);
  a[i]=s.msg;await localforage.setItem(s.key,a);
  const th=!s.msg.stream&&THREAD.get(s.tid);
  if(th){th.updatedAt=Date.now();if(th.status==='synced')th.status='modified';await THREAD.save();window.renderThreads()}
}

// Coalesced: at most one write waiting behind the running one, and it saves whatever is current when it runs
function save(s){
  if(s.queued)return;s.queued=1;
  s.q=s.q.then(()=>{s.queued=0;return write(s)}).catch(e=>console.error('[Sune] Saving reply failed',e))
}

function end(s){
  s.done=true;clearTimeout(s.timer);clearTimeout(s.probe);live.delete(s.rid);saveLive();
  const ws=s.ws;s.ws=s.req=null;try{ws?.close()}catch{}
}

function finish(s,note=''){
  if(s.done)return;end(s);
  if(note)s.msg.content[0].text+=note;
  delete s.msg.stream;paint(s,true);save(s);syncBtn();
  if(onScreen(s))el.composer.dispatchEvent(new CustomEvent('sune:newSuneResponse',{detail:{message:s.msg}}))
}

// Stops the run server-side too; without an open socket a throwaway one carries the stop
function sendStop(s){
  const m=JSON.stringify({type:'stop',rid:s.rid});
  if(s.ws?.readyState===1)return s.ws.send(m);
  const w=new WebSocket(WS_URL);w.onopen=()=>{w.send(m);w.close()}
}

// For a deleted message or thread: stop without saving anything
function drop(s){if(s.done)return;sendStop(s);end(s);syncBtn()}

export function stopReply(s,note){if(!s||s.done)return;sendStop(s);finish(s,note)}
export const dropReply=rid=>live.has(rid)&&drop(live.get(rid));
export const dropThread=tid=>live.forEach(s=>s.tid===tid&&drop(s));

function onMessage(s,m){
  clearTimeout(s.probe);s.probe=null;s.lostAt=null;s.tries=0;
  switch(m.type){
    case 'ack':s.req=null;return;
    case 'delta':{
      if(m.seq<=s.msg.stream.seq)return;s.req=null;
      s.msg.content[0].text+=m.text||'';if(m.images?.length)(s.msg.images||=[]).push(...m.images);
      s.msg.stream.seq=m.seq;paint(s);return save(s)
    }
    case 'done':return finish(s);
    case 'gone':return finish(s,'\n\n_Reply interrupted: the server no longer has the rest of it._');
    case 'err':return finish(s,'\n\n'+(m.message||'error'))
  }
}

function connect(s){
  if(s.done)return;clearTimeout(s.timer);
  const ws=s.ws=new WebSocket(WS_URL);
  ws.onopen=()=>ws.send(s.req||JSON.stringify({type:'resume',rid:s.rid,after:s.msg.stream.seq}));
  ws.onmessage=e=>{if(s.ws!==ws)return;let m;try{m=JSON.parse(e.data)}catch{return}onMessage(s,m)};
  ws.onclose=()=>{
    if(s.ws!==ws||s.done)return;s.ws=null;retry(s)
  }
}

// Backs off up to 15s; gives up after 30s if the run never started, else once the server can't still have it
function retry(s){
  s.lostAt??=Date.now();
  if(Date.now()-s.lostAt>(s.req?3e4:105*6e4))return stopReply(s,s.req?'\n\nCouldn’t reach the server.':'\n\n_Reply interrupted: lost the connection to it._');
  clearTimeout(s.timer);s.timer=setTimeout(()=>connect(s),Math.min(15e3,500*2**s.tries++))
}

// Reconnects now if the socket is gone, or pings an open one and replaces it if it's silently dead
function kick(s){
  if(s.done)return;const ws=s.ws;
  if(!ws||ws.readyState>1)return connect(s);
  if(ws.readyState===0||s.req||s.probe)return;
  ws.send('{"type":"ping"}');
  s.probe=setTimeout(()=>{s.probe=null;if(s.ws!==ws||s.done)return;s.ws=null;try{ws.close()}catch{}connect(s)},5e3)
}

function track(msg,tid,key){
  const s={rid:msg.id,tid,key,msg,req:null,q:Promise.resolve(),tries:0};
  live.set(s.rid,s);saveLive();return s
}

export function startReply(msg){
  const {USER,SUNE,state}=window;
  const model=SUNE.model,provider=model.startsWith('oai:')?'openai':model.startsWith('g:')?'google':model.startsWith('cla:')?'claude':model.startsWith('or:')?'openrouter':USER.provider;
  const apiKey=provider==='openai'?USER.apiKeyOpenAI:provider==='google'?USER.apiKeyGoogle:provider==='claude'?USER.apiKeyClaude:USER.apiKeyOpenRouter;
  const s=track(msg,state.currentThreadId,threadKey(state.currentThreadId));
  if(!apiKey){msg.content[0].text=window.localDemoReply();return finish(s)}
  s.req=JSON.stringify({type:'begin',rid:s.rid,provider,apiKey,body:buildBody()});
  if(s.req.length>MAX_REQ-(1<<20))return finish(s,'\n\nThis request is over the server’s 100 MB limit.');
  connect(s);syncBtn()
}

// Call after a thread's messages are rendered: swaps in the live copies of replies still streaming and resumes the rest
export function adoptThread(){
  const {state}=window,tid=state.currentThreadId;
  state.messages=state.messages.map(m=>{const s=live.get(m.id);return s?.tid===tid?s.msg:m});
  for(const m of state.messages){
    if(!m.stream)continue;
    let s=live.get(m.id);
    if(!s)connect(s=track(m,tid,threadKey(tid)));
    paint(s)
  }
  syncBtn()
}

// Picks up replies that were streaming when the app closed, wherever their threads are
export async function restoreLive(){
  let list=[];try{list=JSON.parse(localStorage.getItem(LIVE_KEY)||'[]')}catch{}
  for(const [rid,tid,key] of list){
    const a=!live.has(rid)&&await localforage.getItem(key),m=Array.isArray(a)&&a.find(x=>x?.id===rid);
    if(m?.stream&&!live.has(rid))connect(track(m,tid,key))
  }
  saveLive()
}

const kickAll=()=>live.forEach(kick);
document.addEventListener('visibilitychange',()=>document.visibilityState==='visible'&&kickAll());
addEventListener('online',kickAll);
setInterval(()=>document.visibilityState==='visible'&&kickAll(),2e4);
