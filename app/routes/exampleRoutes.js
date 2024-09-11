const exampleController = require("../controllers/exampleController");
const cacheMiddleware = require("../middleware/cacheMiddleware");

module.exports = (app) => {
  app.use((req, res, next) => {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  const router = require("express").Router();

  router.get(
    "/refactore-me-1",
    // [exampleMiddleware.exampleMiddlewareFunction],
    exampleController.refactoreMe1
  );
  router.post(
    "/refactore-me-2",
    // [exampleMiddleware.exampleMiddlewareFunction],
    exampleController.refactoreMe2
  );
  router.ws('/callme', exampleController.callmeWebSocket);

  router.get(
    "/get-data",
    cacheMiddleware.cacheMiddlewareFunction,
    exampleController.getData,
    cacheMiddleware.setCacheMiddlewareFunction(),
  );
  app.use("/api/data", router);
};
