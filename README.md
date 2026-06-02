# Telegram TV Player

A small Node.js web app and Telegram bot that opens a TV player page inside Telegram Web Apps.

## Setup

1. Install Node.js.
2. Open a terminal in `C:\Users\msi\telegram-tv`.
3. Run:

```bash
npm install
```

4. Set your Telegram bot token and web app URL:

PowerShell:
```powershell
$env:TG_TOKEN="your_bot_token"
$env:WEBAPP_URL="https://your-public-domain.com"
```

Command Prompt:
```cmd
set TG_TOKEN=your_bot_token
set WEBAPP_URL=https://your-public-domain.com
```

## Run locally

```bash
npm run start
npm run bot
```

Then open `http://localhost:3000` to test the player.

## Deploy

### Recommended: Render / Railway / Vercel

1. Push this folder to GitHub.
2. Create a new app on your chosen platform.
3. Set `PORT`, `TG_TOKEN`, and `WEBAPP_URL` environment variables.
4. Deploy.

### For Telegram Web App

- `WEBAPP_URL` must be an HTTPS URL.
- Use this URL in `bot.js` via `web_app` button.

## Customize channels

In `server.js`, replace the `channels` values with actual stream URLs:

```js
const channels = {
  news: "https://example.com/stream/news",
  sports: "https://example.com/stream/sports",
  movies: "https://example.com/stream/movies"
};
```

Make sure each stream allows embedding inside an `iframe`.

## Remote stream configuration for the Web App

The Web App player loads channel metadata from a remote JSON file.

- `player/index.html` uses `configUrl` to fetch `streams.json`.
- You can update `player/streams.json` online on GitHub Pages or any public URL.
- Use your GitHub Pages path, for example:

```js
const configUrl = "https://YOUR_GITHUB_USERNAME.github.io/tg-tv-streamer/streams.json";
```

When you update that JSON file, the next user load will fetch the new stream list automatically.
