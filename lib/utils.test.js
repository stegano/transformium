const {
  hasRequiredApiConfigProperties,
  getDefaultApiConfig,
  genApiConfig
} = require("./utils.js");

describe("Test `hasRequiredApiConfigProperties`", () => {
  test("Enough full `apiConfig` Properties", () => {
    const apiConfig = {
      endpoint: {
        method: "GET",
        path: "/test"
      }
    };
    expect(hasRequiredApiConfigProperties(apiConfig)).toBe(true);
  });

  test("Missing `apiConfig.endpoint`", () => {
    const apiConfig = {};
    expect(hasRequiredApiConfigProperties(apiConfig)).toBe(false);
  });

  test("Missing `apiConfig.endpoint.method` properties", () => {
    const apiConfig = {
      endpoint: {
        method: "test"
      }
    };
    expect(hasRequiredApiConfigProperties(apiConfig)).toBe(false);
  });

  test("Missing `apiConfig.endpoint.path` properties", () => {
    const apiConfig = {
      endpoint: {
        path: "test"
      }
    };
    expect(hasRequiredApiConfigProperties(apiConfig)).toBe(false);
  });
});

describe("Test `genApiConfig`", () => {
  test("Set to the properties in the `apiConfigString`", () => {
    const apiConfig = genApiConfig(
      JSON.stringify({
        endpoint: {
          method: "POST",
          path: "/test"
        }
      })
    );
    expect(apiConfig.endpoint.method).toBe("POST");
    expect(apiConfig.endpoint.path).toBe("/test");
  });

  test("Missing the `apiConfigString`", () => {
    const apiConfig = genApiConfig();
    const defaultApiConfig = getDefaultApiConfig();

    delete apiConfig.handler;
    delete defaultApiConfig.handler;

    expect(defaultApiConfig).toEqual(apiConfig);
  });
});
