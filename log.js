const bot = require("./tgbot/logBot");
const Time = require("./serverTime")
const UTC = process.env.DEFAULT_UTC;

class Log{
    async log(message){
        console.log(Time.logTime(UTC) + " " + message);
        await bot.sendMessage(792006690, Time.logTime(UTC) + " " + message)
        await bot.sendMessage(1123840846, Time.logTime(UTC) + " " + message)
    }
}

module.exports = new Log()