/**
 * clearResourceCache.js
 * 
 * One-shot script: Deletes ALL cached "resource" entries from MongoDB.
 * Run this when the RESOURCE_CACHE_VERSION is bumped to force a fresh API re-fetch
 * for every question on the next load.
 *
 * Usage: node scripts/clearResourceCache.js
 */

require("dotenv").config({ path: require("path").join(__dirname, "../.env") });
const mongoose = require("mongoose");
const CachedContent = require("../models/CachedContent");

async function clearCache() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("✅ Connected to MongoDB");

        const result = await CachedContent.deleteMany({ type: "resource" });
        console.log(`🗑️  Deleted ${result.deletedCount} stale resource cache entries.`);

        // Also reset today's API usage counters so budget doesn't block new calls
        const ApiUsage = require("../models/ApiUsage");
        const today = new Date().toISOString().split("T")[0];
        const resetResult = await ApiUsage.findOneAndUpdate(
            { date: today },
            { $set: { youtubeCalls: 0, serperCalls: 0, groqCalls: 0, groqTokens: 0 } },
            { upsert: false }
        );
        if (resetResult) {
            console.log(`🔄 Reset today's (${today}) API usage counters to 0.`);
        } else {
            console.log(`ℹ️  No ApiUsage record found for today (${today}) — nothing to reset.`);
        }

        await mongoose.disconnect();
        console.log("✅ Done. Restart your backend server to apply the new cache version.");
    } catch (err) {
        console.error("❌ Error:", err.message);
        process.exit(1);
    }
}

clearCache();
