import cookie from 'cookie';

export function json(res, status, data, extraHeaders={}){
  const headers = {
    'Content-Type':'application/json',
    'Cache-Control':'no-store',
    'Access-Control-Allow-Credentials':'true',
    ...extraHeaders
  };
  res.statusCode = status;
  Object.entries(headers).forEach(([k,v])=>res.setHeader(k,v));
  res.end(JSON.stringify(data));
}

export function allowCors(req, res){
  const origin = req.headers.origin || '*';
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Vary', 'Origin');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-admin-token');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, POST, OPTIONS');
  if (req.method === 'OPTIONS') {
    res.statusCode = 204; res.end(); return true;
  }
  return false;
}

export function verifyAuth(req){
  // Replace this with your real session check. Example:
  // - Accept cookie admin_auth=1 (set by your login flow)
  // - Or header x-admin-token: <secret>
  const raw = req.headers.cookie || '';
  const c = cookie.parse(raw || '');
  if (c.admin_auth === '1') return true;
  const token = req.headers['x-admin-token'];
  if (token && token === process.env.ADMIN_TOKEN) return true;
  return false;
}
