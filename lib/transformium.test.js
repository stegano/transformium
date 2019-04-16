const express = require("express");
const utils = require("./utils.js");

const { addRoute, removeRoute } = require("./transformium");

describe("Test `addRoute`", () => {
  let router = null;

  beforeEach(() => {
    router = express.Router();
  });

  test("Basic functional verification", () => {
    const apiConfig = utils.getDefaultApiConfig({
      endpoint: {
        method: "post",
        path: "/test"
      }
    });

    const _router = addRoute(router, apiConfig);
    expect(_router.stack.length).toBe(1);

    const _stack = _router.stack[0];
    expect(_stack.route.path).toBe("/test");
    expect(_stack.route.methods["post"]).toBe(true);
  });
});

describe("Test `removeRoute`", () => {
  let router = null;
  const apiConfig = utils.getDefaultApiConfig({
    endpoint: {
      method: "post",
      path: "/test"
    }
  });

  beforeEach(() => {
    router = addRoute(express.Router(), apiConfig);
  });

  test("Basic functional verification", () => {
    const { method, path } = apiConfig.endpoint;
    const _router = removeRoute(router, method, path);
    expect(_router.stack.length).toBe(0);
  });
});
