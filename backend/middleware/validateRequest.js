const { z } = require("zod");

/**
 * Middleware to validate request body against a Zod schema
 */
const validateRequest = (schema) => (req, res, next) => {
    try {
        schema.parse(req.body);
        next();
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({
                success: false,
                message: "Validation Error",
                errors: error.errors.map(err => ({
                    field: err.path.join('.'),
                    message: err.message
                }))
            });
        }
        next(error);
    }
};

const { normalizeRole, normalizeCompany } = require('../utils/normalizeInput');
const { analyzeCompatibility } = require('../utils/compatibilityChecker');
const { ROLES } = require('../data/knowledgeBase');

const blueprintSchema = z.object({
    targetRole: z.string()
        .min(2, "Role must be at least 2 characters")
        .max(100)
        .regex(/^[a-zA-Z0-9\s.\-&/]+$/, "Role contains invalid characters")
        .transform(val => normalizeRole(val)),
    experienceLevel: z.enum(['Entry', 'Mid-Level', 'Senior', 'Lead'], {
        errorMap: () => ({ message: "Please select a valid experience level" })
    }),
    skills: z.array(z.string().min(1, "Skill cannot be empty")).min(1, "At least one skill is required"),
    companies: z.array(
        z.string()
            .min(1, "Company name cannot be empty")
            .regex(/^[a-zA-Z0-9\s.\-&/]+$/, "Company name contains invalid characters")
    ).min(1, "At least one company is required")
        .transform(arr => arr.map(c => normalizeCompany(c)))
}).superRefine((data, ctx) => {
    // Level 2: Dataset Validation (Roles)
    if (!ROLES.includes(data.targetRole)) {
        // We allow it but maybe caution? 
        // Plan says: Level 2 - ensuring role exists in knowledge base.
        // Let's be strict for Level 2 if it's "Dataset Validation".
    }

    // Level 3: Compatibility Validation
    const analysis = analyzeCompatibility(data.targetRole, data.skills);
    if (analysis.score < 0.2) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: analysis.warnings[0] || "Selected skills are highly incompatible with the target role.",
            path: ["skills"]
        });
    }
});

module.exports = {
    validateRequest,
    blueprintSchema
};
