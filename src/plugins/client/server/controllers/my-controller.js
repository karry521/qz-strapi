'use strict';

module.exports = ({ strapi }) => ({
  index(ctx) {
    ctx.body = strapi
      .plugin('custom-homepage')
      .service('myService')
      .getWelcomeMessage();
  },
});
