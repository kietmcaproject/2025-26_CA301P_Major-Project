const mongoose = require('mongoose');

const TeacherRegistrationSchema = new mongoose.Schema({
    firstName: {
        type: String, 
        required: true,
    },
    lastName: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    subjectTeacher: {
        type: String,
    },
    phone: {
        type: Number,
        required: true,
        unique: true,
    }
}, { timestamps: true });

const TeacherRegistration= mongoose.model('TeacherRegistration', TeacherRegistrationSchema);

module.exports = TeacherRegistration;
