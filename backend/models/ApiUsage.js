const mongoose = require("mongoose");

/**
 * ApiUsage — tracks daily external API call counts.
 * Used by budgetGuard to enforce graceful degradation.
 */
const ApiUsageSchema = new mongoose.Schema(
    {
        date:         { type: String, index: true, unique: true }, // "YYYY-MM-DD"
        groqCalls:    { type: Number, default: 0 },
        groqTokens:   { type: Number, default: 0 },
        youtubeCalls: { type: Number, default: 0 },
        serperCalls:  { type: Number, default: 0 },
    },
    { timestamps: true }
);

module.exports = mongoose.model("ApiUsage", ApiUsageSchema);
