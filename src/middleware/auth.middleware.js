const jwt = require("jsonwebtoken");
const { error } = require("../utils/response");
const User = require("../models/user.model");

module.exports = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return error(res, 401, "请提供有效的token");
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      return error(res, 401, "请提供有效的token");
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findByPk(decoded.id, {
        attributes: { exclude: ["password"] },
      });
      if (!user) {
        return error(res, 401, "用户不存在");
      }
      req.user = user;
      next();
    } catch (err) {
      return error(res, 401, "token已过期或无效");
    }
  } catch (err) {
    error(res, 500, err.message);
  }
};
