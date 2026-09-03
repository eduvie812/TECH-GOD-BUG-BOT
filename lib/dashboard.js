// Alpha by Mason — Web Dashboard
// Exposes a small HTTP API + serves the dashboard UI over the same Baileys connection.
const fs = require('fs')
const path = require('path')
const http = require('http')
const express = require('express')

const PORT = parseInt(process.env.PORT || process.env.DASHBOARD_PORT || 3000)
const DASH_DIR = path.join(__dirname, '..', 'dashboard')

function startDashboard(sock) {
    if (startDashboard._started) {
        // already running; just rebind hooks to the new socket
        if (sock) {
            const s = startDashboard._state
            sock.dashboard = {
                setQR: s.setQR, setPairingCode: s.setPairingCode,
                setConnected: s.setConnected, setUser: s.setUser,
                log: s.log, message: s.message
            }
        }
        if (sock && sock.dashboard && sock.dashboard.log) sock.dashboard.log('🔄 Reconnected — dashboard reattached')
        return startDashboard._app
    }
    startDashboard._started = true

    const app = express()
    app.use(express.json({ limit: '1mb' }))
    app.use(express.static(DASH_DIR))

    // ---- state ----
    const state = {
        connected: false,
        qr: null,                 // dataURL string
        qrRaw: null,              // raw qr string
        pairingCode: null,
        user: sock.user || null,
        startTime: Date.now(),
        logs: [],                 // ring buffer
        lastMessages: [],         // last 25 inbound messages
        chatbot: !!global.chatbot,
        aiProvider: global.aiProvider || 'simsimi',
        autoread: !!global.autoread,
        autoswview: !!global.autoswview,
        autoTyping: !!global.autoTyping,
        autoRecording: !!global.autoRecording,
        autobio: !!global.autobio,
        public: !!sock.public
    }
    const MAX_LOGS = 200
    const MAX_MSGS = 25
    const sseClients = new Set()

    function pushLog(line) {
        const ts = new Date().toISOString().replace('T', ' ').slice(0, 19)
        const entry = `[${ts}] ${line}`
        state.logs.push(entry)
        if (state.logs.length > MAX_LOGS) state.logs.shift()
        for (const res of sseClients) {
            try { res.write(`event: log\ndata: ${JSON.stringify(entry)}\n\n`) } catch (_) {}
        }
    }

    function pushMessage(m) {
        const item = {
            from: m.from || m.key?.remoteJid || '?',
            pushname: m.pushName || 'Unknown',
            text: (m.text || m.body || '').slice(0, 500),
            time: Date.now(),
            isGroup: !!m.isGroup
        }
        state.lastMessages.unshift(item)
        if (state.lastMessages.length > MAX_MSGS) state.lastMessages.pop()
        for (const res of sseClients) {
            try { res.write(`event: msg\ndata: ${JSON.stringify(item)}\n\n`) } catch (_) {}
        }
    }

    // Expose hooks to main.js
    sock.dashboard = {
        setQR: (qrDataUrl, qrRaw) => { state.qr = qrDataUrl; state.qrRaw = qrRaw },
        setPairingCode: (code) => { state.pairingCode = code },
        setConnected: (v) => { state.connected = v },
        setUser: (u) => { state.user = u },
        log: pushLog,
        message: pushMessage
    }

    // ---- API ----
    app.get('/api/status', (req, res) => {
        res.json({
            botname: global.botname,
            ownername: global.ownername,
            ownernumber: global.ownernumber,
            connected: state.connected,
            qr: state.connected ? null : state.qr,
            pairingCode: state.pairingCode,
            user: state.user,
            uptime: Math.floor((Date.now() - state.startTime) / 1000),
            settings: {
                chatbot: state.chatbot,
                aiProvider: state.aiProvider,
                aiName: global.aiName,
                autoread: state.autoread,
                autoswview: state.autoswview,
                autoTyping: state.autoTyping,
                autoRecording: state.autoRecording,
                autobio: state.autobio,
                public: state.public
            }
        })
    })

    app.get('/api/qr', (req, res) => {
        if (state.connected) return res.json({ connected: true })
        if (!state.qr) return res.status(404).json({ error: 'QR not yet generated' })
        res.json({ qr: state.qr, pairingCode: state.pairingCode })
    })

    app.get('/api/logs', (req, res) => {
        res.json({ logs: state.logs.slice(-100) })
    })

    app.get('/api/messages', (req, res) => {
        res.json({ messages: state.lastMessages })
    })

    app.post('/api/send', async (req, res) => {
        try {
            const { jid, text } = req.body || {}
            if (!jid || !text) return res.status(400).json({ error: 'jid and text required' })
            const j = jid.includes('@') ? jid : jid.replace(/[^0-9]/g, '') + '@s.whatsapp.net'
            await sock.sendMessage(j, { text })
            pushLog(`📤 Sent to ${j}: ${text.slice(0, 80)}`)
            res.json({ ok: true })
        } catch (e) {
            res.status(500).json({ error: e.message })
        }
    })

    app.post('/api/eval', async (req, res) => {
        try {
            const { code } = req.body || {}
            if (!code) return res.status(400).json({ error: 'code required' })
            if (!isOwner(req)) return res.status(403).json({ error: 'owner only' })
            const result = await eval(code)
            res.json({ ok: true, result: typeof result === 'string' ? result : require('util').inspect(result) })
        } catch (e) {
            res.status(500).json({ error: e.message })
        }
    })

    app.post('/api/toggle', (req, res) => {
        const { key, value } = req.body || {}
        const map = {
            chatbot: () => { global.chatbot = !!value; state.chatbot = global.chatbot; try { fs.writeFileSync('./database/chatbot.json', JSON.stringify({ enabled: global.chatbot })) } catch(_){} },
            autoread: () => { global.autoread = !!value; state.autoread = global.autoread },
            autoswview: () => { global.autoswview = !!value; state.autoswview = global.autoswview },
            autoTyping: () => { global.autoTyping = !!value; state.autoTyping = global.autoTyping },
            autoRecording: () => { global.autoRecording = !!value; state.autoRecording = global.autoRecording },
            autobio: () => { global.autobio = !!value; state.autobio = global.autobio },
            public: () => { sock.public = !!value; state.public = sock.public },
            aiProvider: () => { if (['simsimi','gpt','fallback'].includes(value)) { global.aiProvider = value; state.aiProvider = value } }
        }
        if (!map[key]) return res.status(400).json({ error: 'unknown key' })
        map[key]()
        pushLog(`⚙️ ${key} → ${value}`)
        res.json({ ok: true, [key]: value })
    })

    app.post('/api/restart', (req, res) => {
        if (!isOwner(req)) return res.status(403).json({ error: 'owner only' })
        pushLog('🔄 Restart requested from dashboard')
        res.json({ ok: true })
        setTimeout(() => process.send && process.send('reset'), 500)
    })

    app.post('/api/shutdown', (req, res) => {
        if (!isOwner(req)) return res.status(403).json({ error: 'owner only' })
        pushLog('⛔ Shutdown requested from dashboard')
        res.json({ ok: true })
        setTimeout(() => process.exit(0), 500)
    })

    // ---- SSE for live updates ----
    app.get('/api/stream', (req, res) => {
        res.set({
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            Connection: 'keep-alive',
            'X-Accel-Buffering': 'no'
        })
        res.flushHeaders && res.flushHeaders()
        res.write(`event: hello\ndata: ${JSON.stringify({ time: Date.now() })}\n\n`)
        sseClients.add(res)
        const ping = setInterval(() => {
            try { res.write(`event: ping\ndata: ${Date.now()}\n\n`) } catch (_) {}
        }, 15000)
        req.on('close', () => { clearInterval(ping); sseClients.delete(res) })
    })

    function isOwner(req) {
        const tok = (req.headers['x-owner-token'] || '').toString()
        return tok && tok === String(global.ownernumber || '')
    }

    const server = http.createServer(app)
    server.on('error', (e) => {
        if (e.code === 'EADDRINUSE') {
            // Another instance is already serving; don't crash the bot
            console.log('⚠️ Dashboard port', PORT, 'in use — assuming another instance is serving it.')
            return
        }
        console.log('Dashboard error:', e.message)
    })
    try {
        server.listen(PORT, '0.0.0.0', () => {
            const url = `http://localhost:${PORT}`
            console.log('\n╔══════════════════════════════════════════════╗')
            console.log(`║  ⚡ ALPHA DASHBOARD                           ║`)
            console.log(`║  Open: ${url.padEnd(38)}║`)
            console.log('╚══════════════════════════════════════════════╝\n')
        })
    } catch (_) {}
    startDashboard._server = server
    startDashboard._app = app
    startDashboard._state = state

    return app
}

module.exports = { startDashboard }
