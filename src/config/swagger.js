const swaggerJsdoc = require("swagger-jsdoc");
const path = require("path");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "导航站 API 文档",
      version: "1.0.0",
      description: "导航站后端接口文档",
    },
    servers: [
      {
        url: "http://localhost:3000/api",
        description: "开发环境",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "请在此输入从登录接口获取的 token",
        },
      },
    },
    security: [
      {
        bearerAuth: [], // 全局应用认证
      },
    ],
  },
  // 修改扫描路径，使用绝对路径
  apis: [
    "./src/controllers/*.js",
    "./src/routes/*.js",
    path.join(__dirname, "../controllers/*.js"),
    path.join(__dirname, "../routes/*.js"),
  ],
};

const specs = swaggerJsdoc(options);
module.exports = specs;
