#!/usr/bin/env node
const path = require("path");
const currPath = process.cwd();

const yargs = require("yargs")
  .option("port", {
    type: "number",
    alias: "p",
    default: 3000,
    describe: "The port to bind on"
  })
  .option("config", {
    type: "string",
    alias: "c",
    default: path.resolve(__dirname, "..", "transformium.config.js"),
    describe: "The path to the config file"
  })
  .option("api-config-path", {
    type: "string",
    alias: "ac",
    default: path.resolve(__dirname, "..", "configs"),
    describe: "The path to the `apiConfig` file path"
  }).argv;

process.env.SERVER_PORT = yargs.port;
process.env.CONFIG_PATH = path.resolve(currPath, String(yargs.config));
process.env.API_CONFIG_PATH_INFO = path.resolve(
  currPath,
  String(yargs.apiConfigPath)
);

require("./transformium");
