import http from 'http';
import url from 'url';
import bonusHunt from './bonus-hunt.js';
import markets from './markets.js';
import pvpEntries from './pvp/entries.js';
import pvpBracket from './pvp/bracket.js';
import pvpProgress from './pvp/progress.js';

const routes = {
  '/api/bonus-hunt': bonusHunt,
  '/api/markets': markets,
  '/api/pvp/entries': pvpEntries,
  '/api/pvp/bracket': pvpBracket,
  '/api/pvp/progress': pvpProgress
};

const server = http.createServer(async (req,res)=>{
  const parsed = url.parse(req.url).pathname;
  const fn = routes[parsed];
  if (fn) return fn(req,res);
  res.statusCode = 404;
  res.end('not found');
});

server.listen(3000, ()=>console.log('Dev server on http://localhost:3000'));
