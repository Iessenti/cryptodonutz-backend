const Router = require('express')
const router = new Router()

const badgeController = require('../controllers/badge.controller')

router.post('/create-badge', badgeController.createBadge)
router.post('/assign-badge', badgeController.assignBadge)
router.get('/get-badges-by-creator/:id', badgeController.getBadgesByCreator)
router.get('/get-badges-by-backer/:id', badgeController.getBadgesByBacker)

module.exports = router