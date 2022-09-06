const TelegramAPI = require("node-telegram-bot-api")
const userController = require("../controller/user.controller")
const adminId = [792006690, 1123840846]

const token = '5551117206:AAHg4QiVwBKba8Vy0-BC6CNwQrJhRwtWbYY'

let telegramState = {"792006690": "", "1123840846": ""}

const bot = new TelegramAPI(token, {polling:true})

bot.setMyCommands([
    {command: 'getallusers', description: 'Список пользователей'},
    {command: 'getuserid', description: 'Получить id пользователя по имени'},
    {command: 'deleteuser', description: 'Удалить пользователя по имени'},
    {command: 'adduser', description: 'Добавить пользователя'},
//    {command: 'getuser', description: 'Конфигурация пользователя'}
]);

bot.on('message', async msg => {
    const chatId = msg.chat.id;
    const text = msg.text;
    const state = telegramState[String(chatId)];

    if(adminId.includes(chatId)){
        if(state === ""){
            if(text === "/getallusers"){
                userController.getAllUsers()
                .then(users => {
                    let inline_keyboard = [];
                    users.forEach(user => 
                        inline_keyboard.push([{text: "" + user.name, callback_data: user.name + ":user:"}])
                    );
                    bot.sendMessage(chatId, "Список пользователей:", {
                        reply_markup: JSON.stringify({inline_keyboard: inline_keyboard})
                    });
                });

            }else if(text === "/getuserid"){
                await bot.sendMessage(chatId, "name или 'stop'")
                telegramState[String(chatId)] = "getUserId";

            }else if(text === "/deleteuser"){
                await bot.sendMessage(chatId, "name или 'stop'")
                telegramState[String(chatId)] = "deleteUser";

            }else if(text === "/adduser"){
                await bot.sendMessage(chatId, "name ip key fingerprint или 'stop'")
                telegramState[String(chatId)] = "addUser";
            }else if(text === "/start"){
                bot.sendMessage(chatId, "Дарова уёба");
            }

        }else if(text === "stop"){
            telegramState[String(chatId)] = "";
            if(['ip', 'key', 'fingerprint'].includes(state.split(":")[1])){
                const user = state.split(":")[0];
                const param = state.split(":")[1];
                const message_id = state.split(":")[2];
                bot.deleteMessage(chatId, msg.message_id);
                let info = await userController.getUserInfo(user, param);
                bot.editMessageText(`Пользователь ${user}:` + "\n" + 
                    `${param}: <code>${info}</code>`, {
                    chat_id: chatId,
                    message_id: message_id,
                    reply_markup: JSON.stringify({
                        inline_keyboard: [
                            [{text: "Изменить", callback_data: user + ":change:" + param}],
                            [{text: "<< Вернуться к параметрам", callback_data: user + ":user:"}]
                        ]
                    }),
                    parse_mode: "HTML"
                });
            } else
                return bot.sendMessage(chatId, "Отправьте другую команду")

        }else if(state === "getUserId"){
            telegramState[String(chatId)] = "";
            userController.getUserId(text)
                .then(ret => bot.sendMessage(chatId,ret))

        }else if(state === "deleteUser"){
            telegramState[String(chatId)] = "";
            userController.deleteUser(text)
                .then(ret => bot.sendMessage(chatId, ret));

        }else if(state === "addUser"){
            telegramState[String(chatId)] = "";
            const data = text.split(" ");
            if(data.length != 4) bot.sendMessage(chatId, "Неверный формат");
            userController.addUser(data[0], data[1], data[2], data[3])
                .then(ret => bot.sendMessage(chatId,ret))

        }else if(['ip', 'key', 'fingerprint'].includes(state.split(":")[1])){
            const user = state.split(":")[0];
            const param = state.split(":")[1];
            const message_id = state.split(":")[2];
            await userController.changeUserInfo(user, param, text);
            console.log(msg);
            bot.deleteMessage(chatId, msg.message_id);
            telegramState[String(chatId)] = "";

            let info = await userController.getUserInfo(user, param);
            bot.editMessageText(`Пользователь ${user}:` + "\n" + 
                `${param}: <code>${info}</code>`, {
                chat_id: chatId,
                message_id: message_id,
                reply_markup: JSON.stringify({
                    inline_keyboard: [
                        [{text: "Изменить", callback_data: user + ":change:" + param}],
                        [{text: "<< Вернуться к параметрам", callback_data: user + ":user:"}]
                    ]
                }),
                parse_mode: "HTML"
            });
        }
    } else {
        console.log(msg)
        await bot.sendMessage(adminId[0], `user ${msg.from.id}`)
        return bot.sendMessage(chatId, "Бот ещё не готов, ожидайте...")
    }
});

bot.on("callback_query", async msg => {
    const chatId = msg.message.chat.id;
    const message_id = msg.message.message_id;
    const data = msg.data.split(':');
    const user = data[0];
    const operation = data[1];
    const param = data[2];

    if(operation == "user"){
        bot.editMessageText(`Пользователь ${user}:`, {
            chat_id: chatId,
            message_id: message_id,
            reply_markup: JSON.stringify({
                inline_keyboard: [
                    [
                        {text: "IP", callback_data: user + ":show:ip"},
                        {text: "Key", callback_data: user + ":show:key"}
                    ],
                    [{text: "Fingerprint", callback_data: user + ":show:fingerprint"}],
                    [{text: "<< Вернуться к списку", callback_data: user + ":back:"}]
                ]
            })
        });
    }else if(operation == "back"){
        userController.getAllUsers()
        .then(users => {
            let inline_keyboard = [];
            users.forEach(user => 
                inline_keyboard.push([{text: "" + user.name, callback_data: user.name + ":user:"}])
            );
            bot.editMessageText("Список пользователей:", {
                chat_id: chatId, message_id: message_id,
                reply_markup: JSON.stringify({inline_keyboard: inline_keyboard})
            });
        });
    }else if(operation == "show"){
        let info = await userController.getUserInfo(user, param);
        bot.editMessageText(`Пользователь ${user}:` + "\n" + 
            `${param}: <code>${info}</code>`, {
            chat_id: chatId,
            message_id: message_id,
            reply_markup: JSON.stringify({
                inline_keyboard: [
                    [{text: "Изменить", callback_data: user + ":change:" + param}],
                    [{text: "<< Вернуться к параметрам", callback_data: user + ":user:"}]
                ]
            }),
            parse_mode: "HTML"
        });
    }else if(operation == "change"){
        telegramState["" + chatId] = user + ":" + param + ":" + message_id;
        bot.editMessageText("Введите новый " + param + " или 'stop'", {
            chat_id: chatId,
            message_id: message_id
        });
    }
});

module.exports = bot