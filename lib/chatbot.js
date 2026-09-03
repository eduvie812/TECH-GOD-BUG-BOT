// AI Chat Bot module for Alpha by Mason
// Uses free public APIs with multiple fallbacks.
const axios = require('axios')

const timeout = 20000

async function trySimSimi(prompt) {
    try {
        const url = `https://api.simsimi.vn/v1/simsimi?text=${encodeURIComponent(prompt)}&lang=en`
        const { data } = await axios.get(url, { timeout, headers: { 'User-Agent': 'Mozilla/5.0' } })
        if (data && (data.message || data.success === 'true' || data.success === true)) {
            const reply = data.message || data.response || data.answer
            if (reply && typeof reply === 'string' && reply.trim().length > 0) return reply.trim()
        }
        if (data && data.error) throw new Error(data.error)
        throw new Error('Empty SimSimi reply')
    } catch (e) {
        throw e
    }
}

async function tryGPTFree(prompt, system) {
    // Free public GPT-3.5 endpoint (no key). Try a couple of mirrors.
    const endpoints = [
        {
            url: 'https://api.chatanywhere.org/v1/chat/completions',
            body: {
                model: 'gpt-3.5-turbo',
                messages: [
                    { role: 'system', content: system || 'You are a helpful assistant.' },
                    { role: 'user', content: prompt }
                ],
                max_tokens: 400,
                temperature: 0.8
            },
            headers: { 'Content-Type': 'application/json' }
        },
        {
            url: 'https://api.gptgod.online/v1/chat/completions',
            body: {
                model: 'gpt-3.5-turbo',
                messages: [
                    { role: 'system', content: system || 'You are a helpful assistant.' },
                    { role: 'user', content: prompt }
                ]
            },
            headers: { 'Content-Type': 'application/json' }
        }
    ]
    let lastErr
    for (const ep of endpoints) {
        try {
            const { data } = await axios.post(ep.url, ep.body, { timeout, headers: ep.headers })
            const reply = data?.choices?.[0]?.message?.content
            if (reply && reply.trim()) return reply.trim()
        } catch (e) { lastErr = e }
    }
    throw lastErr || new Error('GPT endpoints failed')
}

// Built-in fallback: pattern-based smart replies so the chatbot always works
// even if every external API is down.
function fallbackReply(prompt) {
    const p = (prompt || '').toLowerCase().trim()
    if (!p) return "Hey! Say something and I'll reply 😄"

    // Greetings
    if (/\b(hi|hello|hey|hola|yo|sup|hiya|good\s*(morning|evening|afternoon))\b/.test(p)) {
        const g = ['Hello! 👋 How can I help you today?',
                   'Hey there! 😊 What\'s up?',
                   'Hi! Alpha at your service 🤖✨',
                   'Yo! What can Alpha do for you?']
        return g[Math.floor(Math.random() * g.length)]
    }
    // How are you
    if (/how (are|r) (you|u)/.test(p) || /how('?| i)s it going/.test(p)) {
        return "I'm doing great, thanks for asking! 🤖💙 How about you?"
    }
    // Name / who made you
    if (/(who (made|created|built) you|who is your (creator|owner|developer|maker))/i.test(prompt)) {
        return "I am Alpha, made by Mason ⚡ — a WhatsApp bot for chatting, games and tools."
    }
    if (/(your name|who are you|what are you)/i.test(prompt)) {
        return "I'm Alpha by Mason ⚡ — your friendly WhatsApp chatbot 🤖"
    }
    // Help
    if (/^(help|\?|\.\.\.)$/i.test(prompt)) {
        return "Type *!menu* to see all my commands, or just chat with me — I reply to anything 😄"
    }
    // Thanks
    if (/(thanks|thank you|thx|ty)/.test(p)) {
        return "You're welcome! 😊 Anything else?"
    }
    // Bye
    if (/(bye|goodbye|see ya|cya)/.test(p)) {
        return "Bye! 👋 Come back soon ✨"
    }
    // Love
    if (/(i love you|love you|ily)/.test(p)) {
        return "Aww 💖 that's sweet! (Don't tell Mason 😏)"
    }
    // Bot?
    if (/(are you (a )?bot|you('?| i) a bot|bot\?)/.test(p)) {
        return "Yep, I'm a bot — Alpha by Mason ⚡ But I try my best to be fun!"
    }
    // Age
    if (/how old are you|your age/.test(p)) {
        return "I'm as old as the last Heroku deploy ⏳😄"
    }
    // Joke request
    if (/(tell me a joke|make me laugh|joke please)/.test(p)) {
        return "Why did the developer go broke? Because he used up all his cache! 💸😄"
    }
    // Math
    const m = prompt.match(/^(-?\d+)\s*([+\-*/x])\s*(-?\d+)\s*=?\s*$/)
    if (m) {
        const a = parseFloat(m[1]); const b = parseFloat(m[3]); const op = m[2]
        let r
        if (op === '+') r = a + b
        else if (op === '-') r = a - b
        else if (op === '*' || op === 'x') r = a * b
        else if (op === '/') r = b === 0 ? '∞' : a / b
        return `🧮 ${a} ${op} ${b} = *${r}*`
    }
    // Question
    if (/\?$/.test(prompt)) {
        const replies = [
            "Hmm, good question! 🤔 I'd say yes, but ask Mason to be sure.",
            "Maybe? I am just a bot after all 🤖",
            "Yes, definitely! 💯",
            "No way 😅",
            "It depends on the WiFi signal 📶"
        ]
        return replies[Math.floor(Math.random() * replies.length)]
    }
    // Default
    const defaults = [
        "Interesting! Tell me more 👀",
        "Got it! Anything else? 😄",
        "Hmm, I hear you. What do you want to do next?",
        "Nice 😎 Type *!menu* to see what I can do.",
        "Roger that 🤖⚡"
    ]
    return defaults[Math.floor(Math.random() * defaults.length)]
}

async function chatWithAI(prompt, opts = {}) {
    const provider = (opts.provider || global.aiProvider || 'simsimi').toLowerCase()
    const system = opts.system || global.aiPersona || ''

    if (provider === 'gpt') {
        try { return await tryGPTFree(prompt, system) } catch (e) { /* fall through */ }
        try { return await trySimSimi(prompt) } catch (e) { /* fall through */ }
        return fallbackReply(prompt)
    }
    if (provider === 'fallback') return fallbackReply(prompt)

    // Default: simsimi first, then gpt, then fallback
    try { return await trySimSimi(prompt) } catch (e) { /* fall through */ }
    try { return await tryGPTFree(prompt, system) } catch (e) { /* fall through */ }
    return fallbackReply(prompt)
}

module.exports = { chatWithAI, fallbackReply }
