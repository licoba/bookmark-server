const sequelize = require("../config/database");
const Site = require("./site.model");
const Category = require("./category.model");
const Website = require("./website.model");
const User = require("./user.model");
const fs = require("fs").promises;
const path = require("path");

// 定义模型关联关系
Category.hasMany(Website);
Website.belongsTo(Category);

// 初始化样本数据
const initSampleData = async () => {
  try {
    // 读取样本数据
    const sampleData = JSON.parse(
      await fs.readFile(
        path.join(__dirname, "../data/sample-data.json"),
        "utf8"
      )
    );

    // 创建分类
    await Category.bulkCreate(sampleData.categories);
    console.log("分类数据初始化完成");

    // 创建站点
    await Site.bulkCreate(sampleData.sites);
    console.log("站点数据初始化完成");

    console.log("样本数据初始化完成");
  } catch (error) {
    console.error("样本数据初始化失败:", error);
  }
};

const initDatabase = async () => {
  try {
    // 检查数据库连接
    await sequelize.authenticate();
    console.log("数据库连接成功");

    // 检查是否需要初始化表结构
    const shouldInit = process.env.DB_INIT === "true";

    if (shouldInit) {
      console.log("开始初始化数据库表...");
      await sequelize.sync({ force: true }); // 强制重建表
      console.log("数据库表初始化完成");

      // 创建样本数据
      await initSampleData();
    } else {
      // 仅验证表结构
      await sequelize.sync({ alter: false });
      console.log("数据库表结构验证完成");
    }
  } catch (error) {
    console.error("数据库初始化失败:", error);
    throw error;
  }
};

module.exports = {
  sequelize,
  Site,
  Category,
  Website,
  User,
  initDatabase,
};
