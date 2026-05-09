const { AI_ML_QUESTIONS } = require("./questionBankAIML");
const { ANDROID_QUESTIONS } = require("./questionBankAndroid");
const { BACKEND_QUESTIONS } = require("./questionBankBackend");
const { FRONTEND_QUESTIONS } = require("./questionBankFrontend");
const { DSA_QUESTIONS } = require("./questionBankDSA");
const { SYSTEM_DESIGN_QUESTIONS } = require("./questionBankSystemDesign");
const { DATABASE_QUESTIONS } = require("./questionBankDatabase");
const { BEHAVIORAL_QUESTIONS } = require("./questionBankBehavioral");
const { GENERAL_QUESTIONS } = require("./questionBankGeneral");

/**
 * Question Blueprint Bank — Consolidated
 * Difficulty: 1=Easy, 2=Medium, 3=Hard
 * Types: conceptual | scenario | debug | coding | dsa | system_design | database | behavioral | puzzle
 */

const QUESTION_BANK = {
  general: GENERAL_QUESTIONS,
  aiml: AI_ML_QUESTIONS,
  android: ANDROID_QUESTIONS,
  backend: BACKEND_QUESTIONS,
  frontend: FRONTEND_QUESTIONS,
  dsa: DSA_QUESTIONS,
  system_design: SYSTEM_DESIGN_QUESTIONS,
  database: DATABASE_QUESTIONS,
  behavioral: BEHAVIORAL_QUESTIONS,
};

// ─── FOCUS CATEGORY MAP ────────────────────────────────────────────
// Defines which categories are allowed for a given focus
const FOCUS_MAP = {
  "android": ["android"],
  "dsa": ["dsa"],
  "system_design": ["system_design"],
  "database": ["database"],
  "java": ["backend"], // Assuming Java Core falls under Backend
  "hr": ["behavioral"],
  "aiml": ["aiml"],
  "frontend": ["frontend"],
  "backend": ["backend"],
  "mixed": ["general", "android", "backend", "frontend", "dsa", "system_design", "database", "behavioral"],
};

// ─── ROLE CATEGORY MAP ─────────────────────────────────────────────
// Defines which categories are allowed for a given role (if focus is mixed)
const ROLE_MAP = {
  "ai/ml engineer": ["aiml", "general"],
  "android developer": ["android", "general"],
  "backend developer": ["backend", "general"],
  "frontend developer": ["frontend", "general"],
  "fullstack developer": ["backend", "frontend", "general"],
  "software engineer": ["dsa", "backend", "frontend", "general"],
  "data scientist": ["aiml", "database", "general"],
};

function getQuestionsForFocus(focus, difficultyLevel, count = 3, usedIds = [], role = "") {
  const focusKey = (focus || "mixed").toLowerCase();
  const roleKey = (role || "").toLowerCase();

  let categories = [];

  // If focus is not "mixed", use strict focus mapping
  if (focusKey !== "mixed" && FOCUS_MAP[focusKey]) {
    categories = FOCUS_MAP[focusKey];
  } else if (ROLE_MAP[roleKey]) {
    // If focus is mixed but role is known, use role mapping
    categories = ROLE_MAP[roleKey];
  } else {
    // Fallback to mixed
    categories = FOCUS_MAP["mixed"];
  }

  let allQ = [];
  for (const cat of categories) {
    const catQuestions = QUESTION_BANK[cat] || [];
    for (const q of catQuestions) {
      if (!usedIds.includes(q.id) && Math.abs(q.difficulty - difficultyLevel) <= 0.5) {
        allQ.push(q);
      }
    }
  }

  // If we don't have enough questions within the difficulty range, expand the search
  if (allQ.length < count) {
    for (const cat of categories) {
      for (const q of QUESTION_BANK[cat] || []) {
        if (!usedIds.includes(q.id) && !allQ.find(x => x.id === q.id)) {
          allQ.push(q);
        }
      }
    }
  }

  // Final fallback to any category if still not enough (should rarely happen with large banks)
  if (allQ.length < count) {
    for (const cat of Object.keys(QUESTION_BANK)) {
      for (const q of QUESTION_BANK[cat] || []) {
        if (!usedIds.includes(q.id) && !allQ.find(x => x.id === q.id)) {
          allQ.push(q);
        }
      }
    }
  }

  return allQ.sort(() => Math.random() - 0.5).slice(0, count);
}

// Legacy compatibility
function getQuestionsForRole(role, difficultyLevel, count = 3, usedIds = []) {
  return getQuestionsForFocus("mixed", difficultyLevel, count, usedIds, role);
}

function getWarmupQuestion(role, usedIds = []) {
  const roleKey = (role || "").toLowerCase();
  const categories = ROLE_MAP[roleKey] || ["general"];
  
  let candidates = [];
  for (const cat of categories) {
    const qs = QUESTION_BANK[cat] || [];
    candidates.push(...qs.filter(q => q.difficulty === 1));
  }
  
  if (candidates.length === 0) {
    candidates = QUESTION_BANK["general"].filter(q => q.difficulty === 1);
  }

  const unusedCandidates = candidates.filter(q => !usedIds.includes(q.id));
  return (unusedCandidates.length > 0 ? unusedCandidates : candidates).sort(() => Math.random() - 0.5)[0];
}

function getFollowUps(questionId) {
  for (const cat of Object.values(QUESTION_BANK)) {
    for (const q of cat) {
      if (q.id === questionId && q.followUpHints?.length) {
        return q.followUpHints;
      }
    }
  }
  return [];
}

module.exports = {
  QUESTION_BANK,
  FOCUS_MAP,
  ROLE_MAP,
  getQuestionsForRole,
  getQuestionsForFocus,
  getWarmupQuestion,
  getFollowUps,
};
