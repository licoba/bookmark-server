const sequelize = require("../config/database");
const { DataTypes } = require("sequelize");

// 定义分类模型
const Category = sequelize.define("Category", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING(50),
    allowNull: false,
  },
});

// 定义网站模型
const Website = sequelize.define("Website", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  title: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  url: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
});

// 定义关联关系
Category.hasMany(Website);
Website.belongsTo(Category);

// 初始化数据库
async function initDatabase() {
  try {
    console.log("开始同步数据库模型...");
    console.log("已定义的模型:", Object.keys(sequelize.models));

    // 同步所有模型到数据库
    await sequelize.sync();
    console.log("数据库模型同步完成");

    // 检查是否需要创建初始数据
    const categoryCount = await Category.count();
    if (categoryCount === 0) {
      console.log("创建初始分类数据...");
      await Category.bulkCreate([
        { name: "常用工具" },
        { name: "学习资源" },
        { name: "开发文档" },
        { name: "娱乐休闲" },
      ]);
      console.log("初始分类数据创建完成");
    } else {
      console.log(`数据库中已有 ${categoryCount} 个分类`);
    }

    console.log("数据库初始化成功");
  } catch (error) {
    console.error("数据库初始化失败:", error);
    throw error;
  }
}

module.exports = {
  sequelize,
  Category,
  Website,
  initDatabase,
};
