const Category = require("../models/category.model");
const Site = require("../models/site.model");
const { success, error, created } = require("../utils/response");
const cheerio = require("cheerio");
const sequelize = require("../config/database");

// 在文件开头添加这个初始化函数
async function initializeDatabase() {
  try {
    await sequelize.query("ALTER TABLE Sites MODIFY COLUMN icon TEXT;");
    console.log("成功修改 icon 列类型为 TEXT");
  } catch (err) {
    // 如果列已经是 TEXT 类型，会报错，我们可以忽略这个错误
    console.log("icon 列可能已经是 TEXT 类型");
  }
}

// 在服务启动时调用一次
initializeDatabase();

/**
 * @swagger
 * /bookmarks/import:
 *   post:
 *     tags: [书签迁移]
 *     summary: 导入Chrome书签
 *     description: 导入Chrome导出的书签HTML文件
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: Chrome书签HTML文件
 *     responses:
 *       201:
 *         description: 导入成功
 *         content:
 *           application/json:
 *             example:
 *               code: 0
 *               message: "Chrome书签导入成功"
 *               data: {
 *                 categories: 5,
 *                 sites: 20
 *               }
 */
exports.importBookmarks = async (req, res) => {
  try {
    if (!req.files || !req.files.file) {
      return error(res, 400, "请上传书签文件");
    }

    // 检查文件内容
    const file = req.files.file;
    console.log("文件信息:", {
      name: file.name,
      size: file.size,
      mimetype: file.mimetype,
      encoding: file.encoding,
      tempFilePath: file.tempFilePath,
    });

    // 尝试不同的方式读取文件内容
    let bookmarkHtml;
    if (file.tempFilePath) {
      // 如果有临时文件路径，从文件读取
      const fs = require("fs");
      bookmarkHtml = fs.readFileSync(file.tempFilePath, "utf8");
    } else if (Buffer.isBuffer(file.data)) {
      // 如果是 Buffer，直接转换
      bookmarkHtml = file.data.toString("utf8");
    } else if (typeof file.data === "string") {
      // 如果已经是字符串
      bookmarkHtml = file.data;
    } else {
      console.error("无法识别的文件数据格式:", typeof file.data);
      return error(res, 400, "无法读取文件内容");
    }

    if (!bookmarkHtml || bookmarkHtml.length === 0) {
      console.error("文件内容为空");
      console.error("文件数据类型:", typeof file.data);
      console.error("文件数据长度:", file.data ? file.data.length : 0);
      return error(res, 400, "文件内容为空");
    }

    console.log("解析书签文件...");
    console.log("文件内容前500个字符:", bookmarkHtml.substring(0, 500));

    // 检查文件内容是否包含必要的标记
    if (!bookmarkHtml.includes("NETSCAPE-Bookmark-file-1")) {
      console.error("不是有效的书签文件格式");
      return error(res, 400, "不是有效的书签文件格式");
    }

    // 使用更宽松的解析选项
    const $ = cheerio.load(bookmarkHtml, {
      xml: false, // 改为 false，因为这是 HTML
      decodeEntities: true, // 解码 HTML 实体
      normalizeWhitespace: true, // 规范化空白
      lowerCaseTags: true,
      lowerCaseAttributeNames: true,
    });

    // 解析书签数据
    const categories = new Set();
    const sites = [];

    // 递归处理嵌套的文件夹结构
    function processFolder($elem, parentCategory = null) {
      if (!$elem || !$elem.length) {
        console.log("无效的元素，跳过处理");
        return;
      }

      console.log("处理文件夹, 父分类:", parentCategory);
      const html = $elem.html();
      console.log("当前元素HTML:", html ? html.substring(0, 100) : "空HTML");

      // 直接查找所有 DT 元素
      $elem.find("dt").each((_, dt) => {
        const $dt = $(dt);
        const $h3 = $dt.children("h3");
        const $dl = $dt.next("dl");
        const $a = $dt.children("a");

        if ($h3.length > 0) {
          // 这是一个文件夹
          const category = $h3.text().trim();
          console.log("找到分类:", category);

          if (category && category !== "书签栏") {
            console.log("添加新分类:", category);
            categories.add({
              name: category,
              description: `从Chrome导入的${category}分类`,
              order: categories.size + 1,
            });

            if ($dl.length > 0) {
              processFolder($dl, category);
            }
          } else if ($dl.length > 0) {
            processFolder($dl, parentCategory);
          }
        } else if ($a.length > 0) {
          // 这是一个书签
          try {
            const url = $a.attr("href");
            const title = $a.text().trim();
            console.log("处理书签:", title, url);

            if (url && url.startsWith("http")) {
              let iconUrl = $a.attr("icon") || "";
              if (!iconUrl) {
                try {
                  const urlObj = new URL(url);
                  iconUrl = `${urlObj.origin}/favicon.ico`;
                } catch (err) {
                  console.error("生成图标URL失败:", err.message);
                  iconUrl = "/favicon.ico";
                }
              }

              // 虽然数据库支持长文本，但我们仍然限制明显无效的长URL
              if (iconUrl.length > 1000) {
                iconUrl = "/favicon.ico";
              }

              sites.push({
                title: title || "未命名书签",
                url: url,
                description: $a.attr("title") || "",
                category: parentCategory || "未分类",
                tags: [],
                icon: iconUrl,
              });
              console.log("添加书签成功:", title);
            }
          } catch (err) {
            console.error("处理书签时出错:", err.message);
          }
        }
      });
    }

    // 从 HTML 文档的根部开始处理
    const $root = $("html");
    console.log("HTML结构:", $.html().substring(0, 200));

    const $rootDl = $root.find("dl").first();
    console.log("根节点是否存在:", $rootDl.length > 0);

    if (!$rootDl.length) {
      console.error("未找到根节点DL");
      return error(res, 400, "无效的书签文件格式");
    }

    processFolder($rootDl);

    console.log(
      `解析完成: 找到 ${categories.size} 个分类, ${sites.length} 个站点`
    );
    console.log(
      "分类列表:",
      Array.from(categories).map((c) => c.name)
    );

    if (categories.size === 0) {
      return error(res, 400, "未找到任何有效的书签分类");
    }

    // 保存到数据库
    console.log("开始保存分类...");
    const categoryPromises = Array.from(categories).map(async (category) => {
      try {
        // 检查分类是否已存在
        const existingCategory = await Category.findOne({
          where: {
            name: category.name,
            userId: req.user.id,
          },
        });

        if (!existingCategory) {
          return Category.create({
            ...category,
            userId: req.user.id,
          });
        } else {
          console.log(`分类 ${category.name} 已存在，跳过创建`);
          return existingCategory;
        }
      } catch (err) {
        console.error(`创建分类 ${category.name} 失败:`, err.message);
        throw err;
      }
    });
    await Promise.all(categoryPromises);

    console.log("开始保存站点...");
    const sitePromises = sites.map(async (site) => {
      try {
        // 检查站点是否已存在
        const existingSite = await Site.findOne({
          where: {
            url: site.url,
            userId: req.user.id,
          },
        });

        if (!existingSite) {
          return Site.create({
            ...site,
            userId: req.user.id,
          });
        } else {
          console.log(`站点 ${site.url} 已存在，跳过创建`);
          return existingSite;
        }
      } catch (err) {
        console.error(`创建站点 ${site.url} 失败:`, err.message);
        throw err;
      }
    });
    await Promise.all(sitePromises);

    created(
      res,
      {
        categories: categories.size,
        sites: sites.length,
      },
      "Chrome书签导入成功"
    );
  } catch (err) {
    console.error("导入书签失败:", err);
    error(res, 500, `导入失败: ${err.message}`);
  }
};

/**
 * @swagger
 * /bookmarks/export:
 *   get:
 *     tags: [书签迁移]
 *     summary: 导出Chrome书签
 *     description: 将书签导出为Chrome格式的HTML文件
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 导出成功
 *         content:
 *           text/html:
 *             schema:
 *               type: string
 *               format: binary
 */
exports.exportBookmarks = async (req, res) => {
  try {
    // 获取所有分类和站点
    const categories = await Category.findAll({
      where: { userId: req.user.id },
      order: [["order", "ASC"]],
    });

    const sites = await Site.findAll({
      where: { userId: req.user.id },
    });

    // 生成Chrome书签HTML
    let html = `
<!DOCTYPE NETSCAPE-Bookmark-file-1>
<META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=UTF-8">
<TITLE>Bookmarks</TITLE>
<H1>Bookmarks</H1>
<DL><p>
    `;

    // 按分类组织书签
    for (const category of categories) {
      const categorySites = sites.filter(
        (site) => site.category === category.name
      );
      if (categorySites.length > 0) {
        html += `
    <DT><H3>${category.name}</H3>
    <DL><p>`;

        for (const site of categorySites) {
          html += `
        <DT><A HREF="${site.url}" ICON="${site.icon}">${site.title}</A>`;
        }

        html += `
    </DL><p>`;
      }
    }

    html += `
</DL><p>`;

    // 设置响应头，让浏览器下载文件
    res.setHeader("Content-Type", "text/html");
    res.setHeader("Content-Disposition", "attachment; filename=bookmarks.html");
    res.send(html);
  } catch (err) {
    error(res, 500, err.message);
  }
};