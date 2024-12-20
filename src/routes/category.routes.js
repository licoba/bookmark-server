const express = require("express");
const router = express.Router();
const categoryController = require("../controllers/category.controller");
const auth = require("../middleware/auth.middleware");

/**
 * @swagger
 * tags:
 *   - name: 分类管理
 *     description: 分类的增删改查接口
 *   - name: 数据初始化
 *     description: 示例数据导入和清理接口
 *   - name: 书签迁移
 *     description: Chrome书签导入导出功能
 */

// 所有路由都需要验证
router.use(auth);

// 分类管理路由
router.get("/", categoryController.getAllCategories);
router.post("/", categoryController.createCategory);
router.post("/create", categoryController.createCategory);
router.delete("/", categoryController.deleteCategory);
router.put("/", categoryController.updateCategory);
router.get("/count", categoryController.getCategoriesCount);

module.exports = router;
