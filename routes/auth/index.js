var express = require('express'),
    router = express.Router();


router.post('/login', function(){
    console.log('logged')
})

 
module.exports = router