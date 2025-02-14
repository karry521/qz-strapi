module.exports = {
  apps: [
    {
      name: "forensics-server",
      cwd: "/var/www/forensics-server",
      script: "strapi-loader.js",
      exec_interpreter: "node",
      instances: "1",
      exec_mode: "cluster",
      env: {
        NODE_ENV: "production",
      },
    },
  ],
};
