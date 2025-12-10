const mongoose = require('mongoose')
const codeSubmitSchema = mongoose.Schema({
    problemId:{type:String, required:true},
    userId:{type:String, required:true},
    language:{type:String,required:true},
    code:{type:String, required:true},
    status:{type:String, required:true},
},{timestamps:true})

module.exports = mongoose.model('codeSubmit',codeSubmitSchema);