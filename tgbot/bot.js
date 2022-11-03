const ManageBot = require("./ManageBot.js");

const token = process.env.BOT_TOKEN;
const adminId = JSON.parse(process.env.BOT_ADMINS);
const apiUrl = process.env.BOT_API_URL ? process.env.BOT_API_URL : "https://api.telegram.org";

bot = new ManageBot(token, adminId, apiUrl);

module.exports = bot;