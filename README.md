# L3Z Backend (Vercel)

Serverless API for Bonus Hunt + PvP.

## Storage
- **Production**: set `KV_REDIS_URL` (Vercel KV or any Redis URL).  
- **Dev**: falls back to in-memory store (non-persistent).

## Auth
- Example middleware checks cookie `admin_auth=1` or header `x-admin-token: <secret>`.
- Replace `verifyAuth()` with your real logic or wire to your existing `/admin/me` session.

## Endpoints
- `GET/PUT /api/bonus-hunt` → current hunt document (was localStorage `bh:live`)
- `GET/PUT /api/markets?mode=bonus|battleground|pvp` → markets blob (was `sb:markets*`)
- `GET/PUT /api/pvp/entries` → raw entries list
- `GET/PUT /api/pvp/bracket` → normalized bracket
- `POST    /api/pvp/progress` → server-driven progression: `{ round, index, winner }`

## Dev
```bash
npm i
vercel dev
# or: npm run start (simple http for local testing)
```

## Frontend switch (server-first)
```js
async function apiGet(path, fb=null){
  try{ const r = await fetch(path, {credentials:'include', cache:'no-store'});
       if(!r.ok) throw 0; return await r.json(); } catch { return fb; }
}
async function apiPut(path, body){
  const r = await fetch(path, {method:'PUT', credentials:'include',
    headers:{'Content-Type':'application/json'}, body:JSON.stringify(body)});
  if(!r.ok) throw new Error('save failed');
}
```
