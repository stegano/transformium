const express = require("express");
const app = express();
const paths = require("../lib/paths");

const {
  transformiumBoot,
  addRoute,
  removeRoute
} = require("../lib/transformium");

const tfConfig = require(paths.configFile);
const apiRouter = express.Router();

app
  .disable("x-powered-by")
  .use("/api", apiRouter)
  .all((req, res) => {
    res.status(404);
  })
  .listen(process.env.SERVER_PORT || tfConfig.port, () => {
    transformiumBoot(apiRouter);
    tfConfig.appLoaders.forEach(
      ({ options = {}, path = null, module = () => null }) => {
        // When the `appLoader` is execute, pass `options`, `setApiConfig` and `unsetApiConfig` functions as arguments.
        app.use(path, module(options, setApiConfig, unsetApiConfig));
      }
    );
  });

/**
 * @param {object} apiConfig
 * @returns {express.Router}
 * */
function setApiConfig(apiConfig) {
  const { method, path } = apiConfig.endpoint;
  unsetApiConfig(method, path);
  return addRoute(apiRouter, apiConfig);
}

/**
 * @param {string} method
 * @param {string} path
 * @returns {express.Router}
 * */
function unsetApiConfig(method, path) {
  return removeRoute(apiRouter, method, path);
}
