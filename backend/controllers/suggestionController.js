const { analyzeCompatibility } = require('../utils/compatibilityChecker');
const Fuse = require('fuse.js');
const { ROLES, COMPANIES, SKILLS_BY_ROLE } = require('../data/knowledgeBase');

/**
 * @route   POST /api/suggestions/analyze
 */
exports.analyzeBlueprintCompatibility = async (req, res) => {
    const { role, skills } = req.body;
    const analysis = analyzeCompatibility(role, skills);
    res.json(analysis);
};

/**
 * Controller for intelligent, fuzzy-search suggestions.
 */

// Configure Fuse.js for Roles
const roleFuse = new Fuse(ROLES, {
    threshold: 0.3, // Sensitive enough for spelling mistakes
    distance: 100
});

// Configure Fuse.js for Companies
const companyFuse = new Fuse(COMPANIES, {
    threshold: 0.3,
    distance: 100
});

/**
 * @route   GET /api/suggestions/roles?q=...
 */
exports.getRoleSuggestions = async (req, res) => {
    const { q } = req.query;
    if (!q) return res.json(ROLES.slice(0, 5)); // Return top 5 if no query

    const results = roleFuse.search(q);
    res.json(results.map(r => r.item).slice(0, 10));
};

/**
 * @route   GET /api/suggestions/companies?q=...
 */
exports.getCompanySuggestions = async (req, res) => {
    const { q } = req.query;
    if (!q) return res.json(COMPANIES.slice(0, 5));

    const results = companyFuse.search(q);
    res.json(results.map(r => r.item).slice(0, 10));
};

/**
 * @route   GET /api/suggestions/skills?role=...&q=...
 */
exports.getSkillSuggestions = async (req, res) => {
    const { role, q } = req.query;

    // Get base skills for the role
    let baseSkills = [];
    if (role) {
        // Exact match or find the closest normalized role
        const normalizedRole = Object.keys(SKILLS_BY_ROLE).find(
            r => r.toLowerCase() === role.toLowerCase()
        );
        baseSkills = normalizedRole ? SKILLS_BY_ROLE[normalizedRole] : [];
    } else {
        // If no role, flatten all skills as a fallback
        baseSkills = Array.from(new Set(Object.values(SKILLS_BY_ROLE).flat()));
    }

    if (!q) {
        return res.json(baseSkills.slice(0, 10));
    }

    // Use Fuse for fuzzy matching on the determined baseSkills
    const skillFuse = new Fuse(baseSkills, { threshold: 0.3 });
    const results = skillFuse.search(q);

    res.json(results.map(r => r.item).slice(0, 10));
};
