import { kvGet, kvSet } from '../lib/store.js';
import { json, allowCors, verifyAuth } from '../lib/http.js';

const KEY = 'pvp:entries';

export default async function handler(req, res){
  if (allowCors(req, res)) return;
  try{
    if (req.method === 'GET'){
      const list = await kvGet(KEY);
      return json(res, 200, Array.isArray(list) ? list : []);
    }
    if (req.method === 'PUT'){
      if (!verifyAuth(req)) return json(res, 401, {error:'unauthorized'});
      const body = await readBody(req);
      const clean = (Array.isArray(body)?body:[]).map(e=>({
        user: (e.user||'').toString().toUpperCase(),
        game: (e.game||'').toString().toUpperCase(),
        side: (e.side==='WEST'?'WEST':'EAST')
      }));
      await kvSet(KEY, clean);
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
      try{ resolve(JSON.parse(d||'[]')); }catch(e){ reject(e); }
    });
  });
}
