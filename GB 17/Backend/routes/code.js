const express = require('express')
const router = express.Router()
const  runCode  = require('../controller/coderun')
const submitCode = require('../controller/codeSubmit')

 
router.post("/run", runCode);
router.post("/submit/code",submitCode);
module.exports = router;