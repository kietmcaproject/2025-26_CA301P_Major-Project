const express = require('express');
const router = express.Router();

const { TeacherRegisterUser,
    getUsers,
    StudentRegistrationUser,
    getStudentUser,
    checkLoginDetail
} = require('../controller/registrationController');

// Register a new user
router.post('/registerteacher', TeacherRegisterUser);
router.post('/registerstudent', StudentRegistrationUser);
router.post('/logindetail',checkLoginDetail);


// Get all teacher data
router.get('/teachers', getUsers);

//Get all student data
router.get('/students',getStudentUser);

module.exports = router;
