const express = require("express");
const router = express.Router();

const { protect } = require("../middlewares/authMiddleware");
const { validateRequest, blueprintSchema } = require("../middleware/validateRequest");

const {
    createBlueprint,
    getBlueprint,
    updateBlueprint,
    deleteBlueprint
} = require("../controllers/blueprintController");

router.post("/", protect, validateRequest(blueprintSchema), createBlueprint);
router.get("/", protect, getBlueprint);
router.put("/", protect, validateRequest(blueprintSchema), updateBlueprint);
router.delete("/", protect, deleteBlueprint);

module.exports = router;
