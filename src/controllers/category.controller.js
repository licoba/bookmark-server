const Category = require("../models/category.model");
const Site = require("../models/site.model");
const { success, error, created, notFound } = require("../utils/response");

exports.getAllCategories = async (req, res) => {
  try {
    const categories = await Category.findAll();
    success(res, categories, "获取分类列表成功");
  } catch (err) {
    error(res, 500, err.message);
  }
};

exports.createCategory = async (req, res) => {
  try {
    const { name } = req.body;

    const existingCategory = await Category.findOne({ where: { name } });
    if (existingCategory) {
      return error(res, 400, "分类名称已存在");
    }

    const newCategory = await Category.create(req.body);
    created(res, newCategory, "创建分类成功");
  } catch (err) {
    error(res, 400, err.message);
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    const { id, deleteMode } = req.body;

    if (!id) {
      return error(res, 400, "缺少分类ID");
    }

    if (!deleteMode || !["delete", "move"].includes(deleteMode)) {
      return error(res, 400, "请选择处理方式：删除(delete)或移动(move)");
    }

    const category = await Category.findByPk(id);
    if (!category) {
      return notFound(res, "分类不存在");
    }

    if (category.name === "未分类") {
      return error(res, 400, "不能删除默认分类");
    }

    if (deleteMode === "move") {
      const defaultCategory = await Category.findOne({
        where: { name: "未分类" },
      });

      if (!defaultCategory) {
        return error(res, 500, "默认分类不存在，请先初始化数据");
      }

      await Site.update(
        { category: defaultCategory.name },
        { where: { category: category.name } }
      );

      await category.destroy();
      success(res, null, "分类删除成功，相关站点已移至未分类");
    } else {
      await Site.destroy({
        where: { category: category.name },
      });

      await category.destroy();
      success(res, null, "分类及其下的所有站点已删除");
    }
  } catch (err) {
    error(res, 500, err.message);
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const { id, name, description, order } = req.body;

    if (!id) {
      return error(res, 400, "缺少分类ID");
    }

    const category = await Category.findByPk(id);
    if (!category) {
      return error(res, 404, "分类不存在");
    }

    if (name && name !== category.name) {
      const existingCategory = await Category.findOne({ where: { name } });
      if (existingCategory) {
        return error(res, 400, "分类名称已存在");
      }
    }

    await category.update({
      name: name || category.name,
      description: description || category.description,
      order: order || category.order,
    });

    success(res, category, "分类更新成功");
  } catch (err) {
    error(res, 500, err.message);
  }
};

exports.getCategoriesCount = async (req, res) => {
  try {
    const count = await Category.count();
    success(res, count, "获取分类总数成功");
  } catch (err) {
    error(res, 500, err.message);
  }
};
