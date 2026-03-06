const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const {
    getRoleSuggestions,
    getCompanySuggestions,
    getSkillSuggestions,
    analyzeBlueprintCompatibility,
    getSkillsByRole
} = require('../controllers/suggestionController');

// All suggestion routes are protected to prevent API scraping
router.get('/roles', protect, getRoleSuggestions);
router.get('/companies', protect, getCompanySuggestions);
router.get('/skills', protect, getSkillSuggestions);
router.get('/skills-by-role', protect, getSkillsByRole);
router.post('/analyze', protect, analyzeBlueprintCompatibility);

module.exports = router;
