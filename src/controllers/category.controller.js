const { Category } = require("../models");

exports.getAllCategories = async (req, res) => {
  try {
    const categories = await Category.findAll();
    res.json({
      code: 0,
      data: categories,
    });
  } catch (error) {
    res.status(500).json({
      code: 500,
      message: error.message,
    });
  }
};

exports.createCategory = async (req, res) => {
  try {
    const newCategory = await Category.create(req.body);
    res.json({
      code: 0,
      message: "分类创建成功",
      data: newCategory,
    });
  } catch (error) {
    res.status(400).json({
      code: 400,
      message: error.message,
    });
  }
};
