require("dotenv").config();
const express = require("express");
const { initDatabase } = require("./src/models");
const cors = require("cors");

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const siteController = require("./src/controllers/site.controller");
const categoryController = require("./src/controllers/category.controller");
const websiteController = require("./src/controllers/website.controller");

app.get("/api/sites", siteController.getAllSites);
app.post("/api/sites", siteController.createSite);
app.get("/api/sites/category/:category", siteController.getSitesByCategory);

app.get("/api/categories", categoryController.getAllCategories);
app.post("/api/categories", categoryController.createCategory);

app.get("/api/websites", websiteController.getWebsites);
app.post("/api/websites", websiteController.createWebsite);

app.get("/test", (req, res) => {
  res.json({ message: "API 服务器正常运行" });
});

async function startServer() {
  try {
    console.log("正在启动服务器...");
    console.log("环境变量检查:", {
      DB_HOST: process.env.DB_HOST,
      DB_NAME: process.env.DB_NAME,
      PORT: port,
    });

    // 初始化数据库
    console.log("开始初始化数据库...");
    await initDatabase();

    app.listen(port, () => {
      console.log("=================================");
      console.log(`服务器成功运行在端口 ${port}`);
      console.log("=================================");
    });
  } catch (error) {
    console.error("服务器启动失败:", error);
    process.exit(1);
  }
}

// 未捕获的异常处理
process.on("uncaughtException", (error) => {
  console.error("未捕获的异常:", error);
});

process.on("unhandledRejection", (error) => {
  console.error("未处理的 Promise 拒绝:", error);
});

startServer();
