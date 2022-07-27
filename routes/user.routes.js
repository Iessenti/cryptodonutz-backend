const Router = require('express')
const router = new Router()

const userController = require('../controllers/user.controller')

router.post('/check-username', userController.checkUsername)
router.post('/check-user-exist', userController.checkUserExist)
router.post('/create-user', userController.createUser)
router.get('/users/:username', userController.getUsersByName)
router.get('/creators/:username/:id', userController.getCreatorByName)
router.get('/:tron_token', userController.getUser)
router.post('/user/edit', userController.editUser)
router.post('/user/edit-image/:tron_token', userController.editUserImage)
router.post('/user/edit-background/:tron_token', userController.editCreatorBackgroundImage)
router.post('/user/edit-description', userController.editCreatorDescription)
router.get('/get-person-info-supporters/:username', userController.getPersonInfoSupporters)
router.get('/get-person-info-nft/:username', userController.getPersonInfoNFT)
router.post('/follow', userController.follow)
router.get('/get-follows/:username', userController.getAllFollows)
router.get('/get-followers/:username', userController.getAllFollowers)
router.get('/get-transactions/:username', userController.getAllTransactions)

module.exports = router