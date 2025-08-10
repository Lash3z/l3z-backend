import { kvGet, kvSet } from './lib/store.js';
import { json, allowCors, verifyAuth } from './lib/http.js';

const KEY = 'bh:live';

export default async function handler(req, res){
  if (allowCors(req, res)) return;
  try{
    if (req.method === 'GET'){
      const doc = await kvGet(KEY);
      return json(res, 200, doc || { title:'', status:'open', start:0, end:0, entries:[], started:false });
    }
    if (req.method === 'PUT'){
      if (!verifyAuth(req)) return json(res, 401, {error:'unauthorized'});
      const body = await readBody(req);
      normalizeHunt(body);
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

function normalizeHunt(h){
  h.title = (h.title||'').toString().toUpperCase();
  h.status = h.status || 'open';
  h.start = +h.start || 0;
  h.end = +h.end || 0;
  h.started = !!h.started;
  h.entries = (h.entries||[]).map(e=>({
    slot: (e.slot||'').toString().toUpperCase(),
    provider: (e.provider||'').toString().toUpperCase(),
    bet: +e.bet || 0,
    img: e.img || '/assets/media/lash3zbux_pp.png',
    note: (e.note||'').toString().toUpperCase(),
    payout: +e.payout || 0,
    x: +e.x || ( (+e.bet>0) ? (+e.payout/+e.bet) : 0 ),
    done: !!e.done
  }));
}
