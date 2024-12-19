require("dotenv").config();
const express = require("express");
const sequelize = require("./src/config/database");
const cors = require("cors");
const errorHandler = require("./src/middleware/error.middleware");
const { error } = require("./src/utils/response");

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const siteController = require("./src/controllers/site.controller");
const categoryController = require("./src/controllers/category.controller");
const websiteController = require("./src/controllers/website.controller");
const authController = require("./src/controllers/auth.controller");

// 导入路由
const siteRoutes = require("./src/routes/site.routes");
const categoryRoutes = require("./src/routes/category.routes");
const authRoutes = require("./src/routes/auth.routes");

app.use("/api/sites", siteRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/auth", authRoutes);

app.get("/test", (req, res) => {
  res.json({ message: "API 服务器正常运行" });
});

// 404 处理
app.use((req, res) => {
  error(res, 404, "接口不存在");
});

// 全局错误处理
app.use(errorHandler);

// 未捕获的异常处理
process.on("uncaughtException", (err) => {
  console.error("未捕获的异常:", err);
  process.exit(1);
});

process.on("unhandledRejection", (err) => {
  console.error("未处理的 Promise 拒绝:", err);
  process.exit(1);
});

async function startServer() {
  try {
    console.log("正在启动服务器...");

    // 只检查数据库连接
    await sequelize.authenticate();
    console.log("数据库连接成功");

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

startServer();
