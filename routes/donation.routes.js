const Router = require('express')
const router = new Router()

const donationController = require('../controllers/donation.controller')

router.post('/create', donationController.createDonation)
router.get('/supporters/:user_id', donationController.getSupporters)

module.exports = router