const { searchWithSerper } = require('../utils/serperSearch');
const { searchWithYouTube } = require('../utils/youtubeSearch');
const Groq = require("groq-sdk");
const { resourceSemanticFilterPrompt } = require("../utils/prompts");

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

/**
 * Comprehensive list of technical "fluff" words and common interview conversational patterns.
 */
const TECH_STOPWORDS = new Set([
  "a", "an", "the", "and", "or", "but", "if", "then", "else", "when", "at", "from", "by", "for", 
  "with", "about", "against", "between", "into", "through", "during", "before", "after", 
  "above", "below", "to", "from", "up", "down", "in", "out", "on", "off", "over", "under", 
  "again", "further", "then", "once", "here", "there", "all", "any", "both", "each", "few", 
  "more", "most", "other", "some", "such", "no", "nor", "not", "only", "own", "same", "so", 
  "than", "too", "very", "s", "t", "can", "will", "just", "don", "should", "now", "i", "me",
  "my", "myself", "we", "our", "ours", "ourselves", "you", "your", "yours", "yourself", 
  "yourselves", "he", "him", "his", "himself", "she", "her", "hers", "herself", "it", "its", 
  "itself", "they", "them", "their", "theirs", "themselves", "what", "which", "who", "whom", 
  "this", "that", "these", "those", "am", "is", "are", "was", "were", "be", "been", "being", 
  "have", "has", "had", "having", "do", "does", "did", "doing",
  "explain", "describe", "implement", "optimize", "optimise", "how", "what", "why", "where",
  "difference", "between", "versus", "vs", "compare", "contrast", "advantage", "disadvantage",
  "benefit", "drawback", "use", "used", "using", "work", "works", "working", "give", "example",
  "provide", "write", "code", "programming", "developer", "engineer", "software", "system",
  "design", "build", "create", "make", "made", "real-world", "scenario", "based", "question",
  "interview", "preparation", "prep", "tutorial", "guide", "concept", "deep-dive", "explained",
  "understand", "understanding", "case", "study", "problem", "solution", "approach", "best",
  "practice", "practices", "common", "typical", "standard", "modern", "legacy", "classic",
  "basic", "advanced", "intermediate", "level", "senior", "junior", "mid-level", "entry",
  "beginner", "complete", "full", "course", "video", "article", "blog", "post", "read", "watch",
  "learn", "learning", "study", "studying", "knowledge", "skill", "skills", "set", "sets",
  "topic", "topics"
]);

const extractCoreKeywords = (rawQuestion) => {
  if (!rawQuestion) return "";
  const cleanStr = rawQuestion.toLowerCase().replace(/[^a-z0-9+# ]/g, " ");
  const tokens = cleanStr.split(/\s+/).filter(token => token.length > 1 && !TECH_STOPWORDS.has(token));
  return [...new Set(tokens)].slice(0, 6).join(" ");
};

/**
 * Call AI to verify relevance of candidates
 */
const filterCandidatesWithAI = async (question, candidates) => {
  if (!candidates || candidates.length === 0) return [];

  try {
    const prompt = resourceSemanticFilterPrompt(question, candidates);
    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.1, // low temp for objective truth
    });

    const response = completion.choices[0]?.message?.content || "[]";
    const relevantIndices = JSON.parse(response.replace(/```json/g, "").replace(/```/g, ""));
    
    return candidates.filter((_, idx) => relevantIndices.includes(idx.toString()));
  } catch (err) {
    console.error("  [AI_FILTER_ERROR]:", err.message);
    return candidates.slice(0, 3); // Fallback to top mapping on AI fail
  }
};

/**
 * Core function to fetch and filter resources for a topic
 */
const fetchAndVerifyResources = async (topic, seenLinks, seenVideoIds, retry = false) => {
  const coreKeywords = extractCoreKeywords(topic);
  
  // Use a more specific query for retry passes
  const querySuffix = retry ? "advanced technical guide interview deep-dive" : "technical tutorial guide";
  
  const serperQuery = `${coreKeywords} ${querySuffix}`.trim();
  const youtubeQuery = `${coreKeywords} technical explained interview`.trim();

  // 1. Fetch Candidates
  const [rawResources, rawVideos] = await Promise.all([
    searchWithSerper(serperQuery, 12),
    searchWithYouTube(youtubeQuery, 10)
  ]);

  // 2. Initial Uniqueness Pass (before AI to save tokens)
  const uniqueResources = rawResources.filter(r => !seenLinks.has(r.link));
  const uniqueVideos = rawVideos.filter(v => !seenVideoIds.has(v.videoId));

  // 3. AI Semantic Verification (Parallel)
  const [verifiedResources, verifiedVideos] = await Promise.all([
    filterCandidatesWithAI(topic, uniqueResources),
    filterCandidatesWithAI(topic, uniqueVideos)
  ]);

  // Update global trackers
  verifiedResources.forEach(r => seenLinks.add(r.link));
  verifiedVideos.forEach(v => seenVideoIds.add(v.videoId));

  return {
    articles: verifiedResources,
    videos: verifiedVideos,
    keywords: coreKeywords.split(" ")
  };
};

/**
 * Handle POST /api/ai/resources
 */
exports.generateResources = async (req, res) => {
  try {
    const inputTopics = req.body.topics || req.body.questions;

    if (!inputTopics || !Array.isArray(inputTopics) || inputTopics.length === 0) {
      return res.status(400).json({ success: false, message: "topics array is required." });
    }

    console.log(`📡 Initializing AI Semantic Filtering for ${inputTopics.length} topics...`);

    const seenLinks = new Set();
    const seenVideoIds = new Set();

    const resourcePromises = inputTopics.map(async (topic) => {
      // Pass 1: Standard Fetch
      let results = await fetchAndVerifyResources(topic, seenLinks, seenVideoIds);

      // Pass 2: Regeneration (if low relevance found)
      if (results.articles.length < 2 || results.videos.length < 1) {
        console.log(`  🔄 Low relevance pool for "${topic.substring(0, 30)}...". Triggering regeneration...`);
        const retryResults = await fetchAndVerifyResources(topic, seenLinks, seenVideoIds, true);
        
        // Merge results
        results.articles = [...results.articles, ...retryResults.articles].slice(0, 3);
        results.videos = [...results.videos, ...retryResults.videos].slice(0, 2);
      }

      return {
        topic: topic,
        keywords: results.keywords,
        resources: results.articles.slice(0, 3),
        videos: results.videos.slice(0, 2)
      };
    });

    const results = await Promise.all(resourcePromises);

    return res.status(200).json({
      success: true,
      data: results
    });

  } catch (error) {
    console.error("❌ Resource Controller Fatal Error:", error);
    return res.status(200).json({ success: true, data: [] });
  }
};
