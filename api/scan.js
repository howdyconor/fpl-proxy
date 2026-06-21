export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { imageData, mediaType } = req.body;
  if (!imageData) return res.status(400).json({ error: 'No image data provided' });

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 500,
        messages: [{
          role: 'user',
          content: [
            {
              type: 'image',
              source: { type: 'base64', media_type: mediaType || 'image/jpeg', data: imageData }
            },
            {
              type: 'text',
              text: 'This is a screenshot of an FPL (Fantasy Premier League) team. List every player name you can see. Return ONLY a JSON array of strings with the player surnames or web names as they appear in FPL. Example: ["Salah","Haaland","Alexander-Arnold"]. No other text, no markdown.'
            }
          ]
        }]
      })
    });

    if (!response.ok) {
      const err = await response.text();
      return res.status(500).json({ error: `Anthropic API error ${response.status}: ${err}` });
    }

    const data = await response.json();
    const text = data.content?.filter(b => b.type === 'text').map(b => b.text).join('') || '[]';
    const clean = text.replace(/```json|```/g, '').trim();

    let players = [];
    try { players = JSON.parse(clean); } catch { players = []; }

    return res.status(200).json({ players });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
