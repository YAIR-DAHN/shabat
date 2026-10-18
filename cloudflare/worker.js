var MAX_AGE_MS = 20 * 60 * 1000;

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Cache-Secret',
    'Cache-Control': 'private, no-store'
  };
}

function json(body, status) {
  return new Response(JSON.stringify(body), {
    status: status || 200,
    headers: Object.assign({ 'Content-Type': 'application/json; charset=utf-8' }, corsHeaders())
  });
}

async function sha256Hex(text) {
  var bytes = new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(String(text))));
  var hex = '';
  for (var i = 0; i < bytes.length; i++) hex += bytes[i].toString(16).padStart(2, '0');
  return hex;
}

function readData(url) {
  var raw = url.searchParams.get('data');
  if (!raw) return {};
  try {
    return JSON.parse(decodeURIComponent(raw));
  } catch (error) {
    try {
      return JSON.parse(raw);
    } catch (second) {
      return {};
    }
  }
}

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') return new Response(null, { headers: corsHeaders() });
    var url = new URL(request.url);

    if (url.pathname === '/ingest' && request.method === 'POST') {
      var secret = request.headers.get('X-Cache-Secret') || '';
      if (!env.CACHE_SECRET || secret !== env.CACHE_SECRET) return json({ error: 'unauthorized' }, 401);
      var body = await request.text();
      await env.SNAPSHOT.put('bundle', body);
      return json({ ok: true });
    }

    if (url.pathname !== '/read') return json({ ok: true });
    var stored = await env.SNAPSHOT.get('bundle');
    if (!stored) return json({ miss: true });
    var bundle = JSON.parse(stored);
    if (!bundle.at || Date.now() - bundle.at > MAX_AGE_MS) return json({ miss: true });

    var action = url.searchParams.get('action') || '';
    if (bundle.public && Object.prototype.hasOwnProperty.call(bundle.public, action)) return json(bundle.public[action]);

    var data = readData(url);
    var hash = await sha256Hex(data.pin || '');
    var staff = bundle.staff || [];
    var user = null;
    for (var i = 0; i < staff.length; i++) {
      if (staff[i].pinHash === hash && staff[i].active !== false) user = staff[i];
    }
    if (!user) return json({ miss: true });
    if (action === 'adminListStaff' && user.role !== 'super') return json({ success: false, error: 'forbidden' });

    var weekId = data.weekId ? String(data.weekId) : '';
    var source = data.source ? String(data.source) : '';
    var key = action + '|' + weekId + '|' + source;
    if (user.role === 'coordinator') {
      var mine = bundle.coordinators && bundle.coordinators[hash];
      if (mine && Object.prototype.hasOwnProperty.call(mine, key)) return json(mine[key]);
      return json({ miss: true });
    }
    if (bundle.variants && Object.prototype.hasOwnProperty.call(bundle.variants, key)) return json(bundle.variants[key]);
    if (bundle.admin && Object.prototype.hasOwnProperty.call(bundle.admin, action)) return json(bundle.admin[action]);
    return json({ miss: true });
  }
};
