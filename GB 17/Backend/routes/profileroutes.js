const express = require('express')
const router = express.Router()
const {UpdateProfileData,GetProfileData,CreateProfileData,GetSubmissions} = require('../controller/profile')

router.get('/profile/:email',GetProfileData)
router.put('/update/profile/:email',UpdateProfileData)
router.get('/submissions/:email',GetSubmissions)

module.exports = router;