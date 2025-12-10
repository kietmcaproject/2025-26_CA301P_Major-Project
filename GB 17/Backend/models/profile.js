const mongoose = require('mongoose')

const ProfileSchema = mongoose.Schema({
    name:{type:String},
    email:{type:String, required:true,unique:true},
    username:{type:String},
    dob:{type:Date},
    gender:{type:String},
    college:{type:String},
    country:{type:String},
    bio:{type:String},
    image:{type:String},
    problemSolved:{type:String},
    linkedIn:{type:String},
    github:{type:String},
})

module.exports = mongoose.model('Profile',ProfileSchema);