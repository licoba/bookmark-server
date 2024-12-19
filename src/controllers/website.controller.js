const Site = require("../models/site.model");

exports.getWebsites = async (req, res) => {
  try {
    const websites = await Site.findAll();
    res.json({
      code: 0,
      message: "获取网站列表成功",
      data: websites,
    });
  } catch (error) {
    res.status(500).json({
      code: 500,
      message: error.message,
      data: null,
    });
  }
};

exports.createWebsite = async (req, res) => {
  try {
    const newWebsite = await Site.create(req.body);
    res.status(201).json({
      code: 0,
      message: "创建网站成功",
      data: newWebsite,
    });
  } catch (error) {
    res.status(400).json({
      code: 400,
      message: error.message,
      data: null,
    });
  }
};
