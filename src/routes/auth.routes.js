const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");
const auth = require("../middleware/auth.middleware");

router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/logout", auth, authController.logout);
router.put("/password", auth, authController.changePassword);
router.put("/profile", auth, authController.updateProfile);

module.exports = router;
