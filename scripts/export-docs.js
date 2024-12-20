const fs = require("fs");
const path = require("path");
const specs = require("../src/config/swagger");

const outputPath = path.join(__dirname, "../apifox.json");

// 导出为 JSON 文件
fs.writeFileSync(outputPath, JSON.stringify(specs, null, 2));

console.log(`API 文档已导出到: ${outputPath}`);
console.log("您可以将此文件导入到 Apifox 中");
