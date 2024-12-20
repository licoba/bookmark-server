const express = require("express");
const router = express.Router();
const siteController = require("../controllers/site.controller");
const auth = require("../middleware/auth.middleware");

// 所有路由都需要验证
router.use(auth);

router.get("/", siteController.getAllSites);
router.post("/create", siteController.createSite);
router.delete("/", siteController.deleteSite);
router.get("/category/:category", siteController.getSitesByCategory);
router.get("/count", siteController.getSitesCount);
router.put("/", siteController.updateSite);

module.exports = router;
