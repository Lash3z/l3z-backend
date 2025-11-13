import { kvGet, kvSet } from '../lib/store.js';
import { json, allowCors, verifyAuth } from '../lib/http.js';

const KEY = 'pvp:live';

export default async function handler(req, res){
  if (allowCors(req, res)) return;
  try{
    if (req.method === 'GET'){
      const doc = await kvGet(KEY);
      return json(res, 200, doc || defaultBracket());
    }
    if (req.method === 'PUT'){
      if (!verifyAuth(req)) return json(res, 401, {error:'unauthorized'});
      const body = await readBody(req);
      normalize(body);
      await kvSet(KEY, body);
      return json(res, 200, { ok:true });
    }
    return json(res, 405, {error:'method not allowed'});
  }catch(e){
    return json(res, 500, {error:String(e?.message || e)});
  }
}

function defaultBracket(){
  return {
    title: 'PVP — LIVE',
    eastR1: [[],[],[],[]],
    eastSF: [null,null],
    eastF: null,
    westR1: [[],[],[],[]],
    westSF: [null,null],
    westF: null,
    gf: [null,null],
    champion: null
  };
}

function normalize(b){
  b.title = (b.title||'').toString();
  b.eastR1 = normPairs(b.eastR1); b.westR1 = normPairs(b.westR1);
  b.eastSF = normSingles(b.eastSF); b.westSF = normSingles(b.westSF);
  b.eastF = normVal(b.eastF); b.westF = normVal(b.westF);
  b.gf = Array.isArray(b.gf) ? [normVal(b.gf[0]), normVal(b.gf[1])] : [null,null];
  b.champion = normVal(b.champion);
}
function normVal(v){ const s = (v==null?'':String(v)).trim(); return s? s.toUpperCase() : null; }
function normSingles(a){ return Array.isArray(a) ? [normVal(a[0]), normVal(a[1])] : [null,null]; }
function normPairs(a){
  const out = [[],[],[],[]];
  (Array.isArray(a)?a:[]).slice(0,4).forEach((p,i)=>{
    const L = (Array.isArray(p)?p:[]);
    out[i] = [normVal(L[0]), normVal(L[1])];
  });
  return out;
}

function readBody(req){
  return new Promise((resolve,reject)=>{
    let d=''; req.on('data',c=>d+=c); req.on('end',()=>{
      try{ resolve(JSON.parse(d||'{}')); }catch(e){ reject(e); }
    });
  });
}
