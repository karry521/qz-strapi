const {
  decodeJwtToken,
  createJwtToken,
} = require("@strapi/admin/server/services/token");

module.exports = (config, { strapi }) => {
  return async (context, next) => {
    let { header, body, query } = context.request;

    if (typeof header.authorization == "undefined") {
      context.body = {
        code: 401,
        msg: "authentication fail",
      };
      return;
    }

    let { payload } = decodeJwtToken(
      header.authorization.split(" ")[1] ||
      header.authorization.split("+")[1] ||
      header.authorization
    );
    if (payload == null) {
      context.body = {
        code: 1004,
        msg: "Login expired",
      };
      return;
    }
    body.tokenId = payload.id;
    query.tokenId = payload.id;

    return next();
  };
};
