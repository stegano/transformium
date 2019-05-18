const express = require("express");
const path = require("path");
const ip = require("ip");
const sha1 = require("sha1");

const utils = require("../lib/utils");

/**
 * Stores configurations in memory while the app is running.
 * If you want to keep your configurations, save to file storage.
 * */
const apiConfigs = {};

function Management({ allowIp = [":::1"] }, setApiConfig, unsetApiConfig) {
  const managementRouter = express.Router();
  managementRouter
    .use((req, res, next) => {
      // If it is not included in the `allowIp` list, it will not allow access.
      const clientIpv4 = req.ip.match(/(\d{1,3}\.){3}\d{1,3}/g) || [];
      const _clientIp = clientIpv4.length ? clientIpv4[0] : req.ip;
      if (
        !allowIp.some(allowIp =>
          allowIp.includes("/")
            ? ip.cidrSubnet(allowIp).contains(_clientIp)
            : ip.isEqual(allowIp, _clientIp)
        )
      ) {
        res.status(403).send();
        return null;
      }
      next();
    })
    .use(express.static(path.resolve(__dirname, "..", "public")))
    .post("/configs", (req, res) => {
      try {
        const { apiConfigString } = req.body;
        const apiConfig = utils.genApiConfig(apiConfigString);

        setApiConfig(apiConfig);

        const { method, path } = apiConfig.endpoint;
        const apiConfigId = genApiConfigId(method, path);

        apiConfigs[apiConfigId] = {
          method,
          path
        };

        res.send({
          status: 200,
          message: "Settings have been successfully added."
        });
      } catch (error) {
        res.send({
          status: 503,
          message: error.message
        });
      }
    })
    .put("/configs", (req, res) => {
      try {
        const { apiConfigString } = req.body;
        const apiConfig = utils.genApiConfig(apiConfigString);

        const { method, path } = apiConfig.endpoint;
        const apiConfigId = genApiConfigId(method, path);

        if (apiConfigId in apiConfigs) {
          setApiConfig(apiConfig);
        } else {
          res.send({
            status: 503,
            message: "The setting data to be changed does not exist."
          });
        }

        res.send({
          status: 200,
          message: "Settings have been successfully modified."
        });
      } catch (error) {
        res.send({
          status: 503,
          message: error.message
        });
      }
    })
    .delete("/configs", async (req, res) => {
      try {
        const { method, path } = req.body;
        unsetApiConfig(method, path);

        const apiConfigId = genApiConfigId(method, path);

        delete apiConfigs[apiConfigId];

        res.send({
          status: 200,
          message: "Settings have been successfully removed."
        });
      } catch (error) {
        res.send({
          status: 503,
          message: error.message
        });
      }
    })
    .get("/configs", async (req, res) => {
      const keys = Object.keys(apiConfigs);
      res.send(
        keys.map(apiConfigId => {
          return {
            id: apiConfigId,
            data: {
              ...apiConfigs[apiConfigId]
            }
          };
        })
      );
    });

  return managementRouter;
}

function genApiConfigId(method, path) {
  return sha1(method + "__" + path);
}

module.exports = Management;
