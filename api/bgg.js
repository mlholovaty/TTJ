export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'private, no-store');
  if(req.method !== 'GET') return res.status(405).json({error:'GET only'});
  const { SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, BGG_TOKEN } = process.env;
  if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY || !BGG_TOKEN)
    return res.status(503).json({error:'Configure the three server environment variables to enable BGG.'});
  const bearer = req.headers.authorization || '';
  if(!bearer.startsWith('Bearer ')) return res.status(401).json({error:'Sign in to search BGG.'});
  try {
    const auth = await fetch(SUPABASE_URL.replace(/\/$/, '') + '/auth/v1/user', {
      headers:{apikey:SUPABASE_PUBLISHABLE_KEY, Authorization:bearer}, signal:AbortSignal.timeout(8000)
    });
    if(!auth.ok) return res.status(401).json({error:'Session expired. Sign in again.'});
    const q = String(req.query.q || '').trim();
    if(q.length < 2 || q.length > 100) return res.status(400).json({error:'Enter 2–100 characters.'});
    const url = new URL('https://boardgamegeek.com/xmlapi2/search');
    url.searchParams.set('query', q); url.searchParams.set('type','boardgame');
    const result = await fetch(url, {headers:{Authorization:`Bearer ${BGG_TOKEN}`}, signal:AbortSignal.timeout(12000)});
    if(result.status === 202) return res.status(503).json({error:'BGG is preparing results. Try again shortly.'});
    if(!result.ok) return res.status(502).json({error:`BGG returned ${result.status}. Check token/approval or try later.`});
    return res.status(200).setHeader('Content-Type','application/xml; charset=utf-8').send(await result.text());
  } catch(e) {return res.status(502).json({error:'BGG request timed out or could not connect. Manual entry still works.'});}
}
