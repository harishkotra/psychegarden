# PsycheGarden

PsycheGarden is a deployable PWA hackathon MVP where mental vitality is visualized as a living garden. It blends local simulated signals with optional external context (Open-Meteo, Tavily, Bright Data-ready adapter) and optional OpenAI reflection.

## Stack

- React + TypeScript + Vite frontend
- Node + Express backend
- PWA (manifest + service worker + offline fallback)
- Cloud Run-ready Docker image

## External Context Integrations

All integrations are optional and fault-tolerant.

- Open-Meteo (no key required)
- Tavily (`TAVILY_API_KEY`, optional)
- Bright Data Web MCP adapter (`BRIGHT_DATA_API_TOKEN` preferred, or `BRIGHT_DATA_API_KEY`, optional)
- OpenAI (`OPENAI_API_KEY`, optional)

Control external calls globally with:

- `ENABLE_EXTERNAL_CONTEXT=true|false`

Optional Bright Data MCP mode flags:

- `BRIGHT_DATA_MCP_URL` (defaults to hosted `https://mcp.brightdata.com/mcp`)
- `BRIGHT_DATA_PRO_MODE=true|false`
- `BRIGHT_DATA_GROUPS` (example: `geo,code`)
- `BRIGHT_DATA_TOOLS` (example: `search_engine`)

When disabled or keys are missing, PsycheGarden safely falls back to demo context.

## API Endpoints

### `GET /api/weather`
Returns normalized weather context:

- accepts optional `lat`, `lon`
- defaults to Bangalore, India if missing
- maps weather to garden effects (`sky`, `particles`, `soil`, `light`)

### `POST /api/research-nudge`
Input:

```json
{
  "restoration_action": "2 minute breathing exercise",
  "burnout_risk": "medium",
  "emotional_state": "mentally loaded"
}
```

Output:

- source `tavily` when available
- source `fallback` with no fake links otherwise
- short summary + max 2 links

### `POST /api/context`
Unified context layer combining weather + public context + optional research context.

Input:

```json
{
  "lat": 12.97,
  "lon": 77.59,
  "moodText": "Feeling overloaded",
  "signals": {
    "sleepHours": 6,
    "screenTime": 5,
    "meetingLoad": 7,
    "steps": 2200
  },
  "vitality": 41
}
```

### `POST /api/insight`
Uses OpenAI if configured, otherwise local fallback. Supports external context in prompt and returns:

```json
{
  "emotional_state": "string",
  "burnout_risk": "low | medium | high",
  "garden_metaphor": "string",
  "insight": "string",
  "restoration_action": "string",
  "micro_message": "string",
  "contextual_reason": "string"
}
```

## UI Additions

The app includes game-like context sections:

- Garden Scene
- Garden Vitality HUD
- Today’s Sky / World Pressure panel
- Garden Wisdom
- Restoration Spell
- Why this spell works (expandable, subtle)
- Demo presets:
  - Calm Morning
  - Meeting Overload
  - Doomscroll Spiral
  - Stormy Day
  - Recovery Mode

## Disclaimer

PsycheGarden is a wellness reflection tool, not medical advice.

## Local Development

1. Install deps:

```bash
npm install
```

2. Optional env setup:

```bash
cp .env.example .env
# fill values as needed
```

3. Run app:

```bash
npm run dev
```

This starts:

- Vite frontend
- Express API dev server on `8787`

## Tests

Run:

```bash
npm test
```

Included tests cover:

- energy calculation stability
- weather normalization
- Tavily fallback behavior
- Bright Data fallback behavior
- unified context response shape without API keys

## Production Build

```bash
npm run build
npm run start
```

`npm run start` serves static build and API on `PORT` (default `8080`).

## Docker

Build:

```bash
docker build -t psychegarden .
```

Run:

```bash
docker run -p 8080:8080 \
  -e OPENAI_API_KEY=YOUR_KEY \
  -e TAVILY_API_KEY=YOUR_KEY \
  -e ENABLE_EXTERNAL_CONTEXT=true \
  psychegarden
```

## Cloud Run

```bash
gcloud builds submit --tag gcr.io/PROJECT_ID/psychegarden

gcloud run deploy psychegarden \
  --image gcr.io/PROJECT_ID/psychegarden \
  --platform managed \
  --region asia-south1 \
  --allow-unauthenticated \
  --set-env-vars OPENAI_API_KEY=YOUR_KEY,TAVILY_API_KEY=YOUR_KEY,ENABLE_EXTERNAL_CONTEXT=true
```

Notes:

- Open-Meteo works without an API key.
- Tavily is optional.
- Bright Data integration is optional and safely falls back.
- App remains fully demoable without paid APIs.
