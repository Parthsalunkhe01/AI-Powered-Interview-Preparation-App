const { ROLE_NORMALIZATION_MAP, COMPANY_NORMALIZATION_MAP, ROLES, COMPANIES } = require('../data/knowledgeBase');

/**
 * Normalizes user input for roles.
 * Converts "android dev" -> "Android Developer" based on mapping or simple cleaning.
 */
const normalizeRole = (input) => {
    if (!input) return "";
    const cleaned = input.toLowerCase().trim();

    // 1. Check direct mapping
    if (ROLE_NORMALIZATION_MAP[cleaned]) {
        return ROLE_NORMALIZATION_MAP[cleaned];
    }

    // 2. Search for partial matches in the standard ROLES list
    const match = ROLES.find(role => role.toLowerCase() === cleaned);
    if (match) return match;

    // 3. Just title case if no match found (fallback)
    return input.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
};

/**
 * Normalizes user input for companies.
 */
const normalizeCompany = (input) => {
    if (!input) return "";
    const cleaned = input.toLowerCase().trim();

    // 1. Check direct mapping
    if (COMPANY_NORMALIZATION_MAP[cleaned]) {
        return COMPANY_NORMALIZATION_MAP[cleaned];
    }

    // 2. Search for partial matches
    const match = COMPANIES.find(c => c.toLowerCase() === cleaned);
    if (match) return match;

    return input.trim();
};

/**
 * Basic skill normalization (trimming and standard casing).
 */
const normalizeSkill = (input) => {
    if (!input) return "";
    return input.trim();
};

module.exports = {
    normalizeRole,
    normalizeCompany,
    normalizeSkill
};
