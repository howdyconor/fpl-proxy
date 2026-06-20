export default async function handler(req, res) {
  const { path } = req.query;
  if (!path) return res.status(400).json({ error: "No path provided" });

  const url = `https://fantasy.premierleague.com/api/${path}`;

  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0",
        "Accept": "application/json",
      },
    });

    if (!response.ok) throw new Error(`FPL API returned ${response.status}`);

    const data = await response.json();

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Cache-Control", "s-maxage=60");
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
