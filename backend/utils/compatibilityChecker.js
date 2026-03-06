const { SKILLS_BY_ROLE } = require('../data/knowledgeBase');

/**
 * Intelligent Compatibility Engine
 * Calculates how well a set of skills matches a target role.
 */
const analyzeCompatibility = (role, userSkills = []) => {
    if (!role) return { score: 0, warnings: ["No role selected"], recommendedSkills: [] };

    // Find standard skills for this role
    // Try case-insensitive lookup
    const normalizedRole = Object.keys(SKILLS_BY_ROLE).find(
        r => r.toLowerCase() === role.toLowerCase()
    );

    const standardSkills = normalizedRole ? SKILLS_BY_ROLE[normalizedRole] : [];

    if (standardSkills.length === 0) {
        return {
            score: 1.0, // Neutral if role not in database
            warnings: [],
            recommendedSkills: []
        };
    }

    const userSkillsLower = userSkills.map(s => s.toLowerCase().trim());
    const standardSkillsLower = standardSkills.map(s => s.toLowerCase());

    // Calculate Matches
    const matches = userSkillsLower.filter(skill => standardSkillsLower.includes(skill));

    // Calculate Mismatches (Skills user has that aren't typical for this role)
    // We only warn if the user has NO matches and is adding something completely different
    const mismatches = userSkillsLower.filter(skill => !standardSkillsLower.includes(skill));

    // Determine score (simplified percentage of recommended skills present)
    // Max score contribution from recommendations is 1.0
    const matchRatio = matches.length / Math.min(standardSkills.length, 5); // Base on top 5
    const score = Math.min(matchRatio, 1.0);

    const warnings = [];
    if (userSkills.length > 0 && matches.length === 0) {
        warnings.push(`Selected skills might not be typical for ${role}. Consider adding role-specific skills.`);
    }

    // Cross-role detection for warnings (e.g. Android + MERN)
    if (userSkillsLower.includes('mern') && role.toLowerCase().includes('android')) {
        warnings.push("MERN is typically used for Full Stack Development and may not be relevant for Android.");
    }

    // Recommended skills that the user hasn't added yet
    const recommendedSkills = standardSkills.filter(s => !userSkillsLower.includes(s.toLowerCase()));

    return {
        score: parseFloat(score.toFixed(2)),
        warnings,
        recommendedSkills: recommendedSkills.slice(0, 5) // Suggest top 5 missing
    };
};

module.exports = {
    analyzeCompatibility
};
