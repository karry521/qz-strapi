module.exports = ({ env }) => [
  'strapi::errors',
  {
    name: 'strapi::cors',
    config: {
      enabled: true,
      origin: ['*'],  // 允许所有来源，或替换为具体的来源
      headers: ['Content-Type', 'Authorization', 'ngrok-skip-browser-warning'], // 允许自定义请求头
    },
  },
  'strapi::poweredBy',
  'strapi::logger',
  'strapi::query',
  'strapi::body',
  'strapi::session',
  'strapi::favicon',
  'strapi::public',
  {
    name: "strapi::security",
    config: {
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          "connect-src": ["'self'", "http:", "https:"],
          "img-src": [
            "'self'",
            "data:",
            "blob:",
            "dl.airtable.com",
            "res.cloudinary.com",
            env("CLOUDFLARE_PUBLIC").replace(/^https?:\/\//, ""),
            "https://image.spyx.com",
            "https://market-assets.strapi.io"
          ],
          "media-src": [
            "'self'",
            "data:",
            "blob:",
            "dl.airtable.com",
            "res.cloudinary.com",
            env("CLOUDFLARE_PUBLIC").replace(/^https?:\/\//, ""),
          ],
          "script-src": ["'self'", "cdn.jsdelivr.net", "blob:", "http://cdn.jsdelivr.net", "https://cdn.jsdelivr.net"],
          "style-src": ["'self'", 'https:', "'unsafe-inline'", "http://cdn.jsdelivr.net", "https://cdn.jsdelivr.net"],
          upgradeInsecureRequests: null,
        },
      },
    },
  }
]