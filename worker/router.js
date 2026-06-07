export default {
  async fetch(request, env) {
    const url = new URL(request.url)
    const pathname = url.pathname

    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    }

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders })
    }

    // ── Wishlist ──────────────────────────────────────────────
    if (pathname === '/api/wishlist' || pathname === '/wallsquat/api/wishlist') {
      if (request.method === 'GET') {
        if (!env.MY_DB) {
          return new Response(JSON.stringify({ items: [] }), {
            headers: { 'Content-Type': 'application/json', ...corsHeaders }
          })
        }
        try {
          const result = await env.MY_DB.prepare(
            'SELECT data FROM checkins WHERE id = ?'
          ).bind('wishlist').first()
          const items = result ? JSON.parse(result.data) : []
          return new Response(JSON.stringify({ items }), {
            headers: { 'Content-Type': 'application/json', ...corsHeaders }
          })
        } catch (err) {
          return new Response(JSON.stringify({ error: err.message }), {
            status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders }
          })
        }
      } else {
        // POST/PUT – body = { items: [...] }
        let body
        try { body = await request.json() } catch { body = {} }
        const items = Array.isArray(body.items) ? body.items : []

        if (!env.MY_DB) {
          return new Response(JSON.stringify({ success: true, note: 'no db', items }), {
            headers: { 'Content-Type': 'application/json', ...corsHeaders }
          })
        }
        try {
          await env.MY_DB.prepare(
            'INSERT OR REPLACE INTO checkins (id, data) VALUES (?, ?)'
          ).bind('wishlist', JSON.stringify(items)).run()
          return new Response(JSON.stringify({ success: true, items }), {
            headers: { 'Content-Type': 'application/json', ...corsHeaders }
          })
        } catch (err) {
          return new Response(JSON.stringify({ error: err.message }), {
            status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders }
          })
        }
      }
    }

    // API routes → D1 (both /api and /wallsquat/api)
    if (pathname === '/api/checkins' || pathname === '/wallsquat/api/checkins') {
      if (request.method === 'GET') {
        if (!env.MY_DB) {
          return new Response(JSON.stringify({ error: 'DB not configured', records: {} }), {
            headers: { 'Content-Type': 'application/json', ...corsHeaders }
          })
        }
        try {
          const result = await env.MY_DB.prepare(
            'SELECT data FROM checkins WHERE id = ?'
          ).bind('records').first()
          const records = result ? JSON.parse(result.data) : {}
          return new Response(JSON.stringify({ records }), {
            headers: { 'Content-Type': 'application/json', ...corsHeaders }
          })
        } catch (err) {
          return new Response(JSON.stringify({ error: err.message }), {
            status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders }
          })
        }
      } else {
        // POST/PUT
        let body
        try {
          body = await request.json()
        } catch {
          body = {}
        }
        const records = body.records || {}

        if (!env.MY_DB) {
          return new Response(JSON.stringify({ success: true, note: 'no db', records }), {
            headers: { 'Content-Type': 'application/json', ...corsHeaders }
          })
        }
        try {
          const jsonData = JSON.stringify(records)
          await env.MY_DB.prepare(
            'INSERT OR REPLACE INTO checkins (id, data) VALUES (?, ?)'
          ).bind('records', jsonData).run()
          return new Response(JSON.stringify({ success: true, records }), {
            headers: { 'Content-Type': 'application/json', ...corsHeaders }
          })
        } catch (err) {
          return new Response(JSON.stringify({ error: err.message }), {
            status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders }
          })
        }
      }
    }

    // ── Messages (留言板) ─────────────────────────────────────
    if (pathname === '/api/messages' || pathname === '/wallsquat/api/messages') {
      if (request.method === 'GET') {
        if (!env.MY_DB) {
          return new Response(JSON.stringify({ messages: [] }), {
            headers: { 'Content-Type': 'application/json', ...corsHeaders }
          })
        }
        try {
          const result = await env.MY_DB.prepare(
            'SELECT data FROM checkins WHERE id = ?'
          ).bind('messages').first()
          const messages = result ? JSON.parse(result.data) : []
          return new Response(JSON.stringify({ messages }), {
            headers: { 'Content-Type': 'application/json', ...corsHeaders }
          })
        } catch (err) {
          return new Response(JSON.stringify({ error: err.message }), {
            status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders }
          })
        }
      } else if (request.method === 'POST') {
        // Add or update messages: body = { messages: [...] }
        let body
        try { body = await request.json() } catch { body = {} }
        const messages = Array.isArray(body.messages) ? body.messages : []
        if (!env.MY_DB) {
          return new Response(JSON.stringify({ success: true, note: 'no db', messages }), {
            headers: { 'Content-Type': 'application/json', ...corsHeaders }
          })
        }
        try {
          await env.MY_DB.prepare(
            'INSERT OR REPLACE INTO checkins (id, data) VALUES (?, ?)'
          ).bind('messages', JSON.stringify(messages)).run()
          return new Response(JSON.stringify({ success: true, messages }), {
            headers: { 'Content-Type': 'application/json', ...corsHeaders }
          })
        } catch (err) {
          return new Response(JSON.stringify({ error: err.message }), {
            status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders }
          })
        }
      } else {
        return new Response(JSON.stringify({ error: 'Method not allowed' }), {
          status: 405, headers: { 'Content-Type': 'application/json', ...corsHeaders }
        })
      }
    }

    // English checkin — separate D1 row
    if (pathname === '/api/english-checkin') {
      if (request.method === 'GET') {
        if (!env.MY_DB) {
          return new Response(JSON.stringify({ records: {} }), {
            headers: { 'Content-Type': 'application/json', ...corsHeaders }
          })
        }
        try {
          const result = await env.MY_DB.prepare(
            'SELECT data FROM checkins WHERE id = ?'
          ).bind('english-checkin').first()
          const records = result ? JSON.parse(result.data) : {}
          return new Response(JSON.stringify({ records }), {
            headers: { 'Content-Type': 'application/json', ...corsHeaders }
          })
        } catch (err) {
          return new Response(JSON.stringify({ error: err.message }), {
            status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders }
          })
        }
      } else {
        let body
        try { body = await request.json() } catch { body = {} }
        const records = body.records || {}
        if (!env.MY_DB) {
          return new Response(JSON.stringify({ success: true, records }), {
            headers: { 'Content-Type': 'application/json', ...corsHeaders }
          })
        }
        try {
          await env.MY_DB.prepare(
            'INSERT OR REPLACE INTO checkins (id, data) VALUES (?, ?)'
          ).bind('english-checkin', JSON.stringify(records)).run()
          return new Response(JSON.stringify({ success: true, records }), {
            headers: { 'Content-Type': 'application/json', ...corsHeaders }
          })
        } catch (err) {
          return new Response(JSON.stringify({ error: err.message }), {
            status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders }
          })
        }
      }
    }

    // Static files → proxy to wall-squat Pages
    if (pathname.startsWith('/wallsquat/_next/')) {
      const pagesPath = pathname.replace('/wallsquat', '')
      const pagesUrl = `https://30c533ae.wall-squat.pages.dev${pagesPath}${url.search}`
      return fetch(new Request(pagesUrl, request))
    }

    if (pathname === '/wallsquat' || pathname === '/wallsquat/') {
      try {
        const res = await fetch(`https://30c533ae.wall-squat.pages.dev/index.html`)
        const html = await res.text()
        return new Response(html, {
          headers: { 'Content-Type': 'text/html; charset=utf-8' }
        })
      } catch (e) {
        return new Response('Service temporarily unavailable', { status: 503 })
      }
    }

    // Root → blank page (only apex domain)
    if (url.hostname === 'hellodiane.top') {
      return new Response('<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><style>body{background:#fefcf9;margin:0;height:100vh;}</style></head><body></body></html>', {
        headers: { 'Content-Type': 'text/html' }
      })
    }

    // Fallback
    return fetch(request)
  }
}