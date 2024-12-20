# 导航站后端项目

这是一个使用 Node.js 和 Express 框架开发的导航站后端项目，提供网站收藏和分类管理功能。

## 技术栈

- **Node.js** - 运行环境
- **Express** - Web 框架
- **MySQL** - 数据库
- **Sequelize** - ORM框架
- **JWT** - 用户认证
- **其他核心依赖**:
  - cors - 跨域资源共享
  - helmet - 安全中间件
  - morgan - HTTP 请求日志
  - bcryptjs - 密码加密
  - dotenv - 环境变量管理

## 项目设置

### 前置要求

- Node.js (建议 v14+)
- MySQL (建议 v5.7+)
- npm 或 yarn

### 安装步骤

1. 克隆项目 
```
bash
git clone [项目地址]
cd navigation-backend
```

2. 安装依赖
```
npm install
```


3. 配置环境变量
- 复制 `.env.example` 到 `.env`
- 修改数据库配置和其他必要设置

4. 创建数据库

```
sql
CREATE DATABASE navigation_site;
```

## API 文档

项目提供了两种方式查看 API 文档：

1. 在线文档
   - 启动服务器后访问：`http://localhost:3000/api-docs`
   - 支持在线调试接口

2. 导出文档
   ```bash
   # 生成文档
   npm run docs

   # 监听文件变化并自动更新文档
   npm run docs:watch
   ```

## 开发环境

```bash
# 安装依赖
npm install

# 初始化数据库
npm run init-db

# 启动开发服务器
npm run dev
```

访问 http://localhost:3000/api-docs 查看 API 文档
