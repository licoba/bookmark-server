exports.success = (res, data = null, message = "操作成功") => {
  res.json({
    code: 0,
    message,
    data,
  });
};

exports.error = (res, status = 500, message = "操作失败", code = status) => {
  res.status(status).json({
    code,
    message,
    data: null,
  });
};

exports.created = (res, data = null, message = "创建成功") => {
  res.status(201).json({
    code: 0,
    message,
    data,
  });
};

exports.unauthorized = (res, message = "未授权") => {
  res.status(401).json({
    code: 401,
    message,
    data: null,
  });
};

exports.forbidden = (res, message = "禁止访问") => {
  res.status(403).json({
    code: 403,
    message,
    data: null,
  });
};

exports.notFound = (res, message = "资源不存在") => {
  res.status(404).json({
    code: 404,
    message,
    data: null,
  });
};
