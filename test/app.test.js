const request = require('supertest');
const express = require('express');
const db = require('../app/models');
const axios = require('axios')
const WebSocket = require('ws');



jest.mock('axios');
// Mock the database query
db.sequelize.query = jest.fn()
db.Attack.bulkCreate = jest.fn()

const authMiddleware = jest.fn((req, res, next) => next());
const roleMiddleware = jest.fn((roles) => (req, res, next) => next());
const cacheMiddleware = {
    cacheMiddlewareFunction: jest.fn((req, res, next) => next()),
    setCacheMiddlewareFunction: jest.fn(() => (req, res, next) => next()),
};
const exampleController = require('../app/controllers/exampleController');

const createServer = () => {
    const app = express();
    app.use(express.json());
    require('express-ws')(app);


    app.get(
        '/refactore-me-1',
        authMiddleware,
        roleMiddleware(['user', 'admin']),
        exampleController.refactoreMe1
    );

    app.post(
        '/refactore-me-2',
        authMiddleware,
        roleMiddleware(['user', 'admin']),
        exampleController.refactoreMe2
    );

    app.get(
        '/get-data',
        authMiddleware,
        roleMiddleware(['admin']),
        cacheMiddleware.cacheMiddlewareFunction,
        exampleController.getData,
        cacheMiddleware.setCacheMiddlewareFunction()
    );


    // WebSocket route
    app.ws('/callme', (ws, req, next) => {
        exampleController.callmeWebSocket(ws, req);
    });


    return app;
};

let testApp;
let port = 3001;

beforeAll((done) => {
    const app = createServer();
    testApp = app.listen(port, '0.0.0.0', () => {
        console.log(`Test server running on http://0.0.0.0:${port}`);
        done();
    });
});

afterAll((done) => {
    testApp.close(() => {
        console.log('Test server stopped');
        done();
    });
});





describe('GET /refactore-me-1', () => {
    it('should return 200 with calculated averages divided by 10', async () => {
        // Mock data that would be returned by the query
        const mockData = [
            [
                { values: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] },
                { values: [2, 3, 4, 5, 6, 7, 8, 9, 10, 1] },
                { values: [3, 4, 5, 6, 7, 8, 9, 10, 1, 2] }
            ]
        ];

        db.sequelize.query.mockResolvedValue(mockData);

        // Calculate expected averages, dividing by 10
        const expectedAverages = [
            (1 + 2 + 3) / 10, // Index 0
            (2 + 3 + 4) / 10, // Index 1
            (3 + 4 + 5) / 10, // Index 2
            (4 + 5 + 6) / 10, // Index 3
            (5 + 6 + 7) / 10, // Index 4
            (6 + 7 + 8) / 10, // Index 5
            (7 + 8 + 9) / 10, // Index 6
            (8 + 9 + 10) / 10, // Index 7
            (9 + 10 + 1) / 10, // Index 8
            (10 + 1 + 2) / 10  // Index 9
        ];

        const response = await request(testApp).get('/refactore-me-1');

        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual({
            statusCode: 200,
            success: true,
            data: expectedAverages
        });
    });
});

describe('POST /refactore-me-2', () => {
    it('should return 201 and send survey data successfully', async () => {
        // Mock request body
        const requestBody = {
            id: 1,
            userId: 1,
            values: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
        };

        db.sequelize.query
            .mockResolvedValueOnce([{}]) // For the INSERT query
            .mockResolvedValueOnce([{}]); // For the UPDATE query

        const response = await request(testApp)
            .post('/refactore-me-2')
            .send(requestBody);

        expect(response.statusCode).toBe(201);
        expect(response.body).toEqual({
            statusCode: 201,
            message: "Survey sent successfully!",
            success: true,
            data: requestBody,
        });
    });
});

describe('GET /get-data', () => {
    it('should return 200 with the expected data', async () => {
        db.sequelize.query
            .mockResolvedValueOnce([
                { destinationCountry: 'USA', total: 100 },
                { destinationCountry: 'Canada', total: 50 }
            ])
            .mockResolvedValueOnce([
                { sourceCountry: 'Mexico', total: 70 },
                { sourceCountry: 'Brazil', total: 30 }
            ]);

        const response = await request(testApp)
            .get('/get-data')
            .expect('Content-Type', /json/)
            .expect(200);

        expect(response.body).toEqual({
            success: true,
            statusCode: 200,
            data: {
                label: ['USA', 'Canada', 'Mexico', 'Brazil'],
                total: [100, 50, 70, 30]
            }
        });
    });
});

describe('WebSocket /callme', () => {


    let ws;

    beforeEach(() => {
        jest.clearAllMocks();
        axios.get = jest.fn();
    });

    afterEach(() => {
        if (ws && ws.readyState === WebSocket.OPEN) {
            ws.close();
        }
    });

    it('should fetch data and send it to WebSocket clients', (done) => {
        const mockData = [
            {
                sourceCountry: 'USA',
                destinationCountry: 'UK',
                millisecond: 123456,
                type: 'attack',
                weight: 500,
                attackTime: '2023-09-12T10:00:00Z',
            },
        ];

        // Mock axios.get to return the mock data
        axios.get.mockResolvedValueOnce({ data: mockData });

        ws = new WebSocket(`ws://localhost:${port}/callme`);
        ws.on('open', () => {
            // Test the first message sent to the WebSocket client
            ws.on('message', (message) => {
                const data = JSON.parse(message);

                expect(data).toEqual(mockData);

                // Ensure data is saved to the database
                expect(db.Attack.bulkCreate).toHaveBeenCalledWith(
                    mockData.map(item => ({
                        sourceCountry: item.sourceCountry,
                        destinationCountry: item.destinationCountry,
                        millisecond: item.millisecond,
                        type: item.type,
                        weight: item.weight,
                        attackTime: new Date(item.attackTime),
                    })),
                    { ignoreDuplicates: true }
                );

                done();
            });
        });
    });
});
