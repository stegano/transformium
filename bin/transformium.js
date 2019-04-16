const express = require("express");
const app = express();
const paths = require("../lib/paths");

const { transformiumBoot } = require("../lib/transformium");

const tfConfig = require(paths.configFile);
const apiRouter = express.Router();

app
  .disable("x-powered-by")
  .use("/api", apiRouter)
  .all((req, res) => {
    res.status(404);
  })
  .listen(process.env.SERVER_PORT || tfConfig.port, () =>
    transformiumBoot(apiRouter)
  );
