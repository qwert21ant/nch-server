const TelegramAPI = require("node-telegram-bot-api")

const token = '5489875595:AAEbz5hsAz__nlT7lK7QEm2xys6rN-pJUt4'

const bot = new TelegramAPI(token,{polling:true})

module.exports = bot