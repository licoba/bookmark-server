const Site = require("../models/site.model");
const { success, error, created, notFound } = require("../utils/response");
const Category = require("../models/category.model");

/**
 * @swagger
 * /sites:
 *   get:
 *     tags: [站点管理]
 *     summary: 获取站点列表
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 获取成功
 *       401:
 *         description: 未授权
 */
exports.getAllSites = async (req, res) => {
  try {
    const sites = await Site.findAll({
      where: { userId: req.user.id },
    });
    success(res, sites, "获取站点列表成功");
  } catch (err) {
    error(res, 500, err.message);
  }
};

/**
 * @swagger
 * /sites/create:
 *   post:
 *     tags: [站点管理]
 *     summary: 创建站点
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: 站点标题
 *               url:
 *                 type: string
 *                 description: 站点URL
 *               category:
 *                 type: string
 *                 description: 所属分类
 *               description:
 *                 type: string
 *                 description: 站点描述
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: 标签列表
 *               icon:
 *                 type: string
 *                 description: 站点图标
 *             required:
 *               - title
 *               - url
 *               - category
 *     responses:
 *       201:
 *         description: 创建成功
 */
exports.createSite = async (req, res) => {
  try {
    const { title, url, category } = req.body;

    if (!title || !url || !category) {
      return error(res, 400, "标题、URL和分类为必填项");
    }

    const existingSite = await Site.findOne({ where: { url } });
    if (existingSite) {
      return error(res, 400, "该URL已经添加过了");
    }

    const newSite = await Site.create({
      userId: req.user.id,
      title,
      url,
      category,
      description: req.body.description,
      tags: req.body.tags || [],
      icon: req.body.icon,
    });

    created(res, newSite, "添加书签成功");
  } catch (err) {
    error(res, 500, err.message);
  }
};

/**
 * @swagger
 * /sites/category/{category}:
 *   get:
 *     tags: [站点管理]
 *     summary: 获取指定分类的站点列表
 *     parameters:
 *       - in: path
 *         name: category
 *         required: true
 *         schema:
 *           type: string
 *         description: 分类名称
 *     responses:
 *       200:
 *         description: 获取成功
 *         content:
 *           application/json:
 *             example:
 *               code: 0
 *               message: "获取分类站点成功"
 *               data: []
 */
exports.getSitesByCategory = async (req, res) => {
  try {
    const sites = await Site.findAll({
      where: {
        category: req.params.category,
        userId: req.user.id, // 只获取当前用户的站点
      },
    });
    success(res, sites, "获取分类站点成功");
  } catch (err) {
    error(res, 500, err.message);
  }
};

/**
 * @swagger
 * /sites:
 *   delete:
 *     tags: [站点管理]
 *     summary: 删除站点
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: integer
 *                 description: 站点ID
 *             required:
 *               - id
 *     responses:
 *       200:
 *         description: 删除成功
 *         content:
 *           application/json:
 *             example:
 *               code: 0
 *               message: "站点删除成功"
 *               data: null
 */
exports.deleteSite = async (req, res) => {
  try {
    const { id } = req.body;

    if (!id) {
      return error(res, 400, "少站点ID");
    }

    const site = await Site.findOne({
      where: {
        id,
        userId: req.user.id,
      },
    });
    if (!site) {
      return notFound(res, "站点不存在");
    }

    await site.destroy();
    success(res, null, "站点删除成功");
  } catch (err) {
    error(res, 500, err.message);
  }
};

/**
 * @swagger
 * /sites/count:
 *   get:
 *     tags: [站点管理]
 *     summary: 获取站点总数
 *     responses:
 *       200:
 *         description: 获取成功
 *         content:
 *           application/json:
 *             example:
 *               code: 0
 *               message: "获取站点总数成功"
 *               data: 60
 */
exports.getSitesCount = async (req, res) => {
  try {
    const count = await Site.count({
      where: { userId: req.user.id }, // 只统计当前用户的站点数
    });
    success(res, count, "获取站点总数成功");
  } catch (err) {
    error(res, 500, err.message);
  }
};

/**
 * @swagger
 * /sites:
 *   put:
 *     tags: [站点管理]
 *     summary: 更新站点
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: integer
 *                 description: 站点ID
 *     responses:
 *       200:
 *         description: 更新成功
 */
exports.updateSite = async (req, res) => {
  try {
    const { id, title, url, category, description, tags, icon } = req.body;

    if (!id) {
      return error(res, 400, "缺少站点ID");
    }

    const site = await Site.findOne({
      where: {
        id,
        userId: req.user.id, // 只能更新自己的站点
      },
    });

    if (!site) {
      return notFound(res, "站点不存在");
    }

    if (url && url !== site.url) {
      const existingSite = await Site.findOne({
        where: {
          url,
          userId: req.user.id, // 检查当前用户是否已有相同URL的站点
        },
      });
      if (existingSite) {
        return error(res, 400, "该URL已经存在");
      }
    }

    if (category) {
      const existingCategory = await Category.findOne({
        where: {
          name: category,
          userId: req.user.id, // 检查分类是否属于当前用户
        },
      });
      if (!existingCategory) {
        return error(res, 400, "分类不存在");
      }
    }

    await site.update({
      title: title || site.title,
      url: url || site.url,
      category: category || site.category,
      description: description || site.description,
      tags: tags || site.tags,
      icon: icon || site.icon,
    });

    success(res, site, "站点更新成功");
  } catch (err) {
    error(res, 500, err.message);
  }
};
