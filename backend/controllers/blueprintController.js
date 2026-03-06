const Blueprint = require("../models/InterviewBlueprint");

exports.createBlueprint = async (req, res) => {
    const session = await Blueprint.startSession();
    session.startTransaction();
    try {
        const blueprint = await Blueprint.create([{
            user: req.user.id,
            ...req.body
        }], { session });

        // Link to user
        const User = require("../models/User");
        await User.findByIdAndUpdate(req.user.id, {
            interviewBlueprint: blueprint[0]._id
        }, { session });

        await session.commitTransaction();
        session.endSession();

        res.status(201).json(blueprint[0]);
    } catch (err) {
        await session.abortTransaction();
        session.endSession();
        console.log(err);
        res.status(500).json({ message: "Failed to create blueprint", error: err.message });
    }
};

exports.getBlueprint = async (req, res) => {
    try {
        const blueprint = await Blueprint.findOne({ user: req.user.id });

        res.json(blueprint);
    } catch (err) {
        res.status(500).json({ message: "Error fetching blueprint" });
    }
};

exports.updateBlueprint = async (req, res) => {
    try {
        const blueprint = await Blueprint.findOneAndUpdate(
            { user: req.user.id },
            req.body,
            { new: true }
        );

        res.json(blueprint);
    } catch (err) {
        res.status(500).json({ message: "Update failed" });
    }
};

exports.deleteBlueprint = async (req, res) => {
    try {
        await Blueprint.findOneAndDelete({ user: req.user.id });
        res.json({ message: "Blueprint deleted" });
    } catch (err) {
        res.status(500).json({ message: "Delete failed" });
    }
};