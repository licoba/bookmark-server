const { Sequelize } = require("sequelize");
console.log("初始化 Sequelize 配置...");

const sequelize = new Sequelize({
  database: process.env.DB_NAME,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: 3306,
  dialect: "mysql",
  dialectModule: require("mysql2"),
  logging: (msg) => console.log(`[SQL] ${msg}`),
  define: {
    timestamps: true,
    underscored: true,
  },
});

sequelize.authenticate().catch((err) => {
  console.error("数据库连接失败:", err.message);
  process.exit(1);
});

console.log("数据库配置完成");
module.exports = sequelize;
