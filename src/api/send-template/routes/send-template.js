'use strict';

/**
 * send-template router
 */

const { createCoreRouter } = require('@strapi/strapi').factories;

module.exports = createCoreRouter('api::send-template.send-template');
