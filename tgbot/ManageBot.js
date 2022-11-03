const TelegramAPI = require("node-telegram-bot-api");
const userController = require("../controller/user.controller");
const Log = require("../log.js");

function PackData(user, oper, param) {
    return JSON.stringify({
        user: user || "",
        oper: oper || "",
        param: param || ""
    });
}

function UsersKeyboard(users) {
    let keyboard = [];
    let line = [];

    users.forEach((user, ind) => {
        if (ind % 2 == 0)
            line = [{text: user, callback_data: PackData(user, "user")}];
        else {
            line.push({text: user, callback_data: PackData(user, "user")});
            keyboard.push(line);
        }
    });

    if (users.length % 2 == 1)
        keyboard.push(line);

    return keyboard;
}

class ManageBot {
    constructor(token, adminId, apiUrl) {
        this.token = token;
        this.adminId = adminId;

        this.userParams = ["key"];

        this.userState = {};
        this.adminId.forEach(key => this.userState[key] = {
            command: "",
            user: "",
            param: "",
            msgId: 0,
            optional: ""
        });

        this.bot = new TelegramAPI(this.token, {
            polling: true,
            baseApiUrl: apiUrl
        });

        this.botCommands = {
            "getallusers": {
                description: "Список пользователей",
                handler: msg => {
                    this.ShowUserList(msg.chat.id);
                }
            },
            "adduser": {
                description: "Добавить пользователя",
                handler: msg => {
                    this.bot.sendMessage(msg.chat.id, "Введите: *имя* *ключ* или /abort")
                    this.userState[msg.chat.id].command = "adduser";
                }
            },
            "deleteuser": {
                description: "Удалить пользователя",
                handler: msg => {
                    this.bot.sendMessage(msg.chat.id, "Введите: *имя* или /abort")
                    this.userState[msg.chat.id].command = "deleteuser";
                }
            },
            "abort": {
                description: "Отменить",
                handler: msg => {
                    this.bot.sendMessage(msg.chat.id, "Отправьте другую команду");
                    this.userState[msg.chat.id].command = "";
                }
            }
        };

        this.bot.setMyCommands(
            Object.keys(this.botCommands).map(elem =>
                Object.assign({
                    command: elem,
                    description: this.botCommands[elem].description
                })
            )
        );

        this.bot.on("message", async msg => {
            const chatId = msg.chat.id;

            if (!adminId.includes(chatId)) {
                Log(`Unknown user: ${msg.from.username} (${chatId})`);
                return;
            }

            if (msg.text[0] == "/") {
                const command = msg.text.substr(1);

                this.userState[chatId].command = "";

                if (!this.botCommands[command]) {
                    await bot.sendMessage(chatId, "Неверная команда");
                    return;
                }

                this.botCommands[command].handler(msg);
            } else
                this.handleMessage(msg);
        });

        this.bot.on("callback_query", async msg => {
            const chatId = msg.message.chat.id;
            const msgId = msg.message.message_id;

            const data = JSON.parse(msg.data);

            switch (data.oper) {
                case "user": {
                    this.ShowUser(data.user, chatId, msgId);
                    break;
                };
                case "list": {
                    this.ShowUserList(chatId, msgId);
                    break;
                };
                case "param": {
                    const value = await userController.getUserInfo(data.user, data.param);
                    this.ShowUserParam(data.user, data.param, value, chatId, msgId);
                    break;
                };
                case "change": {
                    this.userState[chatId] = {
                        command: "changeparam",
                        user: data.user,
                        param: data.param,
                        msgId: msgId
                    };
                    this.SendOrEdit("Введите новый " + data.param + " или /abort", null, chatId, msgId);
                    break;
                };
            };
        });
    }

    SendOrEdit(text, keyboard, chatId, msgId) {
        const reply_markup = keyboard ? JSON.stringify({ inline_keyboard: keyboard }) : {};
        if (msgId)
            this.bot.editMessageText(text, {chat_id: chatId, message_id: msgId, reply_markup: reply_markup, parse_mode: "HTML"});
        else
            this.bot.sendMessage(chatId, text, {reply_markup: reply_markup, parse_mode: "HTML"});
    }

    ShowUserList(chatId, msgId) {
        userController.getAllUsers()
        .then(users => {
            this.SendOrEdit("Список пользователей:", UsersKeyboard(users), chatId, msgId)
        });
    }

    ShowUser(user, chatId, msgId) {
        this.SendOrEdit(`Пользователь <code>${user}</code>:`, [
            [
                { text: "Key", callback_data: PackData(user, "param", "key") }
            ],
            [{ text: "<< Вернуться к списку", callback_data: PackData(user, "list", "") }]
        ], chatId, msgId);
    }

    ShowUserParam(user, param, value, chatId, msgId) {
        this.SendOrEdit("Пользователь <code>" + user + "</code>:\n" + param + ": <code>" + value + "</code>", [
            [{ text: "Изменить", callback_data: PackData(user, "change", param) }],
            [{ text: "<< Вернуться к параметрам", callback_data: PackData(user, "user") }]
        ], chatId, msgId);
    }

    async handleMessage(msg) {
        const chatId = msg.chat.id;
        const msgId = msg.message_id;
        const text = msg.text;
        const state = this.userState[chatId];

        switch (state.command) {
            case "adduser": {
                const data = text.split(" ");
                if (data.length != 2) {
                    this.bot.sendMessage(chatId, "Неверный формат");
                    this.userState[chatId].command = "";
                    return;
                }

                userController.addUser(data[0], data[1])
                    .then(res => this.bot.sendMessage(chatId, res));
                break;
            };
            case "deleteuser": {
                userController.deleteUser(text)
                    .then(res => this.bot.sendMessage(chatId, res));
                break;
            };
            case "changeparam": {
                await userController.changeUserInfo(state.user, state.param, text);
                this.bot.deleteMessage(chatId, msgId);

                const value = await userController.getUserInfo(state.user, state.param);
                this.ShowUserParam(state.user, state.param, value, chatId, state.msgId); 
                break;
            };
        }

        this.userState[chatId].command = "";
    }
}

module.exports = ManageBot;