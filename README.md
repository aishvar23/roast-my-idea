# 🔥 Roast My Idea

Submit your startup idea and watch Claude tear it apart — word by word, in real time.

> Powered by Claude `claude-sonnet-4-6` with streaming via the Anthropic SDK.

## Features

- **Three roast intensities** — Mild 🌶️ / Medium 🔥 / Savage 💀
- **Real-time streaming** — the roast streams in word-by-word via SSE
- **Doomed-O-Meter** — a progress bar that animates to your doom score (1–10)
- **Defend Yourself** — push back and get roasted again with your defense taken into account
- **Save Roast** — download the roast as a `.txt` file
- Dark terminal aesthetic, monospace output, fire red accents

## Prerequisites

- [Node.js](https://nodejs.org/) v18 or later
- An [Anthropic API key](https://console.anthropic.com/)

## Setup

```bash
# 1. Enter the project directory
cd roast-my-idea

# 2. Install dependencies
npm install

# 3. Set your Anthropic API key
export ANTHROPIC_API_KEY="sk-ant-..."

# 4. Start the server
npm start
```

Then open **http://localhost:3000** in your browser.

### Optional: auto-reload on changes

```bash
npm run dev
```

### Optional: custom port

```bash
PORT=8080 npm start
```

## Project structure

```
roast-my-idea/
├── server.js        # Express server + Anthropic streaming endpoint
├── package.json
└── public/
    └── index.html   # Single-page frontend (HTML + CSS + JS)
```

## How it works

1. The frontend sends a `POST /roast` request with `{ idea, intensity, defense? }`.
2. The Express server opens a streaming connection to Claude (`claude-sonnet-4-6`) with a tailored system prompt based on the chosen intensity.
3. Token deltas are forwarded to the browser as Server-Sent Events (`text/event-stream`).
4. The frontend renders each chunk in real time using a minimal markdown renderer (handles `## headers`, `**bold**`, and `---` dividers).
5. As soon as the `Doomed-O-Meter: X/10` line appears in the stream, the progress bar animates to the score.
6. After the stream ends, action buttons appear: **Save Roast** and **Defend Yourself**.

## Keyboard shortcuts

| Shortcut | Action |
|---|---|
| `Ctrl+Enter` / `Cmd+Enter` (in idea box) | Submit roast |
| `Ctrl+Enter` / `Cmd+Enter` (in defense box) | Submit defense |
