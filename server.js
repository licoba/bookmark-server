require("dotenv").config();
const express = require("express");
const sequelize = require("./src/config/database");
const cors = require("cors");
const errorHandler = require("./src/middleware/error.middleware");
const { error } = require("./src/utils/response");
const swaggerUi = require("swagger-ui-express");
const specs = require("./src/config/swagger");
const fileUpload = require("express-fileupload");

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 配置文件上传中间件
app.use(
  fileUpload({
    limits: {
      fileSize: 5 * 1024 * 1024, // 限制5MB
    },
    abortOnLimit: true,
    responseOnLimit: "文件大小不能超过 5MB",
    createParentPath: true,
    useTempFiles: true,
    tempFileDir: "/tmp/",
    debug: process.env.NODE_ENV === "development",
    parseNested: true,
    preserveExtension: true,
    safeFileNames: true,
    uploadTimeout: 0,
  })
);

// API 文档路由 - 确保在其他路由之前
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(specs, {
    explorer: true,
    swaggerOptions: {
      docExpansion: "none",
      filter: true,
      showRequestDuration: true,
      persistAuthorization: true,
    },
  })
);

// 导入路由
const siteRoutes = require("./src/routes/site.routes");
const categoryRoutes = require("./src/routes/category.routes");
const authRoutes = require("./src/routes/auth.routes");
const bookmarkRoutes = require("./src/routes/bookmark.routes");

app.use("/api/sites", siteRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/bookmarks", bookmarkRoutes);

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
      console.log(`API 文档地址: http://localhost:${port}/api-docs`);
      console.log("=================================");
    });
  } catch (error) {
    console.error("服务器启动失败:", error);
    process.exit(1);
  }
}

startServer();
