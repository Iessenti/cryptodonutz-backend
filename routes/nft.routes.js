const Router = require('express')
const router = new Router()

const nftController = require('../controllers/nft.controller')

router.post('/create', nftController.createNft)
router.post('/create/image/:nft_id', nftController.createNftImage)
router.get('/list/:username', nftController.getNft)

module.exports = router