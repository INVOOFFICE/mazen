import { APP_CONFIG } from './config/app-config.js'

const URL = APP_CONFIG.supabase.url
const ANON_KEY = APP_CONFIG.supabase.anonKey
const STORAGE_KEY = 'mazen_supabase_session'

const baseHeaders = {
  'apikey': ANON_KEY,
  'Content-Type': 'application/json',
}

function loadSession() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function saveSession(token, user) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ access_token: token, user }))
  } catch {}
}

function clearSession() {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {}
}

function authHeaders() {
  const s = loadSession()
  return s && s.access_token ? { 'Authorization': `Bearer ${s.access_token}` } : {}
}

async function api(path, options = {}) {
  const { body, ...rest } = options
  const hasBody = body !== undefined && body !== null
  const url = `${URL}${path}`
  const res = await fetch(url, {
    ...rest,
    ...(hasBody ? { body } : {}),
    headers: { ...baseHeaders, ...authHeaders(), ...(rest.headers || {}) },
  })
  if (!res.ok) {
    let msg = `HTTP ${res.status}`
    try { const t = await res.text(); if (t) msg = t } catch {}
    throw new Error(msg)
  }
  const ct = res.headers.get('content-type') || ''
  return ct.includes('application/json') ? res.json() : res.text()
}

export const supabase = {
  auth: {
    async signInWithPassword({ email, password }) {
      try {
        const data = await api('/auth/v1/token?grant_type=password', {
          method: 'POST',
          body: JSON.stringify({ email, password }),
        })
        if (data && data.access_token) {
          saveSession(data.access_token, data.user)
        }
        return { data, error: null }
      } catch (err) {
        return { data: null, error: { message: err.message } }
      }
    },

    async signOut() {
      const s = loadSession()
      if (s && s.access_token) {
        await fetch(`${URL}/auth/v1/logout`, {
          method: 'POST',
          headers: { ...baseHeaders, 'Authorization': `Bearer ${s.access_token}` },
        }).catch(() => {})
      }
      clearSession()
    },

    async getSession() {
      const s = loadSession()
      if (!s || !s.access_token) return { data: { session: null } }
      return {
        data: {
          session: {
            access_token: s.access_token,
            user: s.user || null,
          },
        },
      }
    },
  },

  from(table) {
    function mkHeaders() {
      return { ...baseHeaders, ...authHeaders(), 'Prefer': 'return=representation' }
    }

    function build(qs, extra = {}) {
      const url = `/rest/v1/${table}${qs ? '?' + qs : ''}`
      const hasBody = extra.body !== undefined && extra.body !== null
      return api(url, {
        ...extra,
        ...(hasBody ? {} : { body: undefined }),
        headers: { ...mkHeaders(), 'Accept': 'application/json', ...(extra.headers || {}) },
      })
    }

    function qsFromParams(params) {
      const parts = []
      for (const [k, v] of params.entries()) {
        parts.push(`${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
      }
      return parts.join('&')
    }

    const chain = {
      _params: new URLSearchParams(),
      _single: false,

      select(columns) {
        this._params.set('select', columns || '*')
        return this
      },

      eq(column, value) {
        this._params.append(column, `eq.${value}`)
        return this
      },

      neq(column, value) {
        this._params.append(column, `neq.${value}`)
        return this
      },

      order(column, { ascending = true } = {}) {
        this._params.append('order', `${column}.${ascending ? 'asc' : 'desc'}.nullsfirst`)
        return this
      },

      limit(n) {
        this._params.set('limit', String(n))
        return this
      },

      single() {
        this._single = true
        this._params.set('limit', '1')
        return this
      },

      then(resolve) {
        const qs = qsFromParams(this._params)
        build(qs).then(raw => {
          let data = raw
          if (this._single && Array.isArray(data)) data = data[0] || null
          resolve({ data, error: null })
        }).catch(err => {
          resolve({ data: null, error: err })
        })
        return this
      },

      async insert(payload) {
        const data = await build('', {
          method: 'POST',
          body: JSON.stringify(payload),
        })
        return { data, error: null }
      },

      update(payload) {
        const parent = this
        const qs = qsFromParams(this._params)
        return {
          eq(column, value) {
            const eqQs = qs ? `${qs}&${encodeURIComponent(column)}=eq.${encodeURIComponent(value)}` : `${encodeURIComponent(column)}=eq.${encodeURIComponent(value)}`
            return {
              then(resolve) {
                build(eqQs, {
                  method: 'PATCH',
                  body: JSON.stringify(payload),
                }).then(data => resolve({ data, error: null }))
                  .catch(err => resolve({ data: null, error: err }))
              },
            }
          },
          then(resolve) {
            build(qs, {
              method: 'PATCH',
              body: JSON.stringify(payload),
            }).then(data => resolve({ data, error: null }))
              .catch(err => resolve({ data: null, error: err }))
          },
        }
      },

      delete() {
        const qs = qsFromParams(this._params)
        return {
          eq(column, value) {
            const eqQs = qs ? `${qs}&${encodeURIComponent(column)}=eq.${encodeURIComponent(value)}` : `${encodeURIComponent(column)}=eq.${encodeURIComponent(value)}`
            return {
              then(resolve) {
                build(eqQs, { method: 'DELETE' })
                  .then(data => resolve({ data, error: null }))
                  .catch(err => resolve({ data: null, error: err }))
              },
            }
          },
          then(resolve) {
            build(qs, { method: 'DELETE' })
              .then(data => resolve({ data, error: null }))
              .catch(err => resolve({ data: null, error: err }))
          },
        }
      },
    }

    chain.select('*')
    return chain
  },
}
