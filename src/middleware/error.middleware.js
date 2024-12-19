const { error } = require("../utils/response");

module.exports = (err, req, res, next) => {
  console.error("错误详情:", {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    body: req.body,
    query: req.query,
    params: req.params,
  });

  // 根据错误类型返回不同的状态码
  if (err.name === "SequelizeValidationError") {
    return error(res, 400, "数据验证失败: " + err.message);
  }

  if (err.name === "SequelizeUniqueConstraintError") {
    return error(res, 400, "数据已存在: " + err.message);
  }

  if (err.name === "JsonWebTokenError") {
    return error(res, 401, "无效的token");
  }

  error(res, 500, "服务器内部错误");
};
