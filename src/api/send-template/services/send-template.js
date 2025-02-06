'use strict';

/**
 * send-template service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::send-template.send-template');
