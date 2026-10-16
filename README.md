# Tabletop Journal — starter application

A responsive board-game and Magic: The Gathering play journal. Includes manual titles, authenticated BGG title search, solo/co-op/competitive results, optional scores, duration, notes, deck/commander fields, history editing/deleting, monthly/game charts, player results, score plots, JSON backups and CSV export.

## 1. Quick local-mode trial

Serve this directory with any static web server, for example:

    python -m http.server 8000

Open http://localhost:8000. No npm install is needed for local mode. Data is in this browser's localStorage, NOT a cloud database. This is not an offline-installable PWA. Use JSON exports for backup. BGG search is unavailable until cloud/server setup is complete. Opening index.html directly is not recommended; use HTTP.

## 2. Configure cloud persistence (Supabase)

1. Create a Supabase project.
2. Run schema.sql once in its SQL editor. It creates the table, grants, and per-account Row Level Security policies. If you already ran it, do not rerun policy creation unchanged.
3. Open config.js and paste your project URL and PUBLISHABLE key. A legacy anon key also works. Never paste a secret/service_role key here.
4. In Authentication > URL Configuration, set Site URL to your deployed site's origin, and add any development/preview redirect URLs you use. Enable email/password authentication. Email confirmation and SMTP delivery depend on your Supabase settings; production use should configure your own email provider.
5. Deploy and create your account. Confirm your email if required. All players are names recorded under your account, not separate users with shared access.
6. Log in with the same account on phone and computer. Records save remotely; reload another device to fetch updates. There is no realtime subscription, offline write queue, automatic local-to-cloud migration, or conflict resolution. Concurrent edits of the same session are last-write-wins.
7. To migrate local records: export JSON BEFORE changing config.js, then sign in to cloud mode and import it. Local and cloud data are separate.

## 3. Deploy on Vercel and enable BGG

Upload the project files to a GitHub repository (never upload real .env files or tokens). Import the repository into Vercel. Choose Other as the framework preset, no build command, and the repository root (.) as the output directory. Keep api/bgg.js at the repository's api/bgg.js path. This project uses static frontend files plus a Node serverless function.

Add these Vercel project environment variables for the environments you deploy:

- SUPABASE_URL: the same project URL used in config.js
- SUPABASE_PUBLISHABLE_KEY: the same publishable key
- BGG_TOKEN: your approved BGG application authorization token

Register your application with BoardGameGeek and review its current XML API terms at https://boardgamegeek.com/using_the_xml_api . The token is sent only by api/bgg.js, never by frontend code. Redeploy after changing environment variables. Sign into the app, type a title and choose Search BGG. Manual titles remain usable without BGG.

For local function testing, install Node.js and run:

    npm install
    # Copy .env.example to .env.local and fill it with your values.
    npm run dev

GitHub Pages can host the static/manual-entry frontend, including Supabase access, but it cannot run api/bgg.js. The bundled same-origin BGG search expects Vercel. If using GitHub Pages instead, omit BGG or deploy a separate authenticated proxy and adjust the frontend URL/CORS deliberately.

BGG integration in this version is title search + stored BGG ID/page link. It does NOT import your BGG collection or publish plays back to BGG. Search results are limited to 30. No public unauthenticated BGG proxy is exposed. Any authenticated project account can use the proxy: before a broadly public launch, restrict signups if appropriate and add rate limiting/abuse protection. This starter has no distributed API rate limiter.

## Result conventions

- Competitive: check each winner. Multiple winners are counted as tied wins; they receive both one win and one draw entry. No checked winners means the winner was not recorded, not an inferred draw. Scores never automatically determine winners because low-score games and non-score victory conditions exist.
- Solo: keep exactly one player, choose Win/Loss/Draw or leave unrecorded. Scores can still be tracked for beat-your-own-score games.
- Cooperative: choose group result; every participant gets a win if the group won.
- MTG: one entry represents whatever you define as a session (game or match). Enter format and each player's deck/commander. No card database or life-counter is included.
- Win percentage = wins / all recorded appearances. Unrecorded outcomes stay in the denominator. Competitive tied wins are included as wins; draws are not mutually exclusive with wins in that case.
- Names are matched for player statistics ignoring case and surrounding whitespace. Use the same spelling. Game title grouping is title-based, not canonical BGG-ID-based, so consistent titles matter.
- History text/type/mode filters also apply to all statistics. JSON/CSV export includes ALL saved plays, not just filtered ones.
- Scores from different titles are kept separate. Score plots use one x position per session in chronological order; intervals are not proportional to elapsed days. Hover points for details on desktop.
- Durations are minutes. Blank is unknown; zero is valid. Recorded hours exclude unknown durations. One session with four participants still counts once toward session totals and total time.

## Backup and privacy

JSON imports validate the full file before writing, merge by UUID and skip existing IDs. Imports are limited to 10 MB / 20,000 sessions. Cloud inserts are chunked; an interrupted import can partially finish and be resumed. CSV is intended for spreadsheets, not re-import. Spreadsheet-formula-leading characters are escaped. Keep backups secure because names and notes are included.

Database policies isolate accounts; the browser uses only a low-privilege key. All BGG searches require a valid Supabase session. User text is escaped before insertion into HTML. There is no service-role key in this project. Dependencies load from a CDN; internet access is required for cloud mode. For a public production launch, bundle/pin dependencies with a lockfile, add security headers, rate limiting, monitoring, automated browser/RLS tests and a data retention policy.

## Manual smoke-test checklist (not an automated test suite)

1. Save two competitive players with scores and one winner; refresh and check persistence.
2. Edit the score; verify history and charts update. Delete a disposable record.
3. Solo: remove the second player and record win/loss/score-only sessions.
4. Co-op: record a win with multiple players; all should get one win.
5. MTG: enter Commander and decks; verify search and CSV include deck names.
6. Export JSON, import in a fresh browser, then repeat import; no duplicates should appear.
7. Cloud: sign in on two devices; save on one and reload the other.
8. Use another account: it must not see the first account's records. Test database SELECT/INSERT/UPDATE/DELETE authorization before production.
9. With no BGG token, verify manual entry works and search reports a configuration error; with an approved token, select a result and verify the link.

Generated starter code; no live deployment, credentials or end-to-end browser validation are included.
