const Site = require("../models/site.model");
const { success, error, created, notFound } = require("../utils/response");

exports.getAllSites = async (req, res) => {
  try {
    const sites = await Site.findAll();
    success(res, sites, "获取站点列表成功");
  } catch (err) {
    error(res, 500, err.message);
  }
};

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

exports.getSitesByCategory = async (req, res) => {
  try {
    const sites = await Site.findAll({
      where: { category: req.params.category },
    });
    success(res, sites, "获取分类站点成功");
  } catch (err) {
    error(res, 500, err.message);
  }
};

exports.deleteSite = async (req, res) => {
  try {
    const { id } = req.body;

    if (!id) {
      return error(res, 400, "缺少站点ID");
    }

    const site = await Site.findByPk(id);
    if (!site) {
      return notFound(res, "站点不存在");
    }

    await site.destroy();
    success(res, null, "站点删除成功");
  } catch (err) {
    error(res, 500, err.message);
  }
};

exports.getSitesCount = async (req, res) => {
  try {
    const count = await Site.count();
    success(res, count, "获取站点总数成功");
  } catch (err) {
    error(res, 500, err.message);
  }
};
