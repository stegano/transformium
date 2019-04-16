const merge = require("lodash.merge");
const urlParser = require("url");
const request = require("request");
const paths = require("./paths");
const workerPool = require("workerpool");

const { logger, hasRequiredApiConfigProperties } = require("./utils.js");

const worker = workerPool.pool();
const tfConfig = require(paths.configFile);

/**
 * Add endpoint to the express route using the information entered in apiConfig.
 * If a duplicate endpoint is entered, it will throw an error.
 *
 * @param {express.Router} router
 * @param {object} apiConfig
 * @returns {express.Router}
 * */
function addRoute(router, apiConfig) {
  const { endpoint, apis, handler } = apiConfig;
  const { method, path } = endpoint;
  const _method = method.toLowerCase();

  // Verify that the same endpoint already exists.
  if (
    router.stack.some(layer => {
      if (!layer) {
        return false;
      }
      const { route } = layer;
      return !!route && route.path === path && route.methods[_method];
    })
  ) {
    throw Error("Duplicate endpoint already exists.");
  }

  // Add route to the express
  router[_method](path, async (req, res) => {
    const apiPromises = [];
    const executeTime = Date.now();

    // Request the specified Apis
    apis.forEach(
      ({ method, url, headers = {}, timeout = tfConfig.apiTimeout }) => {
        let _url = typeof url === "function" ? url(path).toString() : url;
        const { host } = urlParser.parse(_url);

        req.headers = Object.assign({}, req.headers, headers);
        req.headers.host = host;

        apiPromises.push(
          new Promise(resolve => {
            req.pipe(
              request[method](
                _url,
                {
                  gzip: true,
                  timeout: Math.min(timeout, tfConfig.apiTimeout)
                },
                (err, response) => {
                  resolve(err || response);
                }
              )
            );
          })
        );
      }
    );

    try {
      const result = await worker
        .exec(handler, [await Promise.all(apiPromises), tfConfig.helper])
        .timeout(tfConfig.handlerTimeout);
      const tookApis = Date.now() - executeTime;
      const { headers, body, status } = merge(
        {},
        {
          headers: {},
          body: null,
          status: 200
        },
        result instanceof Promise ? await result : result
      );

      if (!!tfConfig.debug) {
        headers["X-Transformium-Debug-Took-APIs"] = tookApis + "ms";
        headers["X-Transformium-Debug-Took-Parser"] =
          Date.now() - executeTime - tookApis + "ms";
      }

      res
        .status(status)
        .set(headers)
        .send(typeof body === "number" ? body.toString() : body);
    } catch (err) {
      // If an error occurs during parsing, return status 503.
      res.status(err instanceof workerPool.Promise.TimeoutError ? 408 : 503);
      res.send(
        tfConfig.debug
          ? {
              errorStack: err.stack,
              handler: handler.toString(),
              took: Date.now() - executeTime
            }
          : null
      );
    }
  });

  return router;
}

/**
 * Remove the endpoint from the registered `express`.
 *
 * @param {express.Router} router
 * @param {string} method
 * @param {string} path
 * @returns {express.Router}
 * */
function removeRoute(router, method, path) {
  if (!!path && !!method) {
    router.stack = router.stack.filter(
      ({ route }) => route && !(route.path === path && route.methods[method])
    );
  }
  return router;
}

/**
 * Read the `transformium.config.js` configuration file,
 * load the registered configuration information, and run the loader module.
 *
 * @param {express.Router} router
 * @returns {Promise<express.Router>}
 * */
async function transformiumBoot(router) {
  const { apiConfigs, apiConfigLoaders } = tfConfig;

  apiConfigs.forEach(apiConfig => {
    if (typeof apiConfig === "object") {
      // If apiConfig type is object, object is apiConfig
      if (!hasRequiredApiConfigProperties(apiConfig)) {
        logger.warn(
          "Required property was not entered. Check the configuration file."
        );
        return null;
      }
      addRoute(router, apiConfig /** apiConfig */);
    }
  });

  apiConfigLoaders.forEach(({ module, options }) => {
    module.call(
      null,
      options,
      apiConfig => addRoute(router, apiConfig),
      (method, path) => removeRoute(router, method, path)
    );
  });

  return router;
}

module.exports = {
  addRoute,
  removeRoute,
  transformiumBoot
};
