const express = require("express");
const router = express.Router();
const groupCtrl = require("../controllers/groupController");

// Health check
router.get("/test", (req, res) => res.json({ ok: true, route: "groups" }));

// CRUD
router.post("/", groupCtrl.createGroup);
router.get("/", groupCtrl.getAllGroups);
router.get("/search", groupCtrl.searchGroups);
router.put("/:id", groupCtrl.updateGroup);
router.delete("/:id", groupCtrl.deleteGroup);
router.post("/:id/join", groupCtrl.joinGroup);

module.exports = router;
