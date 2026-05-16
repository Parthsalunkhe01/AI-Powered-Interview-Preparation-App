const mongoose = require("mongoose");

/**
 * CachedContent — stores AI-generated outputs with TTL auto-expiry.
 * Covers: questions, guide content, feedback, resources.
 */
const CachedContentSchema = new mongoose.Schema(
    {
        cacheKey:  { type: String, unique: true, index: true },
        type:      { type: String, enum: ["question", "feedback", "guide", "resource"], default: "guide" },
        content:   { type: mongoose.Schema.Types.Mixed },
        hitCount:  { type: Number, default: 0 },
        source:    { type: String, enum: ["ai", "cache", "fallback", "static", "static_pool", "static_validated", "ai_filtered_external"], default: "ai" },
        expiresAt: { type: Date },
    },
    { timestamps: true }
);

// MongoDB TTL index — auto-deletes expired documents
CachedContentSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model("CachedContent", CachedContentSchema);
