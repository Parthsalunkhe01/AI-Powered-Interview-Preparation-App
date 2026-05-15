/**
 * Cache Purge Script — Run once to clear stale resource cache entries.
 *
 * What it does:
 *   - Deletes ALL documents in CachedContent where type = "resource"
 *   - Forces fresh resource generation on next request using the new
 *     relevance-scored static pool and correct video IDs
 *
 * Usage:
 *   node scripts/purgeResourceCache.js
 */

require("dotenv").config({ path: require("path").join(__dirname, "../.env") });
const mongoose = require("mongoose");
const CachedContent = require("../models/CachedContent");

async function purgeResourceCache() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("✅ Connected to MongoDB");

        const result = await CachedContent.deleteMany({ type: "resource" });
        console.log(`🗑️  Deleted ${result.deletedCount} stale resource cache entries`);

        // Optional: also clear guide cache if needed
        // const guides = await CachedContent.deleteMany({ type: "guide" });
        // console.log(`🗑️  Deleted ${guides.deletedCount} guide cache entries`);

        console.log("✅ Cache purge complete. Next request will regenerate fresh resources.");
    } catch (err) {
        console.error("❌ Purge failed:", err.message);
        process.exit(1);
    } finally {
        await mongoose.disconnect();
        console.log("🔌 Disconnected from MongoDB");
    }
}

purgeResourceCache();
