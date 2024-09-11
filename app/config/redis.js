const { createClient } = require('@redis/client');

const redisClient = createClient({
    url: `redis://${process.env.REDIS_HOST || 'localhost'}:${process.env.REDIS_PORT || 6379}`,
    password: process.env.REDIS_PASSWORD || undefined,
});

redisClient.on('error', (err) => {
    console.error('Redis error:', err);
});

redisClient.connect(); // Ensure to connect to Redis server

module.exports = redisClient;