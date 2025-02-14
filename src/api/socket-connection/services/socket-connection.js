'use strict';

/**
 * socket-connection service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::socket-connection.socket-connection');
