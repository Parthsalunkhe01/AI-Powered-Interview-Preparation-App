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
  // Mobile / Android
  "android": ["android"],
  "mobile_system_design": ["system_design", "android"],
  "java_kotlin": ["android", "backend"],
  
  // AI / ML
  "aiml": ["aiml"],
  "machine_learning": ["aiml"],
  "deep_learning": ["aiml"],
  "data_science": ["aiml", "database"],
  "ai_system_design": ["system_design", "aiml"],
  
  // Backend
  "backend": ["backend"],
  "apis": ["backend"],
  "scalability": ["system_design", "backend"],
  "database": ["database"],
  "system_design": ["system_design"],
  "java": ["backend"], 
  
  // Frontend
  "frontend": ["frontend"],
  "react": ["frontend"],
  
  // General
  "dsa": ["dsa"],
  "hr": ["behavioral"],
  "behavioral": ["behavioral"],
  "mixed": ["general", "dsa", "behavioral"], // Default mixed is now conservative
};

// ─── ROLE CATEGORY MAP ─────────────────────────────────────────────
// Defines which categories are allowed for a given role (if focus is mixed)
const ROLE_MAP = {
  "ai/ml engineer": ["aiml", "dsa", "general"],
  "android developer": ["android", "dsa", "general"],
  "backend developer": ["backend", "database", "system_design", "dsa", "general"],
  "frontend developer": ["frontend", "dsa", "general"],
  "fullstack developer": ["backend", "frontend", "database", "dsa", "general"],
  "software engineer": ["dsa", "backend", "frontend", "system_design", "general"],
  "data scientist": ["aiml", "database", "general"],
};

function getQuestionsForFocus(focus, difficultyLevel, count = 3, usedIds = [], role = "") {
  const focusKey = (focus || "mixed").toLowerCase();
  const roleKey = (role || "").toLowerCase();

  let categories = [];

  // 1. Identify allowed categories based on role + focus
  if (focusKey !== "mixed" && FOCUS_MAP[focusKey]) {
    categories = FOCUS_MAP[focusKey];
  } else if (ROLE_MAP[roleKey]) {
    categories = ROLE_MAP[roleKey];
  } else {
    categories = ["general", "dsa", "behavioral"];
  }

  // 2. STRICTOR FILTERING: Only use categories relevant to the role's domain
  const roleDomainCategories = ROLE_MAP[roleKey] || ["general", "dsa", "behavioral"];
  
  // If focus is specified, we filter the focus categories by what's allowed for the role
  // This prevents "Android Development" focus from showing up for an "AI Engineer"
  if (focusKey !== "mixed") {
    // Only allow categories that are in the role's domain OR the focus matches perfectly
    // But actually, we should probably just trust the FOCUS_MAP if the focus was explicitly selected,
    // assuming the frontend filtered the options correctly.
    // However, as a safety measure:
    const allowed = categories.filter(cat => roleDomainCategories.includes(cat) || cat === "general" || cat === "behavioral");
    if (allowed.length > 0) categories = allowed;
  }

  let allQ = [];
  // Primary pass: matching difficulty
  for (const cat of categories) {
    const catQuestions = QUESTION_BANK[cat] || [];
    for (const q of catQuestions) {
      if (!usedIds.includes(q.id) && Math.abs(q.difficulty - difficultyLevel) <= 0.5) {
        allQ.push(q);
      }
    }
  }

  // Secondary pass: ignore difficulty but stay within categories
  if (allQ.length < count) {
    for (const cat of categories) {
      for (const q of QUESTION_BANK[cat] || []) {
        if (!usedIds.includes(q.id) && !allQ.find(x => x.id === q.id)) {
          allQ.push(q);
        }
      }
    }
  }

  // Final fallback: stay within ROLE domain, do NOT leak to global
  if (allQ.length < count) {
    for (const cat of roleDomainCategories) {
      for (const q of QUESTION_BANK[cat] || []) {
        if (!usedIds.includes(q.id) && !allQ.find(x => x.id === q.id)) {
          allQ.push(q);
        }
      }
    }
  }

  // If still nothing, use general/behavioral
  if (allQ.length < count) {
    const backupCats = ["general", "behavioral"];
    for (const cat of backupCats) {
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
