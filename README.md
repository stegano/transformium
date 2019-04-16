# Transformium

[![NPM version](https://img.shields.io/npm/v/transformium.svg)](https://www.npmjs.com/package/transformium)
[![GitHub issues](https://img.shields.io/github/issues-raw/stegano/transformium.svg)](https://github.com/stegano/transformium)
[![Travis](https://img.shields.io/travis/stegano/transformium.svg)](https://travis-ci.org/stegano/transformium)

> Transformium is a simple API proxy server implemented using [Express](https://expressjs.com).
> API proxy configuration can be applied immediately on the running server without restarting.

## Overview

Transformium allows front-end developers to quickly create the necessary APIs or mocking data, or modify the API response data received from the back-end server without modifying the server code directly.

### Installation

The easiest way to install transformium is with [npm](https://www.npmjs.com/).

```bash
$ npm install transformium -g
```

Alternately, download the source.

```bash
$ git clone https://github.com/stegano/transformium.git
```

### Commands

Run the server using the command below.

```bash
$ tf --port 3000 --api-config-path "<apiConfigs path to use>"
```

Then open a browser and access `http://localhost:3000/api/examples/test` to see if the server is running properly.

### ApiConfigLoaders

> ApiConfigLoader is a loader that reflects proxy configuration information to the server.

- You can create a ApiConfigLoader by implementing the module as follows.
  - You can use the `setApiConfig` and `unsetApiConfig` functions, which are passed as arguments, to immediately reflect the API setting information from the loader to the server.

```javascript
function ApiConfigCustomLoader(options, setApiConfig, unsetApiConfig) {
  // ...
}
```

You can load it from `transformium.config.js` as shown below.

```javascript
apiConfigLoaders: [
  {
    options: {
      ...
    },
    module: require("ApiConfigCustomLoader")
  }
]
```

## Why Transformium?

Transformium does not require you to run the server again when adding APIs or modifying response results. You can generate the API by modifying the apiConfig file and implementing the handler function, or you can modify the API response of the existing back-end server. The handler function running on the Transformium server is designed to be inaccessible to the Node API in the handler function because it is executed in the sandbox using safe-eval. Therefore, APIConfig configuration information can be safely processed even if the user inputs it.

## Contributors

This project exists thanks to all the people who contribute.
<a href="https://github.com/stegano/transforminum/graphs/contributors"><img src="https://opencollective.com/transforminum/contributors.svg?width=890" /></a>
