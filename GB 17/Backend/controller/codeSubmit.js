const mongoose = require('mongoose')
const codeSubmitSchema = require('../models/codeSubmitSchema')

const codeSubmit = async (req,res)=>{
    try{
        const {problemId,userId,code,language, status} = req.body;
        if(!problemId || !userId || !code || !language){
            return res.status(400).json({message:"All the fields are required"})
        }
        const submitData = await codeSubmitSchema.create({
            problemId,
            userId,
            code,
            language,
            status,
        })

        submitData.save();
        return res.status(200).json({message:"Code submitted successfully"})

    }catch(e){
        console.log(e)
        return res.status(500).json({message:e.message})
    }
}


const getSubmittedCode = async (req,res)=>{
    try{
        const {userId} = req.body;
        if(!userId){
            return res.status(400).json({meassage:"Please provide userId"})
        }

        const submittedCode = await codeSubmitSchema.find({userId:userId});
        return res.status(200).json({submittedData:submittedCode})

    }catch(e){
        console.log(e);
        return res.status(500).json({message:e.meassage});
    }
}

module.exports = codeSubmit;