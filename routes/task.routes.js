const Router = require('express')
const router = new Router()
const taskController = require('../controller/task.controller')

router.post('/task', taskController.processRequest)

module.exports = router