'use strict';

/**
 * socket-connection router
 */

const { createCoreRouter } = require('@strapi/strapi').factories;

module.exports = createCoreRouter('api::socket-connection.socket-connection');
