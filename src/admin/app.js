const type = process.env.WEB_SITE

const config = {
  locales: [
    // 'ar',
    // 'fr',
    // 'cs',
    // 'de',
    // 'dk',
    // 'es',
    // 'he',
    // 'id',
    // 'it',
    // 'ja',
    // 'ko',
    // 'ms',
    // 'nl',
    // 'no',
    // 'pl',
    // 'pt-BR',
    // 'pt',
    // 'ru',
    // 'sk',
    // 'sv',
    // 'th',
    // 'tr',
    // 'uk',
    // 'vi',
    // 'zh-Hans',
    // 'zh',
    'zh-Hans'
  ],
  translations: {
    "zh-Hans": {
      "app.components.HomePage.welcomeBlock.content.again":
        "app.js里面也可以自定义文本   这里也是可以自定义的-./node_modules/node_modules/@strapi/admin/admin/src/translations/en.json",
    },
    en: {
      "app.components.LeftMenu.navbrand.title": `${type} Dashboard`,
      "app.components.LeftMenu.navbrand.workplace": `${type} Workplace`,
      "Auth.form.welcome.title": `Welcome to ${type}!`,
      "Auth.form.welcome.subtitle": `Log in to your ${type} account`,
    },
  }
};

const bootstrap = (app) => {
  console.log(app);
};

export default {
  config,
  bootstrap,
};
