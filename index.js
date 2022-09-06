const express = require('express')
const cors = require('cors')
const userRouter = require('./routes/task.routes')
const Fingerprint = require("express-fingerprint")
const adminBot = require("./tgbot/bot")
const logBot = require("./tgbot/logBot")

const HOST = process.argv[2] ? process.argv[2] : '93.114.128.246'
const PORT = process.argv[3] ? process.argv[3] : 8080

const app = express()

app.use(Fingerprint())
app.use(cors())
app.use(express.json())
app.use('/api',userRouter)

app.listen(PORT, HOST, () => {
    console.log(`Server listens http://${HOST}:${PORT}`)
})