require("dotenv").config();
const { initDatabase } = require("../models");

const init = async () => {
  try {
    process.env.DB_INIT = "true";
    await initDatabase();
    console.log("数据库初始化成功");
    process.exit(0);
  } catch (err) {
    console.error("数据库初始化失败:", err.message);
    process.exit(1);
  }
};

init();
