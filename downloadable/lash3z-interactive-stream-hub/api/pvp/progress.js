import { kvGet, kvSet } from '../lib/store.js';
import { json, allowCors, verifyAuth } from '../lib/http.js';

const KEY = 'pvp:live';

export default async function handler(req, res){
  if (allowCors(req, res)) return;
  try{
    if (req.method !== 'POST') return json(res, 405, {error:'method not allowed'});
    if (!verifyAuth(req)) return json(res, 401, {error:'unauthorized'});
    const body = await readBody(req);
    const { round, index, winner } = body || {};
    if (!round) return json(res, 400, {error:'round required'});
    const b = (await kvGet(KEY)) || defaultBracket();
    applyProgress(b, (round||'').toUpperCase(), index, (winner||'').toUpperCase());
    await kvSet(KEY, b);
    return json(res, 200, { ok:true, bracket:b });
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

// Applies a winner and advances to the next round automatically
function applyProgress(b, round, index, winner){
  if (!winner) return;
  switch(round){
    case 'EAST_R1': {
      if (index==null || index<0 || index>3) break;
      // place winner into eastSF: index 0→eastSF[0], 1→eastSF[0], 2→eastSF[1], 3→eastSF[1]
      const sfIdx = (index<2) ? 0 : 1;
      if (!b.eastSF[sfIdx]) b.eastSF[sfIdx] = winner;
      else b.eastSF[sfIdx] = winner; // last click wins
      break;
    }
    case 'EAST_SF': {
      // goes to eastF
      if (index==null || index<0 || index>1) break;
      b.eastF = winner;
      break;
    }
    case 'EAST_F': {
      // goes to GF left
      b.gf[0] = winner;
      break;
    }
    case 'WEST_R1': {
      if (index==null || index<0 || index>3) break;
      const sfIdx = (index<2) ? 0 : 1;
      b.westSF[sfIdx] = winner;
      break;
    }
    case 'WEST_SF': {
      b.westF = winner;
      break;
    }
    case 'WEST_F': {
      // goes to GF right
      b.gf[1] = winner;
      break;
    }
    case 'GF': {
      b.champion = winner;
      break;
    }
    default: break;
  }
}
