const User = require("../models/user.model");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { Op } = require("sequelize");
const { success, error, created, unauthorized } = require("../utils/response");
const Category = require("../models/category.model");

/**
 * @swagger
 * /auth/register:
 *   post:
 *     tags: [用户认证]
 *     summary: 用户注册
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 description: 用户名
 *               password:
 *                 type: string
 *                 description: 密码
 *               email:
 *                 type: string
 *                 description: 邮箱
 *             required:
 *               - username
 *               - password
 *               - email
 *     responses:
 *       200:
 *         description: 注册成功
 */
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

    await Category.create({
      userId: user.id,
      name: "未分类",
      description: "默认分类",
      order: 0,
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

/**
 * @swagger
 * /auth/login:
 *   post:
 *     tags: [用户认证]
 *     summary: 用户登录
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               account:
 *                 type: string
 *                 description: 用户名或邮箱
 *               password:
 *                 type: string
 *                 description: 密码
 *             required:
 *               - account
 *               - password
 *     responses:
 *       200:
 *         description: 登录成功
 */
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

/**
 * @swagger
 * /auth/password:
 *   put:
 *     tags: [用户认证]
 *     summary: 修改密码
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               oldPassword:
 *                 type: string
 *                 description: 原密码
 *               newPassword:
 *                 type: string
 *                 description: 新密码
 *             required:
 *               - oldPassword
 *               - newPassword
 *     responses:
 *       200:
 *         description: 修改成功
 *         content:
 *           application/json:
 *             example:
 *               code: 0
 *               message: "密码修改成功"
 *               data: null
 */
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

/**
 * @swagger
 * /auth/profile:
 *   put:
 *     tags: [用户认证]
 *     summary: 更新用户信息
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 description: 新用户名
 *               email:
 *                 type: string
 *                 description: 新邮箱
 *     responses:
 *       200:
 *         description: 更新成功
 *         content:
 *           application/json:
 *             example:
 *               code: 0
 *               message: "用户信息更新成功"
 *               data: {
 *                 id: 1,
 *                 username: "newname",
 *                 email: "new@example.com"
 *               }
 */
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

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     tags: [用户认证]
 *     summary: 退出登录
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 退出成功
 */
exports.logout = async (req, res) => {
  try {
    success(res, null, "退出登录成功");
  } catch (err) {
    error(res, 500, err.message);
  }
};
