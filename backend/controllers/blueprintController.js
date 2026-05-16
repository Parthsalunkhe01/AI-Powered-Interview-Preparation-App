const Blueprint = require("../models/InterviewBlueprint");

exports.createBlueprint = async (req, res) => {
    try {
        // Check if blueprint already exists for this user
        const existing = await Blueprint.findOne({ user: req.user.id });
        if (existing) {
            return res.status(400).json({ message: "Blueprint already exists. Use PUT to update it." });
        }

        const blueprint = await Blueprint.create({
            user: req.user.id,
            ...req.body
        });

        // Link to user (non-critical — blueprint still works without it)
        const User = require("../models/User");
        await User.findByIdAndUpdate(req.user.id, { interviewBlueprint: blueprint._id }).catch(e => {
            console.warn("[Blueprint] Failed to link blueprint to user:", e.message);
        });

        res.status(201).json(blueprint);
    } catch (err) {
        console.error("[Blueprint] Create error:", err.message);
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