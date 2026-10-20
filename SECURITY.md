# Security & Privacy

Sune is client-side. Your threads, sunes, settings, API keys, and GitHub PAT live in your browser's `localStorage` / `IndexedDB` — never on our servers. GitHub sync (if enabled) goes browser → your repo with your PAT. No accounts, no tracking.

## The Proxy

Streaming is relayed through [`us.proxy.sune.chat`](https://github.com/sune-org/us.proxy.sune.chat) so mobile generations survive screen locks. Your browser opens a WebSocket, the proxy forwards to the provider with the API key **you** supplied, and streams tokens back.

**What it doesn't do:** no prompt logging (your messages are held in memory only while the run is in progress; the generated reply stays in memory for 90 minutes after it ends so you can reconnect, and nothing is written to disk), no reading your chats, no storing keys, no third-party sharing.

**What I see:** an [ntfy](https://ntfy.sh) ping when a run ends/fails, containing only: the run's start time (the timestamp half of its ID, not the secret half), `[provider/model]`, duration, error message (if any), and the sune's non-empty generation settings (temperature, top_p, top_k, frequency/repetition penalty, min_p, top_a, max tokens, reasoning effort, show thoughts, image output/aspect ratio/size). No prompts (system or master prompts included), no responses, no IP, no key. Source is public — audit it [here](https://github.com/sune-org/us.proxy.sune.chat).
