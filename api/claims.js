import { Redis } from '@upstash/redis';
import { randomUUID } from 'node:crypto';

// Vercel Marketplace (Upstash) gir KV_REST_API_*; Upstash direkte gir UPSTASH_REDIS_REST_*.
const redis = new Redis({
  url: process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN,
});

const KEY = 'onskeliste:claims'; // hash: vare-id -> { name, token, at }
const ID_RE = /^[a-z0-9-]{1,80}$/;

const parse = (v) => (typeof v === 'string' ? JSON.parse(v) : v);

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  try {
    if (req.method === 'GET') {
      const all = (await redis.hgetall(KEY)) || {};
      const claims = {};
      for (const [id, raw] of Object.entries(all)) {
        const { name, at } = parse(raw);
        claims[id] = { name, at }; // tokenet sendes aldri ut
      }
      return res.status(200).json({ claims });
    }

    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};
    const id = String(body.id || '');
    if (!ID_RE.test(id)) return res.status(400).json({ error: 'Ugyldig vare.' });

    if (req.method === 'POST') {
      const name = String(body.name || '').trim().replace(/\s+/g, ' ').slice(0, 40);
      if (!name) return res.status(400).json({ error: 'Skriv inn fornavnet ditt.' });
      const token = randomUUID();
      // HSETNX er atomisk: bare den første som skriver vinner.
      const ok = await redis.hsetnx(KEY, id, JSON.stringify({ name, token, at: Date.now() }));
      if (!ok) {
        const existing = parse(await redis.hget(KEY, id));
        return res.status(409).json({ error: 'taken', name: existing?.name || 'noen andre' });
      }
      return res.status(200).json({ token, name });
    }

    if (req.method === 'DELETE') {
      const existing = parse(await redis.hget(KEY, id));
      if (!existing) return res.status(200).json({ ok: true });
      if (!body.token || existing.token !== body.token) {
        return res.status(403).json({ error: 'Bare den som krysset av kan angre.' });
      }
      await redis.hdel(KEY, id);
      return res.status(200).json({ ok: true });
    }

    res.setHeader('Allow', 'GET, POST, DELETE');
    return res.status(405).json({ error: 'Metoden støttes ikke.' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Noe gikk galt. Prøv igjen.' });
  }
}
