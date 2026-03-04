const express = require("express");
const router = express.Router();

const {protect} = require("../middlewares/authMiddleware");

const {
createBlueprint,
getBlueprint,
updateBlueprint,
deleteBlueprint
} = require("../controllers/blueprintController");

router.post("/",protect,createBlueprint);
router.get("/",protect,getBlueprint);
router.put("/",protect,updateBlueprint);
router.delete("/",protect,deleteBlueprint);

module.exports = router;
