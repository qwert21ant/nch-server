const TelegramAPI = require("node-telegram-bot-api")

const token = process.env.BOT_LOG_TOKEN

const bot = new TelegramAPI(token, {
	polling: true,
    baseApiUrl: process.env.BOT_API_URL ? process.env.BOT_API_URL : "https://api.telegram.org"
})

module.exports = bot