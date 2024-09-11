const exampleController = require("../controllers/exampleController");
const { authMiddleware, roleMiddleware, cacheMiddleware, wsAuthMiddleware } = require("../middleware");

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
    authMiddleware,
    roleMiddleware(["user", "admin"]),
    exampleController.refactoreMe1
  );
  router.post(
    "/refactore-me-2",
    authMiddleware,
    roleMiddleware(["user", "admin"]),
    exampleController.refactoreMe2
  );
  router.ws('/callme',
    (ws, req, next) => {
      wsAuthMiddleware(ws, req, () => {
        exampleController.callmeWebSocket(ws, req);
      });
    }
  );

  router.get(
    "/get-data",
    authMiddleware,
    roleMiddleware(["admin"]),
    cacheMiddleware.cacheMiddlewareFunction,
    exampleController.getData,
    cacheMiddleware.setCacheMiddlewareFunction(),
  );
  app.use("/api/data", router);
};
