const chokidar = require("chokidar");
const fs = require("fs-extra");

const {
  logger,
  hasRequiredApiConfigProperties,
  genApiConfig
} = require("./utils.js");

const ROUTE_PATH_ID_SEPARATOR = "_";

const _filePaths = {};

/**
 * @returns {object}
 * */
function getFilePaths() {
  return Object.assign({}, _filePaths);
}

/**
 * @param routePathId
 * @returns {object}
 * */
function getRouteInfo(routePathId) {
  const sigIndex = routePathId.indexOf(ROUTE_PATH_ID_SEPARATOR);
  const method = routePathId.slice(0, sigIndex);
  const path = routePathId.slice(sigIndex + 1);
  return {
    method,
    path
  };
}

/**
 * @param {string} method
 * @param {string} path
 * @returns {string}
 * */
function getRoutePathId(method, path) {
  return method + ROUTE_PATH_ID_SEPARATOR + path;
}

/**
 * @param {string} filePath
 * @returns {Promise<object>}
 * */
async function readApiConfigFile(filePath) {
  // Read the file as a string
  const apiConfigString = (await fs.readFile(filePath)).toString();
  return genApiConfig(apiConfigString);
}

/**
 * @param {object} options
 * @param {function} setApiConfig
 * @param {function} unsetApiConfig
 * */
function ApiConfigFileLoader({ filePaths = [] }, setApiConfig, unsetApiConfig) {
  if (!filePaths.length) {
    logger.warn(`The file path is empty.`);
    return;
  }

  filePaths.forEach(filePath => {
    // When the file changes, read the changed file and update the new information.
    chokidar.watch(filePath).on("all", async (event, filePath) => {
      switch (event) {
        case "add":
        case "change": {
          const routePathId = _filePaths[filePath];
          // To change the configuration file, Must first remove the path that was added
          if (event === "change" && !!routePathId) {
            const { method, path } = getRouteInfo(routePathId);
            unsetApiConfig(method, path);
            logger.info(
              `${filePath} - Endpoint \`${method} ${path}\` has been removed.`
            );
            delete _filePaths[filePath];
          }

          let apiConfig = null;

          try {
            // Run safety JS with the sandbox.
            apiConfig = await readApiConfigFile(filePath);
          } catch (e) {
            logger.error(e);
            return;
          }

          if (!hasRequiredApiConfigProperties(apiConfig)) {
            logger.warn(
              `${filePath} - Required property was not entered. Check the configuration file.`
            );
            return;
          }

          const { method, path } = apiConfig.endpoint;

          // If the route path has already been added, ignore it.
          try {
            setApiConfig(apiConfig);
          } catch (e) {
            logger.warn(e);
          }

          logger.info(
            `${filePath} - Endpoint \`${method.toUpperCase()} ${path}\` has been added.`
          );

          _filePaths[filePath] = getRoutePathId(method, path);

          break;
        }
        case "unlink": {
          const routePathId = _filePaths[filePath];

          if (!routePathId) {
            return;
          }

          const { method, path } = getRouteInfo(routePathId);

          unsetApiConfig(method, path);
          logger.info(
            `${filePath} - Endpoint \`${method.toUpperCase()} ${path}\` has been added.`
          );
          delete _filePaths[filePath];
          break;
        }
      }
    });
  });
}

module.exports = { ApiConfigFileLoader, getFilePaths };
