const axios = require("axios");

/**
 * Executes a search query using Serper.dev API
 * @param {string} query The structured search query
 * @param {number} numResults number of results to limit to (default 5)
 * @returns {Promise<Array>} Array of { title, link, snippet } objects
 */
const searchWithSerper = async (query, numResults = 12) => {
  const SERPER_API_KEY = process.env.SERPER_API_KEY;

  if (!SERPER_API_KEY) {
    console.warn("⚠️ SERPER_API_KEY is missing. Returning empty array.");
    return [];
  }

  try {
    let data = JSON.stringify({
      q: query,
      num: numResults
    });

    let config = {
      method: 'post',
      maxBodyLength: Infinity,
      url: 'https://google.serper.dev/search',
      headers: { 
        'X-API-KEY': SERPER_API_KEY, 
        'Content-Type': 'application/json'
      },
      data: data
    };

    const response = await axios.request(config);
    
    // Safely extract organic results
    const results = response.data?.organic;

    if (!results || results.length === 0) {
      console.warn("⚠️ No organic results found via Serper.dev for query:", query);
      return [];
    }

    // Map and return valid results safely filtering out broken objects
    return results
      .filter(item => item.link && item.title)
      .slice(0, numResults)
      .map(item => ({
        title: item.title,
        link: item.link,
        snippet: item.snippet || item.description || "No description provided."
      }));

  } catch (error) {
    console.error("❌ SERPER API ERROR:", error.response?.data?.message || error.message);
    // Never crash the server, return a fallback instead
    return [];
  }
};

module.exports = {
  searchWithSerper
};
