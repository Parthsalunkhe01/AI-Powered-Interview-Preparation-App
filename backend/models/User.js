const mongoose = require("mongoose")

const USerSchema = new mongoose.Schema(
    {
        name : { type: String, required: true},
        email: { type: String, require: true, unique: true},
        password: { type: String, required: true},
        profileImageUrl: { type: String, default: null},
    },
    { timestamps: true }
);

module.exports = mongoose.model("User",USerSchema);