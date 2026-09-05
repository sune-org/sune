[![Download For Android (.apk)](https://img.shields.io/badge/Download-For%20Android%20(.apk)-green?style=for-the-badge&logo=android)](https://github.com/multipleof4/sune/releases/download/v0.23.0/sune-v0.23.0.apk)

<p align="center">
  <img src="./public/appstore_content/screenshot1.jpg" alt="Main" width="280" />
</p>

> Each sune is like a module. You can have many. And share them.

<p align="center">
  <img src="./public/appstore_content/sune_sidebar.png" alt="Sunes" width="280" />
  <img src="./public/appstore_content/screenshot3.jpg" alt="Setting" width="280" />
</p>

💠 New! 

> You can have scripts which run on the page of each sune — either to function call or extend functionality of the app or sune.

<p align="center">
  <img src="./public/appstore_content/screenshot4.jpg" alt="Scripting" width="280" />
  <img src="./public/appstore_content/screenshot_miku.png" alt="Miku" width="280" />
</p>

> There is a marketplace and LaTeX support out of the box.

<p align="center">
  <img src="./public/appstore_content/screenshot_marketplace.jpg" alt="Marketplace" width="280" />
  <img src="./public/appstore_content/latex.png" alt="LaTeX" width="280" />
</p>

---

## 🔄 Sync Your Chats with GitHub

Never lose a conversation again. Sune can sync all your threads to a GitHub repo.

<p align="center">
  <img src="./public/appstore_content/sync.png" alt="Sync" width="320" />
</p>

### Setup for Syncing Chats

1. **Create a GitHub repo** — can be private or public, whatever you prefer. Something like `.chats`.

2. **Generate a Personal Access Token (PAT)**
   - Go to [github.com/settings/tokens](https://github.com/settings/tokens) → **Classic Token** → **Generate new token**
   - Give it **Read and write** access to **Contents** on your repo
   - Copy the token

3. **Add your token in Sune**
   - Open the left sidebar → **User** → **Settings**
   - Go to the **API** tab
   - Paste your token into the **Github Token** field
   - Hit **Save**

4. **Point Sune to your repo**
   - Open the right sidebar (Threads panel)
   - In the repo input at the top, enter: `gh://your-username/.chats`
   - Press Enter

5. **Sync**
   - Hit the **Sync** button after starting a new chat in there.
   - **OK** = Push your local threads up to GitHub
   - **Cancel** = Pull threads down from GitHub

That's it. Your threads are now backed up as JSON files in your repo. You can sync across devices, never lose a chat, and even browse your conversations directly on GitHub.
