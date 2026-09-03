//base by Tech-God
//re-coded & customized by Mason (Alpha Bot)
//YouTube: @techgod143 (base) | re-customized as Alpha by Mason
//WhatsApp: Contact Mason
const fs = require('fs')
const chalk = require('chalk')

//contact details
global.ownernomer = "910000000000"
global.ownername = "👑 Mason"
global.ytname = "YT: Alpha-Mason"
global.socialm = "GitHub: mason"
global.location = "Alpha HQ"

global.ownernumber = '910000000000'
global.ownername = '👑 Mason'
global.botname = 'ᴬᴸᴾᴴᴬ-ᴮᵞ ᴹᴬˢᴼᴺ'

//sticker details
global.packname = 'Alpha By Mason'
global.author = 'Alpha By Mason\n\nContact Mason'

//console view/theme
global.themeemoji = '⚡'
global.wm = "ᴬᴸᴾᴴᴬ ᴮᵞ ᴹᴬˢᴼᴺ."

//theme link
global.link = 'https://whatsapp.com/channel/0029Va9Ufzi8kyyEnEHvOm1h'

//custom prefix
global.prefa = ['','!','.','#','&','/','α','/menu']

//false=disable and true=enable
global.autoRecording = false
global.autoTyping = false
global.autorecordtype = true
global.autoread = false
global.autobio = true
global.anti92 = false
global.autoswview = true

//AI chat bot (LLM) — true = auto-reply to non-command DMs
global.chatbot = false
//AI provider to use: "simsimi" | "gpt" | "fallback"
global.aiProvider = 'simsimi'
//Bot persona for the chatbot
global.aiName = 'Alpha'
global.aiPersona = `You are Alpha, a friendly and witty WhatsApp bot made by Mason. Keep replies short, casual and fun. Use emojis sometimes.`

//menu type (v1=image, v2=video+image, v3=video, v4=call end)
global.typemenu = 'v2'

//text bug
global.xbugtex = {
xtxt: '⚡ᴬᴸᴾᴴᴬ-ᴹᴬˢᴼᴺ⚡',
}
global.bimg = 'https://i.ibb.co/5hYWrRH/thumb.png'

//reply messages
global.mess = {
    done: '✅ Done !',
    prem: '⚠️ This feature can be used by Mason (Owner) or premium users only',
    admin: '⚠️ This feature can be used by Mason (Owner) or group admins only',
    botAdmin: '⚠️ This feature can only be used when the bot is a group admin',
    owner: '⚠️ This feature can be used by Mason (Owner) only',
    group: '⚠️ This feature is only for groups',
    private: '⚠️ This feature is only for private chats',
    wait: '⏳ In process...',
    error: '❌ Error!',
    game: '🎮',
}

global.thumb = fs.readFileSync('./XeonMedia/thumb.jpg')

let file = require.resolve(__filename)
fs.watchFile(file, () => {
    fs.unwatchFile(file)
    console.log(chalk.redBright(`Update'${__filename}'`))
    delete require.cache[file]
    require(file)
})