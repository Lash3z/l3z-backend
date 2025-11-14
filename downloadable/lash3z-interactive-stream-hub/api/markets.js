import { kvGet, kvSet } from './lib/store.js';
import { json, allowCors, verifyAuth } from './lib/http.js';

const KEY_MAP = {
  bonus: 'sb:markets',
  battleground: 'sb:markets:battleground',
  pvp: 'sb:markets:pvp'
};

export default async function handler(req, res){
  if (allowCors(req, res)) return;
  try{
    const url = new URL(req.url, 'http://x');
    const mode = (url.searchParams.get('mode') || 'bonus').toLowerCase();
    const KEY = KEY_MAP[mode] || KEY_MAP.bonus;

    if (req.method === 'GET'){
      const doc = await kvGet(KEY);
      return json(res, 200, doc || { eventId:'', title:'', status:'open', markets:[] });
    }
    if (req.method === 'PUT'){
      if (!verifyAuth(req)) return json(res, 401, {error:'unauthorized'});
      const body = await readBody(req);
      body.title = (body.title||'').toString();
      body.status = body.status || 'open';
      body.markets = Array.isArray(body.markets) ? body.markets : [];
      await kvSet(KEY, body);
      return json(res, 200, { ok:true });
    }
    return json(res, 405, {error:'method not allowed'});
  }catch(e){
    return json(res, 500, {error:String(e?.message || e)});
  }
}

function readBody(req){
  return new Promise((resolve,reject)=>{
    let d=''; req.on('data',c=>d+=c); req.on('end',()=>{
      try{ resolve(JSON.parse(d||'{}')); }catch(e){ reject(e); }
    });
  });
}
