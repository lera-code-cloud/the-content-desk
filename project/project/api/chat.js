// Proxies chat completions to Anthropic so the API key never reaches the browser.
// The client (src/App.jsx) posts { model, max_tokens, system, messages } here —
// exactly the same shape it would send straight to api.anthropic.com/v1/messages.

// IMPORTANT: without this, Vercel kills the function after its (short) default
// timeout — way before Claude can finish a large generation (max_tokens: 6000 for
// headlines can genuinely take 20-60+ seconds, more under load). That premature
// kill is what was causing generations to fail/stall for everyone once real
// concurrent traffic started. 60s is the max allowed on Hobby/Pro without Fluid
// Compute; raise it further if your Vercel plan allows and it's still not enough.
export const config = {
  maxDuration: 60,
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: { message: 'Method not allowed' } });
    return;
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: { message: 'ANTHROPIC_API_KEY is not set on the server' } });
    return;
  }

  try {
    const upstream = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify(req.body),
    });
    const data = await upstream.json();
    res.status(upstream.status).json(data);
  } catch (e) {
    res.status(502).json({ error: { message: 'Upstream request to Anthropic failed: ' + e.message } });
  }
}
