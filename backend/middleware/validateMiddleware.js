
const { validationResult } = require("express-validator");

exports.validate = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    res.status(400);
    return next(new Error(errors.array().map((e) => e.msg).join(", ")));
  }

  next();
};
