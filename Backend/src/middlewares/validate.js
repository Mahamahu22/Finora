const validate = (schema, property = "body") => {
  return (req, res, next) => {
    const { error } = schema.validate(req[property], { abortEarly: false });

    if (error) {
      return res.status(400).json({
        error: "ValidationError",
        details: error.details.map((d) => ({
          message: d.message,
          path: d.path,
        })),
      });
    }

    next();
  };
};

module.exports = validate;
