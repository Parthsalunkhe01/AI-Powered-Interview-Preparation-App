const axios = require("axios");

/**
 * Executes a search query using YouTube Data API v3
 * @param {string} query The structured search query
 * @param {number} numResults number of results to limit to (default 3)
 * @returns {Promise<Array>} Array of { title, videoId, thumbnail } objects
 */
const searchWithYouTube = async (query, numResults = 10) => {
  const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;

  if (!YOUTUBE_API_KEY) {
    console.warn("⚠️ YOUTUBE_API_KEY is missing. Returning empty array.");
    return [];
  }

  try {
    const response = await axios.get("https://www.googleapis.com/youtube/v3/search", {
      params: {
        part: "snippet",
        q: query,
        type: "video",
        videoDuration: "medium", // Try to find moderately sized videos
        maxResults: numResults,
        key: YOUTUBE_API_KEY
      }
    });

    const results = response.data?.items;

    if (!results || results.length === 0) {
      console.warn("⚠️ No YouTube results found for query:", query);
      return [];
    }

    return results
      .filter(item => item.id && item.id.videoId) // ensure valid video items
      .map(item => ({
        title: item.snippet.title,
        videoId: item.id.videoId,
        thumbnail: item.snippet.thumbnails?.medium?.url || item.snippet.thumbnails?.default?.url
      }));

  } catch (error) {
    console.error("❌ YOUTUBE API ERROR:", error.response?.data?.error?.message || error.message);
    // Never crash the server, return empty explicitly
    return [];
  }
};

module.exports = {
  searchWithYouTube
};
