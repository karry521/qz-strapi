'use strict';

/**
 * user-log service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::user-log.user-log');
