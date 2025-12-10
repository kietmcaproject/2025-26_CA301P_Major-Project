const mongoose = require('mongoose')

const signup = mongoose.Schema({
    name:{type:String, required:true},
    email:{type:String, required:true, unique:true},
    password:{type:String, required:true},
    agreeToTerms:{type:Boolean, required:true},
    subscribeNewsletter:{type:Boolean,required:true}
});

module.exports = mongoose.model('signup',signup);