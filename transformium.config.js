const merge = require("lodash.merge");
const paths = require("./lib/paths");
const { ApiConfigFileLoader } = require("./lib/ApiConfigFileLoader");
const managementApp = require("./apps/Management");

module.exports = {
  /**
   * If the `debug` flag is enabled, it will be passed to the HTTP header
   * or response with additional information for debug.
   * */
  debug: true,
  // Run the app using the `Transformium` port information.
  port: 3000,
  /**
   * The `handlerTimeout` option is the time at which the handler function can be executed.
   * If a particular handler function occupies a long period of CPU, server performance may be degraded.
   * */
  handlerTimeout: 1000,
  // The time to wait for a response from the backend API.
  /**
   * The time to wait for a response from the backend API.
   * While waiting for a response from the backend API, the process is not blocked and can handle other responses.
   * */
  apiTimeout: 3000,
  /**
   * When the handler function is executed, it is executed in the sandbox
   * so that the node api can not be accessed for security reasons.
   * If you want to load another module, you can use the `helper` option to inject the module
   * and use it as an argument in the handler function.
   *  */
  helper: {
    merge
  },
  /**
   * Use Loader to load the `ApiConfig` configuration information.
   * If necessary, you can implement the loader directly.
   * */
  apiConfigLoaders: [
    // The file loader detects the `ApiConfig` file change in the specified path and reflects it in the configuration.
    {
      options: {
        filePaths: [paths.apiConfigPath]
      },
      module: ApiConfigFileLoader
    }
  ],
  /**
   * appLoader loads app router implemented with `express`.
   * The result of the implemented module must be `express.Router`.
   * When the app module is executed, `options`, `setApiConfig` and `unsetApiConfig` are passed as arguments.
   * */
  appLoaders: [
    {
      options: {
        allowIp: [":::1"]
      },
      path: "/management",
      module: managementApp
    }
  ],
  /**
   * The `apiConfig` setting can also be done in `apiConfigs` field in `transformium.config.js` .
   * Use `apiConfigLoader` to configure if possible. This setting is not reflected until the app is restarted.
   * */
  apiConfigs: [
    {
      endpoint: {
        method: "get",
        path: "/test"
      },
      apis: [],
      handler: (_, helper) => {
        return {
          body:
            "Hello, this configuration will not be reflected in your app until you restart it, even if you edit it."
        };
      }
    }
  ]
};
