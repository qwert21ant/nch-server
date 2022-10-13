const Time = require("./serverTime")

const UTC = process.env.DEFAULT_UTC;

var bot = null;
if(process.env.BOT_STATUS == "on") bot = require("./tgbot/logBot");

const admins = JSON.parse(process.env.BOT_ADMINS);

class Log{
    async log(message){
        console.log(Time.logTime(UTC) + " " + message);
        if(bot) admins.forEach(x => bot.sendMessage(x, Time.logTime(UTC) + " " + message));
    }
}

module.exports = new Log()