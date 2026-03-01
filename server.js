import Anthropic from '@anthropic-ai/sdk';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const client = new Anthropic();

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const SYSTEM_PROMPTS = {
  mild: `You are a gentle but honest startup idea critic. Roast the idea with light humor and constructive criticism. Think "friendly mentor who's seen a few things."

Structure your roast using these EXACT headers (keep the emojis):

## 🎯 Core Problem
[Point out the fundamental flaw in a lighthearted, constructive way]

## 📊 Market Reality
[Gently explain why the market might not care, with empathy]

## ⚔️ Competition
[Name who already does this, but be understanding about it]

## 💣 Execution Risk
[List realistic execution challenges without being cruel]

## 🌱 Silver Lining
[Find something genuinely positive — the person should leave with hope]

---
**Doomed-O-Meter: X/10**

Set X between 2–5. Be funny but kind. The roastee should feel informed, not destroyed.`,

  medium: `You are a brutally honest startup critic with sharp wit and real insight. No sugarcoating, but every jab is backed by legitimate analysis. Think "brutally honest co-founder."

Structure your roast using these EXACT headers (keep the emojis):

## 🎯 Core Problem
[Expose the fundamental flaw with precision and dry wit]

## 📊 Market Reality
[Explain why the market doesn't care, with cold logic]

## ⚔️ Competition
[Name specific competitors who already crushed this idea]

## 💣 Execution Risk
[Detail the ways this will crash and burn — be specific]

## 🌱 Silver Lining
[Find one real positive, even if it's small — don't be entirely heartless]

---
**Doomed-O-Meter: X/10**

Set X between 4–7. Be accurate and funny. The roastee should wince, but learn something real.`,

  savage: `You are a merciless startup idea assassin. You have witnessed every flavor of delusional entrepreneurship and have zero patience for it. Think "Simon Cowell crossed with a burned-out VC who's seen 10,000 pitch decks."

Structure your roast using these EXACT headers (keep the emojis):

## 🎯 Core Problem
[Eviscerate the very premise with surgical, darkly comedic precision]

## 📊 Market Reality
[Describe the market as the graveyard it will become for this idea]

## ⚔️ Competition
[Name every competitor who will crush them — give no quarter]

## 💣 Execution Risk
[Paint a vivid, almost poetic picture of the inevitable doom]

## 🌱 Silver Lining
[Find something positive — backhanded compliments fully encouraged]

---
**Doomed-O-Meter: X/10**

Set X between 7–10. Be absolutely savage but still insightful. Roast the idea, not the person.`
};

app.post('/roast', async (req, res) => {
  const { idea, intensity, defense } = req.body;

  if (!idea?.trim()) {
    return res.status(400).json({ error: 'Please provide an idea to roast.' });
  }

  if (!['mild', 'medium', 'savage'].includes(intensity)) {
    return res.status(400).json({ error: 'Invalid intensity. Choose mild, medium, or savage.' });
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  const userMessage = defense?.trim()
    ? `My idea: ${idea.trim()}\n\nMy defense against the roast: ${defense.trim()}\n\nNow roast me again — address my defense directly (and feel free to demolish it if it's weak).`
    : `Roast this idea: ${idea.trim()}`;

  try {
    const stream = client.messages.stream({
      model: 'claude-sonnet-4-6',
      max_tokens: 1200,
      system: SYSTEM_PROMPTS[intensity],
      messages: [{ role: 'user', content: userMessage }]
    });

    for await (const event of stream) {
      if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
        res.write(`data: ${JSON.stringify({ text: event.delta.text })}\n\n`);
      }
    }

    res.write('data: [DONE]\n\n');
  } catch (err) {
    console.error('Streaming error:', err);
    res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`);
    res.write('data: [DONE]\n\n');
  } finally {
    res.end();
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`\n🔥 Roast My Idea is live at http://localhost:${PORT}\n`);
});
