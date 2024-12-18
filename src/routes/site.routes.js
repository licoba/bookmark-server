const express = require("express");
const router = express.Router();
const siteController = require("../controllers/site.controller");

router.get("/", siteController.getAllSites);
router.post("/", siteController.createSite);
router.get("/category/:category", siteController.getSitesByCategory);

module.exports = router;
