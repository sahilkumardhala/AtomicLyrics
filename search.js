export default async function handler(req, res) {
  const query = req.query.q;
  if (!query) {
    return res.status(400).json({ error: 'Query parameter "q" is required.' });
  }

  try {
    // Search for lyric/audio uploads which allow third-party IFrame embedding
    const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(query + ' lyric audio')}`;
    
    const response = await fetch(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9'
      }
    });

    const html = await response.text();

    // Parse valid 11-character video IDs from YouTube's response payload
    const regex = /"videoId":"([a-zA-Z0-9_-]{11})"/g;
    const matches = [];
    let match;

    while ((match = regex.exec(html)) !== null) {
      if (!matches.includes(match[1])) {
        matches.push(match[1]);
      }
      if (matches.length >= 8) break;
    }

    if (matches.length === 0) {
      return res.status(404).json({ error: 'No video streams found.' });
    }

    return res.status(200).json({ videoIds: matches });
  } catch (err) {
    return res.status(500).json({ error: 'Internal search resolution failed.' });
  }
}
