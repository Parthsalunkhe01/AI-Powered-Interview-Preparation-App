const Blueprint = require("../models/InterviewBlueprint");

exports.createBlueprint = async (req,res)=>{
    try{
        const blueprint = await Blueprint.create({
            user: req.user.id,
            
            ...req.body
        });
        console.log("User from token:", req.user);
        res.status(201).json(blueprint);
    }catch(err){
        console.log(err);
        res.status(500).json({message:"Failed to create blueprint"});
    }
};

exports.getBlueprint = async (req,res)=>{
    try{
        const blueprint = await Blueprint.findOne({user:req.user.id});

        res.json(blueprint);
    }catch(err){
        res.status(500).json({message:"Error fetching blueprint"});
    }
};

exports.updateBlueprint = async (req,res)=>{
    try{
        const blueprint = await Blueprint.findOneAndUpdate(
            {user:req.user.id},
            req.body,
            {new:true}
        );

        res.json(blueprint);
    }catch(err){
        res.status(500).json({message:"Update failed"});
    }
};

exports.deleteBlueprint = async (req,res)=>{
    try{
        await Blueprint.findOneAndDelete({user:req.user.id});
        res.json({message:"Blueprint deleted"});
    }catch(err){
        res.status(500).json({message:"Delete failed"});
    }
};