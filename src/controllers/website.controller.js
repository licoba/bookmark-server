const { Website } = require("../models");

exports.getWebsites = async (req, res) => {
  try {
    const { category_id, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const query = {
      limit: parseInt(limit),
      offset: offset,
    };

    if (category_id) {
      query.where = { category_id };
    }

    const { count, rows } = await Website.findAndCountAll(query);

    res.json({
      code: 0,
      data: {
        total: count,
        items: rows,
      },
    });
  } catch (error) {
    res.status(500).json({
      code: 500,
      message: error.message,
    });
  }
};

exports.createWebsite = async (req, res) => {
  try {
    const newWebsite = await Website.create(req.body);
    res.json({
      code: 0,
      message: "网站创建成功",
      data: newWebsite,
    });
  } catch (error) {
    res.status(400).json({
      code: 400,
      message: error.message,
    });
  }
};
