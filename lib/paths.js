const path = require("path");

const { API_CONFIG_PATH_INFO, CONFIG_PATH } = process.env;

module.exports = {
  configFile:
    CONFIG_PATH || path.resolve(__dirname, "..", "transformium.config.js"),
  apiConfigPath:
    API_CONFIG_PATH_INFO || path.resolve(__dirname, "..", "configs")
};
