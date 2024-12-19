const express = require("express");
const router = express.Router();
const siteController = require("../controllers/site.controller");

router.get("/", siteController.getAllSites);
router.post("/create", siteController.createSite);
router.delete("/", siteController.deleteSite);
router.get("/category/:category", siteController.getSitesByCategory);
router.get("/count", siteController.getSitesCount);

module.exports = router;
