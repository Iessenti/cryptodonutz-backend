const express = require('express')
const app = express()
const fileupload = require("express-fileupload")
path = require('path')
  
const userRouter = require('./routes/user.routes')
const badgeRouter = require('./routes/badge.routes')
const donationRouter = require('./routes/donation.routes')
const nftRouter = require('./routes/nft.routes')

const cors = require('cors')

app.use(cors())
app.use(fileupload())
app.use(express.json())
app.use(express.static(__dirname + '/images'))
app.use(express.static(path.resolve(__dirname, '../client/build')))
app.use('/api/user/', userRouter)
app.use('/api/badge/', badgeRouter)
app.use('/api/donation/', donationRouter)
app.use('/api/nft/', nftRouter)

async function start() {
	try {
		app.listen(8080, () => console.log(`App has been started on port ${8080}...`))
	} catch(e) {
		console.log('Server error', e.message)
		process.exit(1)
	}
}

start() 