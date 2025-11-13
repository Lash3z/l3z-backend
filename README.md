# LASH3Z Interactive Stream Hub API

Node.js + Express backend for the LASH3Z ecosystem. The server exposes REST
endpoints, WebSocket broadcasts, and persistent storage hooks for wallets,
bets, raffles, battlegrounds, premier league play, and community mini-games.

## Getting Started

```bash
npm install
npm run dev
# API => http://localhost:4000
# WS  => ws://localhost:4000/ws
```

The server automatically loads environment variables from `.env` when running
outside of Vercel.

### Required Environment Variables

| Variable | Description |
| --- | --- |
| `ADMIN_TOKEN` | Token used to authorize privileged routes (also sets the `admin_auth` cookie). |
| `CORS_ORIGIN` | Comma-separated list of allowed origins. Defaults to `*`. |
| `SUPABASE_URL` | Supabase project URL (optional – routes continue to work with in-memory storage). |
| `SUPABASE_SERVICE_ROLE` / `SUPABASE_ANON_KEY` | Supabase key for server-to-server calls. |
| `KV_REDIS_URL` (or `REDIS_URL` / `UPSTASH_REDIS_REST_URL`) | Redis connection string for persistent storage. Optional; falls back to in-memory Map. |

## Modules & Routes

| Route | Description |
| --- | --- |
| `POST /auth/register` | Create a user and bootstrap an LBX wallet. |
| `POST /auth/login` | Simple email/password login that records last login time. |
| `POST /auth/kick/verify` | Kick username validation + optional account linking. |
| `POST /auth/admin/session` | Exchanges the admin token for an `admin_auth` cookie. |
| `GET /wallet/:userId` | Fetch the user's wallet (balance + transactions). |
| `POST /wallet/:userId/daily-claim` | Claim daily LBX allowance. |
| `POST /wallet/:userId/adjust` | Admin adjustment of LBX (requires `x-admin-token`). |
| `POST /wallet/:userId/set` | Admin set-to balance. |
| `POST /wallet/:userId/payout` | Admin payout helper. |
| `GET/POST /bets` | Place LBX wagers and list existing bets. |
| `POST /bets/:id/settle` | Admin settlement handler. |
| `GET/PUT /battleground` | 16-slot head-to-head session state. |
| `POST /battleground/match/:id` | Admin score updates per matchup. |
| `POST /battleground/result` | Admin winner recording + scoreboard update. |
| `POST /battleground/rotate` | Advance the widget rotation index. |
| `GET/PUT /premier` | Premier League group and fixture state. |
| `POST /premier/match` | Admin multiplier result entry. |
| `POST /premier/shuffle` | Admin-triggered group shuffling. |
| `POST /premier/active` | Set the active match for widgets. |
| `GET /bonus` | Bonus Hunt (prediction market) state. |
| `POST /bonus/entry` | Submit or update a user prediction (20 LBX entry handled in wallet logic). |
| `PUT /bonus` | Admin override of hunt state. |
| `POST /bonus/lock` | Admin lock + results input. |
| `GET/POST /raffles` | Raffle management and entries. |
| `POST /raffles/:id/draw` | Admin winner picker (returns the drawn entry). |
| `GET/POST /schedule` | Stream session schedule, round control, and history. |
| `GET/PATCH /users` | Roster management, Kick linkage, metadata editing. |
| `GET/POST /stamina` | Stamina queue management (5-in-a-row mini-game). |
| `GET/PUT /lucky7` | Lucky 7 scoring table + winner announcements. |
| `GET/PUT /leaderboards` | LBX, Premier, and Wager Race leaderboards. |

Every mutating admin route expects `x-admin-token: <ADMIN_TOKEN>` in the request
headers (or an `admin_auth=1` cookie).

## Storage Layer

The services persist JSON blobs using a Redis-backed key/value layer when the
`KV_REDIS_URL` (or compatible) environment variable is defined. Without Redis,
the API transparently falls back to an in-memory Map for local development.

## Realtime Updates

A WebSocket hub is mounted at `/ws`. Any changes written through the `kvStore`
emit `kv:set` and `kv:delete` events which are broadcast to connected clients.
Consumers can subscribe to the socket stream for live scoreboard, wallet, and
leaderboard updates inside OBS widgets and dashboards.

## Development Notes

- Codebase uses native ES modules (`"type": "module"`).
- The Supabase client is created lazily. If no Supabase credentials are supplied
  the service returns `null`, allowing local mocks or alternate auth flows.
- Admin-protected helpers live in `src/services/*` and are composed by route
  handlers – swap in your own data stores as production requirements expand.
- Run `npm run create-download` to build a `downloadable/lash3z-interactive-stream-hub`
  folder with a copy of the backend that can be zipped and shared.
- A ready-to-use Visual Studio Code configuration is provided. Launch the
  repository in VS Code, accept the recommended extensions, and press `F5` (or
  select **Run → Start Debugging**) to boot the API via the `Launch API Server`
  configuration. If you prefer a fully isolated workspace, open the folder in
  a Dev Container (Remote Containers / Codespaces) and VS Code will provision a
  Node.js 20 environment automatically using the `.devcontainer` settings.
