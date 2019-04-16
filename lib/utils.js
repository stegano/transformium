const safeEval = require("safe-eval");
const merge = require("lodash.merge");
const winston = require("winston");

const { format, createLogger, transports } = winston;
const { combine, timestamp, prettyPrint, json } = format;

const winstonLogger = createLogger({
  level: "info",
  format: combine(json(), timestamp(), prettyPrint()),
  defaultMeta: { service: "transformium" },
  transports: [new transports.Console()]
});

const logger = {
  /**
   * @param {string} message
   * @param {string} level
   * */
  log(message, level = "silly") {
    winstonLogger.log({
      level,
      message
    });
  },
  /**
   * @param {string} message
   * */
  info(message) {
    this.log(message, "info");
  },
  /**
   * @param {string} message
   * */
  warn(message) {
    this.log(message, "warn");
  },
  /**
   * @param {string} message
   * */
  error(message) {
    this.log(message, "function error");
  }
};

/**
 * @param {object} apiConfig
 * @returns {boolean}
 * */
function hasRequiredApiConfigProperties(apiConfig) {
  if (!!apiConfig && !!apiConfig.endpoint) {
    const { endpoint } = apiConfig;
    const requiredProperties = ["method", "path"];
    return requiredProperties.every(propertyName => !!endpoint[propertyName]);
  } else {
    return false;
  }
}

/**
 * @param {object} [apiConfig]
 * @returns The default `apiConfig` structure
 * */
function getDefaultApiConfig(apiConfig) {
  return merge(
    {
      endpoint: {
        method: "get",
        path: "/"
      },
      apis: [],
      handler: () => {
        return {
          headers: {},
          body: null,
          status: 422
        };
      }
    },
    apiConfig
  );
}

/**
 * Use safe-eval to make the apiConfig string JSON.
 * See https://www.npmjs.com/package/safe-eval
 *
 * @param {string} apiConfigString
 * @returns {object}
 * */
function genApiConfig(apiConfigString) {
  return merge(
    {},
    getDefaultApiConfig(),
    safeEval(apiConfigString, {
      Promise,
      module,
      setTimeout
    })
  );
}

module.exports = {
  logger,
  hasRequiredApiConfigProperties,
  genApiConfig,
  getDefaultApiConfig
};
