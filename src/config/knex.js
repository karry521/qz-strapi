const strapiOptions = {
  client: "mysql2",
  connection: {
    host: process.env.DATABASE_HOST,
    port: process.env.DATABASE_PORT,
    user: process.env.DATABASE_USERNAME,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
    // timezone: 'UTC',
    // timezone: 'Asia/Shanghai',
    dateStrings: true,
  },
  acquireConnectionTimeout: 60000, // 连接超时
  asyncStackTraces: false,
  log: {
    warn(message) {
      console.log("[knex warn]", message);
    },
    error(message) {
      console.log("[knex error]", message);
    },
    deprecate(message) {
      console.log("[knex deprecate]", message);
    },
    debug(message) {
      console.log("[knex debug]", message);
    },
  },
};

const knex = require("knex");

const strapiDb = knex(strapiOptions);
module.exports = strapiDb;
