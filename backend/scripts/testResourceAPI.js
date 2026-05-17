/**
 * testResourceAPI.js
 * Diagnoses exactly where resource fetching breaks.
 * Run: node scripts/testResourceAPI.js
 */
require("dotenv").config({ path: require("path").join(__dirname, "../.env") });
const { searchWithYouTube } = require("../utils/youtubeSearch");
const { searchWithSerper }  = require("../utils/serperSearch");

async function run() {
    const query = "BFS DFS graph shortest path algorithm";

    console.log("\n=== YouTube API Test ===");
    console.log("Key present:", !!process.env.YOUTUBE_API_KEY);
    const yt = await searchWithYouTube(query, 3);
    console.log("Results:", yt.length, yt.map(v => v.title));

    console.log("\n=== Serper API Test ===");
    console.log("Key present:", !!process.env.SERPER_API_KEY);
    const sp = await searchWithSerper(query, 3);
    console.log("Results:", sp.length, sp.map(a => a.title));

    console.log("\n=== Full Resource Pipeline Test ===");
    const mongoose = require("mongoose");
    await mongoose.connect(process.env.MONGO_URI);
    const { fetchAndVerifyResources } = require("../controllers/resourceController");
    const result = await fetchAndVerifyResources(
        "What is the difference between BFS and DFS? Which one would you use to find the shortest path?",
        new Set(), new Set(), "Software Engineer"
    );
    console.log("Source:", result.source);
    console.log("Videos:", result.videos?.length, result.videos?.map(v => v.title));
    console.log("Articles:", result.articles?.length, result.articles?.map(a => a.title));
    await mongoose.disconnect();
}

run().catch(e => { console.error("FATAL:", e.message); process.exit(1); });
