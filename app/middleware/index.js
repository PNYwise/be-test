const { authMiddleware } = require("./authMiddleware");
const cacheMiddleware = require("./cacheMiddleware");
const exampleMiddleware = require("./exampleMiddleware");
const { roleMiddleware } = require("./roleMiddleware");
const { wsAuthMiddleware } = require("./wsAuthMiddleware");

module.exports = {
  exampleMiddleware,
  cacheMiddleware,
  authMiddleware,
  roleMiddleware,
  wsAuthMiddleware,
};
