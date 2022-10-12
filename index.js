const express = require('express')
const cors = require('cors')

const dotenv = require('dotenv')
dotenv.config()

const userRouter = require('./routes/task.routes')
const adminBot = require('./tgbot/bot')
const logBot = require('./tgbot/logBot')

const HOST = process.env.HOST
const PORT = process.env.PORT

const app = express()

app.use(cors())
app.use(express.json())
app.use('/api',userRouter)

app.listen(PORT, HOST, () => {
    console.log(`Server listens http://${HOST}:${PORT}`)
})