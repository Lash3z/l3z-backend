import https from 'node:https';

function request(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, (res) => {
        let raw = '';
        res.on('data', (chunk) => (raw += chunk));
        res.on('end', () => {
          if (res.statusCode && res.statusCode >= 400) {
            reject(new Error(`Kick API error ${res.statusCode}`));
          } else {
            try {
              resolve(JSON.parse(raw || '{}'));
            } catch (error) {
              resolve(null);
            }
          }
        });
      })
      .on('error', reject);
  });
}

export async function verifyKickUsername(username) {
  if (!username) return { valid: false };
  try {
    const profile = await request(`https://kick.com/api/v2/channels/${encodeURIComponent(username)}`);
    return {
      valid: !!profile?.user?.username,
      profile
    };
  } catch (error) {
    return { valid: false, error: error.message };
  }
}
