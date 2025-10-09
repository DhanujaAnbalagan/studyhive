const express = require("express");
const router = express.Router();
const buddyCtrl = require("../controllers/buddyController");

// Health check
router.get("/test", (req, res) => res.json({ ok: true, route: "buddies" }));

// CRUD
router.post("/", buddyCtrl.createBuddy);
router.get("/", buddyCtrl.getAllBuddies);
router.get("/search", buddyCtrl.searchBuddies);
router.put("/:id", buddyCtrl.updateBuddy);
router.delete("/:id", buddyCtrl.deleteBuddy);

module.exports = router;
