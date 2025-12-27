const mongoose = require('mongoose');

const StudentRegistrationSchema = new mongoose.Schema({
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

const StudentRegistration= mongoose.model('StudentRegistration', StudentRegistrationSchema);

module.exports = StudentRegistration;
