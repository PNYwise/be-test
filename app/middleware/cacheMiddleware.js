const redisClient = require('../config/redis'); // Import Redis client

const getCache = (key) => {
    return new Promise((resolve, reject) => {
        redisClient.get(key)
            .then(data => resolve(data ? JSON.parse(data) : null))
            .catch(err => {
                console.error('Error getting cache:', err);
                reject(err);
            });
    });
};

const setCache = (key, value, ttl = 3600) => {
    redisClient.setEx(key, ttl, JSON.stringify(value))
        .catch(err => {
            console.error('Error setting cache:', err);
        });
};


const cacheMiddlewareFunction = (req, res, next) => {
    const cacheKey = req.originalUrl
    getCache(req.originalUrl)
        .then(cachedData => {
            if (cachedData) {
                return res.status(200).json(cachedData);
            }
            res.locals.cacheKey = cacheKey
            next();
        })
        .catch(err => {
            console.error('Redis error:', err);
            next();
        });
};

const setCacheMiddlewareFunction = (ttl = 10) => (req, res, next) => {
    if (res.locals.cacheKey && res.locals.cacheData) {
        setCache(res.locals.cacheKey, res.locals.cacheData, ttl);
    }
    next();
};

const cacheMiddleware = {
    cacheMiddlewareFunction,
    setCacheMiddlewareFunction,
};

module.exports = cacheMiddleware;
