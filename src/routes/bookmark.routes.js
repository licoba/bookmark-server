const express = require("express");
const router = express.Router();
const bookmarkController = require("../controllers/bookmark.controller");
const auth = require("../middleware/auth.middleware");

/**
 * @swagger
 * tags:
 *   - name: 书签迁移
 *     description: Chrome书签导入导出功能
 */

// 所有路由都需要验证
router.use(auth);

// 基础的CRUD操作
router.get("/", bookmarkController.getAllBookmarks);
router.post("/", bookmarkController.createBookmark);
router.put("/:id", bookmarkController.updateBookmark);
router.delete("/:id", bookmarkController.deleteBookmark);
router.get("/count", bookmarkController.getBookmarksCount);

// 导入导出功能
router.post("/import", bookmarkController.importBookmarks);
router.get("/export", bookmarkController.exportBookmarks);

module.exports = router;
