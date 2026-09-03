### ⚡ Alpha Bot By Mason
Very powerful WhatsApp multi-device bot featuring a full bug toolkit, fun games, media tools, group management, and more — re-coded and customized by Mason.

### Bot Features
- 🐛 Bug menu (full crash payloads)
- 👁️ Auto status views
- 📖 Auto read chat
- 🪪 Auto bio (about)
- ⌨️ Auto recording & typing
- 🟢 Always online
- 🛡️ Heroku anti-ban setup
- 🚫 Auto block
- 🌐 Public / private mode
- 🎮 Games menu (TicTacToe, Dice, Slots, RPS, 8ball, Trivia, Math, Hangman, Coin, Truth/Dare, Roll)
- 🧰 Tools (sticker, toimage, tomp3, tovn, tourl, qr, emojimix, smeme, etc.)
- 👥 Group menu (kick, add, promote, tagall, hidetag, link, etc.)
- 💾 Database menu (add/del/list vn, image, sticker, video, zip, apk, pdf)
- ⬇️ Downloader menu (play, ytmp3, ytmp4, sounds)

# Heroku deploy setup

1. Star this repository.
2. If you don't have a GitHub account, sign up.
3. Fork this repository.
4. Scan the QR / pair-code from Replit and pair through "WhatsApp Linked Devices".
5. Create a Heroku account if you don't have one.
6. Watch the deploy tutorial and deploy.

## 🌐 Web Dashboard

Alpha by Mason ships with a built-in web dashboard powered by Baileys.

After running `npm start`, open:

```
http://localhost:3000
```

Or set the port via env var `PORT=8080` (or `DASHBOARD_PORT=8080`).

Features:
- 📱 Live QR code for pairing (auto-refreshes)
- 📊 Bot stats & uptime
- ⚙️ Toggle chatbot, auto-read, status view, etc. from the UI
- ✉️ Send messages from the dashboard
- 👑 Owner actions: restart / shutdown / eval
- 📡 Live logs & recent messages via Server-Sent Events
- 🔄 Switch AI provider (simsimi / gpt / fallback)

## `Heroku` buildpacks
1. heroku/nodejs
2. https://github.com/jonathanong/heroku-buildpack-ffmpeg-latest
3. https://github.com/clhuang/heroku-buildpack-webp-binaries.git

---

# Contact the owner (Mason)

For premium access or support, contact Mason via WhatsApp.