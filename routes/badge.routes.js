const Router = require('express')
const router = new Router()

const badgeController = require('../controllers/badge.controller')

router.post('/create-badge', badgeController.createBadge)
router.post('/create-image/:badge_id', badgeController.createBadgeImage)
router.post('/assign-badge', badgeController.assignBadge)
router.get('/get-badges-by-creator/:user_id', badgeController.getBadgesByCreator)
router.get('/get-badges-by-backer/:user_id', badgeController.getBadgesByBacker)

module.exports = router