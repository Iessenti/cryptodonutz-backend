const express = require('express')
const app = express()
const fileupload = require("express-fileupload");

const userRouter = require('./routes/user.routes')
const badgeRouter = require('./routes/badge.routes')

const cors = require('cors')

app.use(cors())
app.use(fileupload())
app.use(express.json())
app.use('/api/user', userRouter)
app.use('/api/badge/', badgeRouter)
app.use(express.static(__dirname + '/images'))

async function start() {
	try {
		app.listen(5001, () => console.log(`App has been started on port ${5001}...`))
	} catch(e) {
		console.log('Server error', e.message)
		process.exit(1)
	}
}

start() 