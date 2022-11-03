const express = require('express')
const cors = require('cors')

const dotenv = require('dotenv')
dotenv.config()

const userRouter = require('./routes/task.routes')

if(process.env.BOT_STATUS == "on") {
    require('./tgbot/bot');
    console.log("Bot enable");
    if(process.env.BOT_API_URL)
        console.log("Bot API URL: " + process.env.BOT_API_URL);
}

const HOST = process.env.HOST
const PORT = process.env.PORT

const app = express()

app.use(cors())
app.use(express.json())
app.use('/api', userRouter)

app.listen(PORT, HOST, () => {
    console.log(`Server listens http://${HOST}:${PORT}`)
})