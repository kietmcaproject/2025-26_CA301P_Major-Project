const express = require('express')
const router = express.Router();
const { signUp,login,logout } = require('../controller/authentication')

router.post('/signup', signUp);
router.post('/login',login);
router.post('/logout',logout)



module.exports = router;