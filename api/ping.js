export default async function handler(req, res) {
  const start = Date.now();
  const timestamp = new Date().toISOString();

  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Pragma', 'no-cache');

  if (req.method !== 'GET') {
    console.warn(`[api/ping] Rejected ${req.method} — method not allowed`);
    res.setHeader('Allow', 'GET');
    return res.status(405).json({
      ok: false,
      service: 'supabase',
      status: 'unreachable',
      httpStatus: 405,
      latency: 0,
      timestamp,
      error: `Method ${req.method} not allowed`,
    });
  }

  const { SUPABASE_URL, SUPABASE_ANON_KEY } = process.env;

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.error(`[api/ping] Missing SUPABASE_URL or SUPABASE_ANON_KEY`);
    return res.status(500).json({
      ok: false,
      service: 'supabase',
      status: 'unreachable',
      httpStatus: 500,
      latency: 0,
      timestamp,
      error: 'Missing SUPABASE_URL or SUPABASE_ANON_KEY environment variables',
    });
  }

  const projectMatch = SUPABASE_URL.match(/https:\/\/([^.]+)\.supabase\.co/);
  const projectRef = projectMatch ? projectMatch[1] : undefined;

  console.log(`[api/ping] Starting — GET /auth/v1/health`);

  const controller = new AbortController();
  const TIMEOUT_MS = 10000;
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(`${SUPABASE_URL}/auth/v1/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    const latency = Date.now() - start;

    if (response.ok) {
      console.log(`[api/ping] Completed — ${response.status} in ${latency}ms`);
      return res.status(200).json({
        ok: true,
        service: 'supabase',
        status: 'reachable',
        httpStatus: response.status,
        latency,
        timestamp,
        ...(projectRef ? { project: projectRef } : {}),
      });
    }

    console.warn(`[api/ping] Failed — HTTP ${response.status} in ${latency}ms`);
    return res.status(503).json({
      ok: false,
      service: 'supabase',
      status: 'unreachable',
      httpStatus: 503,
      latency,
      timestamp,
      error: `Supabase returned HTTP ${response.status}`,
    });
  } catch (err) {
    clearTimeout(timeoutId);
    const latency = Date.now() - start;

    if (err.name === 'AbortError') {
      console.warn(`[api/ping] Timeout — ${TIMEOUT_MS}ms exceeded`);
      return res.status(503).json({
        ok: false,
        service: 'supabase',
        status: 'timeout',
        httpStatus: 503,
        latency: TIMEOUT_MS,
        timestamp,
        error: `Request timed out after ${TIMEOUT_MS}ms`,
      });
    }

    console.error(`[api/ping] Error — ${err.message} in ${latency}ms`);
    return res.status(503).json({
      ok: false,
      service: 'supabase',
      status: 'unreachable',
      httpStatus: 503,
      latency,
      timestamp,
      error: err.message,
    });
  }
}
