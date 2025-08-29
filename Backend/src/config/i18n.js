const i18next = require("i18next");
const Backend = require("i18next-fs-backend");
const middleware = require("i18next-http-middleware");
const path = require("path");

i18next
  .use(Backend)
  .use(middleware.LanguageDetector)
  .init({
    fallbackLng: "en",
    preload: ["en", "hi"],
    backend: {
      loadPath: path.join(__dirname, "..", "locale", "{{lng}}", "translation.json")
    },
    detection: { order: ["header", "querystring"], caches: [] },
    returnObjects: true
  });

module.exports = middleware.handle(i18next);
