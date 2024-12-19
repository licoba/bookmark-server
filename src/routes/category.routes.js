const express = require("express");
const router = express.Router();
const categoryController = require("../controllers/category.controller");

router.get("/", categoryController.getAllCategories);
router.post("/", categoryController.createCategory);
router.post("/create", categoryController.createCategory);
router.delete("/", categoryController.deleteCategory);
router.put("/", categoryController.updateCategory);
router.get("/count", categoryController.getCategoriesCount);

module.exports = router;
