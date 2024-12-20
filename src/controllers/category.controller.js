const Category = require("../models/category.model");
const Site = require("../models/site.model");
const { success, error, created, notFound } = require("../utils/response");
const sampleData = require("../data/sample-data.json");
const cheerio = require("cheerio"); // 需要先安装: npm install cheerio

/**
 * @swagger
 * /categories:
 *   get:
 *     tags: [分类管理]
 *     summary: 获取分类列表
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 获取成功
 *         content:
 *           application/json:
 *             example:
 *               code: 0
 *               message: "获取分类列表成功"
 *               data: [
 *                 {
 *                   id: 1,
 *                   name: "常用工具",
 *                   description: "常用工具描述",
 *                   order: 1,
 *                   createdAt: "2024-03-20T12:00:00.000Z",
 *                   updatedAt: "2024-03-20T12:00:00.000Z"
 *                 }
 *               ]
 *       401:
 *         description: 未授权
 */
exports.getAllCategories = async (req, res) => {
  try {
    const categories = await Category.findAll({
      where: { userId: req.user.id },
    });
    success(res, categories, "获取分类列表成功");
  } catch (err) {
    error(res, 500, err.message);
  }
};

/**
 * @swagger
 * /categories:
 *   post:
 *     tags: [分类管理]
 *     summary: 创建分类
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: 分类名称
 *                 example: "学习资源"
 *               description:
 *                 type: string
 *                 description: 分类描述
 *                 example: "编程学习相关的网站"
 *               order:
 *                 type: integer
 *                 description: 排序顺序
 *                 example: 1
 *             required:
 *               - name
 *     responses:
 *       201:
 *         description: 创建成功
 *         content:
 *           application/json:
 *             example:
 *               code: 0
 *               message: "创建分类成功"
 *               data: {
 *                 id: 1,
 *                 name: "学习资源",
 *                 description: "编程学习相关的网站",
 *                 order: 1,
 *                 userId: 1,
 *                 createdAt: "2024-03-20T12:00:00.000Z",
 *                 updatedAt: "2024-03-20T12:00:00.000Z"
 *               }
 *       400:
 *         description: 参数错误
 *         content:
 *           application/json:
 *             example:
 *               code: 400
 *               message: "分类名称已存在"
 *               data: null
 *       401:
 *         description: 未授权
 */
exports.createCategory = async (req, res) => {
  try {
    const { name } = req.body;

    const existingCategory = await Category.findOne({
      where: {
        name,
        userId: req.user.id,
      },
    });

    if (existingCategory) {
      return error(res, 400, "分类名称已存在");
    }

    const newCategory = await Category.create({
      ...req.body,
      userId: req.user.id,
    });
    created(res, newCategory, "创建分类成功");
  } catch (err) {
    error(res, 400, err.message);
  }
};

/**
 * @swagger
 * /categories:
 *   delete:
 *     tags: [分类管理]
 *     summary: 删除分类
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: integer
 *                 description: 分类ID
 *                 example: 1
 *               deleteMode:
 *                 type: string
 *                 enum: [delete, move]
 *                 description: 处理方式：delete(删除所有书签)或move(移动到未分类)
 *                 example: "move"
 *             required:
 *               - id
 *               - deleteMode
 *     responses:
 *       200:
 *         description: 删除成功
 *         content:
 *           application/json:
 *             examples:
 *               move:
 *                 value:
 *                   code: 0
 *                   message: "分类删除成功，相关站点已移至未分类"
 *                   data: null
 *               delete:
 *                 value:
 *                   code: 0
 *                   message: "分类及其下的所有站点已删除"
 *                   data: null
 *       400:
 *         description: 参数错误
 *         content:
 *           application/json:
 *             example:
 *               code: 400
 *               message: "不能删除默认分类"
 *               data: null
 *       401:
 *         description: 未授权
 *       404:
 *         description: 分类不存在
 */
exports.deleteCategory = async (req, res) => {
  try {
    const { id, deleteMode } = req.body;

    if (!id) {
      return error(res, 400, "缺少分类ID");
    }

    if (!deleteMode || !["delete", "move"].includes(deleteMode)) {
      return error(res, 400, "请选择处理方式：删除(delete)或移动(move)");
    }

    const category = await Category.findOne({
      where: {
        id,
        userId: req.user.id,
      },
    });

    if (!category) {
      return notFound(res, "分类不存在");
    }

    if (category.name === "未分类") {
      return error(res, 400, "不能删除默认分类");
    }

    if (deleteMode === "move") {
      const defaultCategory = await Category.findOne({
        where: {
          name: "未分类",
          userId: req.user.id,
        },
      });

      if (!defaultCategory) {
        return error(res, 500, "默认分类不存在，请先初始化数据");
      }

      await Site.update(
        { category: defaultCategory.name },
        {
          where: {
            category: category.name,
            userId: req.user.id,
          },
        }
      );

      await category.destroy();
      success(res, null, "分类删除成功，相关站点已移至���分类");
    } else {
      await Site.destroy({
        where: {
          category: category.name,
          userId: req.user.id,
        },
      });

      await category.destroy();
      success(res, null, "分类及其下的所有站点已删除");
    }
  } catch (err) {
    error(res, 500, err.message);
  }
};

/**
 * @swagger
 * /categories:
 *   put:
 *     tags: [分类管理]
 *     summary: 更新分类
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: integer
 *                 description: 分类ID
 *                 example: 1
 *               name:
 *                 type: string
 *                 description: 分类名称
 *                 example: "新分类名称"
 *               description:
 *                 type: string
 *                 description: 分类描述
 *                 example: "更新后的分类描述"
 *               order:
 *                 type: integer
 *                 description: 排序顺序
 *                 example: 2
 *             required:
 *               - id
 *     responses:
 *       200:
 *         description: 更新成功
 *         content:
 *           application/json:
 *             example:
 *               code: 0
 *               message: "分类更新成功"
 *               data: {
 *                 id: 1,
 *                 name: "新分类名称",
 *                 description: "更新后的分类描述",
 *                 order: 2,
 *                 userId: 1,
 *                 createdAt: "2024-03-20T12:00:00.000Z",
 *                 updatedAt: "2024-03-20T12:00:00.000Z"
 *               }
 *       400:
 *         description: 参数错误
 *         content:
 *           application/json:
 *             example:
 *               code: 400
 *               message: "分类名称已存在"
 *               data: null
 *       401:
 *         description: 未授权
 *       404:
 *         description: 分类不存在
 */
exports.updateCategory = async (req, res) => {
  try {
    const { id, name } = req.body;

    if (!id) {
      return error(res, 400, "缺少分类ID");
    }

    const category = await Category.findOne({
      where: {
        id,
        userId: req.user.id,
      },
    });

    if (!category) {
      return error(res, 404, "分类不存在");
    }

    if (name && name !== category.name) {
      const existingCategory = await Category.findOne({
        where: {
          name,
          userId: req.user.id,
        },
      });
      if (existingCategory) {
        return error(res, 400, "分类名称已存在");
      }
    }

    await category.update(req.body);
    success(res, category, "分类更新成功");
  } catch (err) {
    error(res, 500, err.message);
  }
};

/**
 * @swagger
 * /categories/count:
 *   get:
 *     tags: [分类管理]
 *     summary: 获取分类总数
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 获取成功
 *         content:
 *           application/json:
 *             example:
 *               code: 0
 *               message: "获取分类总数成功"
 *               data: 10
 *       401:
 *         description: 未授权
 */
exports.getCategoriesCount = async (req, res) => {
  try {
    const count = await Category.count({
      where: { userId: req.user.id },
    });
    success(res, count, "获取分类总数成功");
  } catch (err) {
    error(res, 500, err.message);
  }
};

/**
 * @swagger
 * /categories/init-sample:
 *   post:
 *     tags: [数据初始化]
 *     summary: 初始化示例数据
 *     description: 将预设的示例数据导入到数据库中
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: 初��化成功
 *         content:
 *           application/json:
 *             example:
 *               code: 0
 *               message: "示例数据初始化成功"
 *               data: {
 *                 categories: 10,
 *                 sites: 50
 *               }
 *       400:
 *         description: 初始化失败
 *         content:
 *           application/json:
 *             example:
 *               code: 400
 *               message: "数据已存在，请先清空数据"
 *               data: null
 *       401:
 *         description: 未授权
 */
exports.initSampleData = async (req, res) => {
  try {
    // 检查是否已有数据
    const existingCategories = await Category.count({
      where: { userId: req.user.id },
    });

    if (existingCategories > 0) {
      return error(res, 400, "数据已存在，请先清空数据");
    }

    // 创建分类
    const categoryPromises = sampleData.categories.map((category) =>
      Category.create({
        ...category,
        userId: req.user.id,
      })
    );
    await Promise.all(categoryPromises);

    // 创建站点
    const sitePromises = sampleData.sites.map((site) =>
      Site.create({
        ...site,
        userId: req.user.id,
      })
    );
    await Promise.all(sitePromises);

    created(
      res,
      {
        categories: sampleData.categories.length,
        sites: sampleData.sites.length,
      },
      "示例数据初始化成功"
    );
  } catch (err) {
    error(res, 500, err.message);
  }
};

/**
 * @swagger
 * /categories/clear-sample:
 *   delete:
 *     tags: [数据初始化]
 *     summary: 清空所有数据
 *     description: 清空数据库中的所有分类和站点数据
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 清空成功
 *         content:
 *           application/json:
 *             example:
 *               code: 0
 *               message: "数据清空成功"
 *               data: {
 *                 deletedCategories: 10,
 *                 deletedSites: 50
 *               }
 *       401:
 *         description: 未授权
 */
exports.clearSampleData = async (req, res) => {
  try {
    // 删除所有站点
    const deletedSites = await Site.destroy({
      where: { userId: req.user.id },
    });

    // 删除所有分类
    const deletedCategories = await Category.destroy({
      where: { userId: req.user.id },
    });

    success(
      res,
      {
        deletedCategories,
        deletedSites,
      },
      "数据清空成功"
    );
  } catch (err) {
    error(res, 500, err.message);
  }
};
