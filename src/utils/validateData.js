const Joi = require("joi");

const ruleMap = {
  require: (schema) => schema.required(),
  optional: (schema) => schema.optional(),
  string: (schema) => schema.string(),
  number: (schema) => schema.number(),
  email: (schema) => schema.email(),
  integer: (schema) => schema.integer(),
  date: (schema) => schema.date(),
  iso: (schema) => schema.iso(),
  allowNull: (schema) => schema.allow(null),
  empty: (schema) => schema.empty(""),
  min: (value) => (schema) => schema.min(value),
  max: (value) => (schema) => schema.max(value),
  disallowNullAndEmpty: (schema) => schema.required().disallow(null, ""),
};

const getTypeSchema = (type) => {
  switch (type) {
    case "string":
      return Joi.string();
    case "number":
      return Joi.number();
    case "date":
      return Joi.date();
    default:
      return Joi.any();
  }
};

const applyRules = (rules) => {
  if (!rules || rules.length === 0) {
    return Joi.any();
  }

  let schema = getTypeSchema(rules[0]);

  rules.slice(1).forEach((rule) => {
    if (typeof rule === "string" && ruleMap[rule]) {
      schema = ruleMap[rule](schema);
    } else if (Array.isArray(rule) && rule.length > 0) {
      const [ruleName, ...args] = rule;
      if (ruleMap[ruleName]) {
        schema = ruleMap[ruleName](...args)(schema);
      }
    }
  });

  return schema;
};

const createSchema = (validationDefinition) => {
  const schemaObject = Object.fromEntries(
    Object.entries(validationDefinition).map(([field, rules]) => [
      field,
      applyRules(rules),
    ])
  );
  return Joi.object(schemaObject);
};

const validateData = (data, validationDefinition, shouldFilter = true) => {
  const schema = createSchema(validationDefinition);

  // 动态设置 Joi 的 stripUnknown 选项
  const { error, value } = schema.validate(data, {
    abortEarly: false,
    allowUnknown: !shouldFilter, // 如果不过滤，允许未知字段
    stripUnknown: shouldFilter, // 根据 shouldFilter 决定是否删除未知字段
  });

  if (error) {
    const errorMessages = error.details.map((detail) => detail.message);
    return {
      code: 10001,
      check: true,
      // message: "Invalid parameters",
      message: "Invalid parameters",
      data: { error: errorMessages },
    };
  }

  return value;
};

module.exports = validateData;

// const validationDefinition = {
//   email: ["string", "require", "email"],
// };
// const inputData = {
//   email: "asf135",
//   password:"46546"
// };

// const result = validateData(inputData, validationDefinition);
// 不过滤多余参数
// const result = validateData(inputData, validationDefinition,true);
