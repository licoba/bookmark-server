const User = require("../models/user.model");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { Op } = require("sequelize");
const { success, error, created, unauthorized } = require("../utils/response");

exports.register = async (req, res) => {
  try {
    const { username, password, email } = req.body;

    const existingUser = await User.findOne({
      where: {
        [Op.or]: [{ username }, { email }],
      },
    });

    if (existingUser) {
      return error(
        res,
        400,
        existingUser.username === username ? "用户名已存在" : "邮箱已被注册"
      );
    }

    const user = await User.create({
      username,
      email,
      password: await bcrypt.hash(password, 8),
    });

    success(
      res,
      {
        id: user.id,
        username: user.username,
        email: user.email,
      },
      "注册成功"
    );
  } catch (err) {
    error(res, 400, err.message);
  }
};

exports.login = async (req, res) => {
  try {
    const { account, password } = req.body;

    // 查找用户（支持用户名或邮箱登录）
    const user = await User.findOne({
      where: {
        [Op.or]: [{ username: account }, { email: account }],
      },
    });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return unauthorized(res, "账号或密码错误");
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: "24h",
    });

    success(res, { token, user }, "登录成功");
  } catch (err) {
    error(res, 500, err.message);
  }
};

// 修改密码
exports.changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const userId = req.user.id;

    const user = await User.findByPk(userId);
    if (!user) {
      return error(res, 404, "用户不存在");
    }

    const isValidPassword = await bcrypt.compare(oldPassword, user.password);
    if (!isValidPassword) {
      return error(res, 400, "原密码错误");
    }

    await user.update({
      password: await bcrypt.hash(newPassword, 8),
    });

    success(res, null, "密码修改成功");
  } catch (err) {
    error(res, 500, err.message);
  }
};

// 更新用户信息
exports.updateProfile = async (req, res) => {
  try {
    const { username, email } = req.body;
    const userId = req.user.id;

    const user = await User.findByPk(userId);
    if (!user) {
      return error(res, 404, "用户不存在");
    }

    if (username && username !== user.username) {
      const existingUser = await User.findOne({ where: { username } });
      if (existingUser) {
        return error(res, 400, "用户名已存在");
      }
    }

    if (email && email !== user.email) {
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return error(res, 400, "邮箱已被注册");
      }
    }

    await user.update({
      username: username || user.username,
      email: email || user.email,
    });

    success(
      res,
      {
        id: user.id,
        username: user.username,
        email: user.email,
      },
      "用户信息更新成功"
    );
  } catch (err) {
    error(res, 500, err.message);
  }
};

exports.logout = async (req, res) => {
  try {
    success(res, null, "退出登录成功");
  } catch (err) {
    error(res, 500, err.message);
  }
};
