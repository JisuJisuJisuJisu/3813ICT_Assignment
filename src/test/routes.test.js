const request = require('supertest');
const express = require('express');
const { MongoClient } = require('mongodb');
const http = require('http');
const cors = require('cors');
const multer = require('multer');
const { PeerServer } = require('peer');
const assert = require('assert');

// Create a new express application for testing
const app = express();
app.use(express.json());
app.use(cors());

// MongoDB connection
const uri = "mongodb://localhost:27017";
const client = new MongoClient(uri);
let db;
let server;

// Set up the server for testing
before(async () => {
    await client.connect();
    db = client.db('s5310537');

    // Set up routes
    app.post('/signup', async (req, res) => {
        const newUser = req.body;
        newUser.interestGroups = [];
        const result = await db.collection('users').insertOne(newUser);
        res.status(201).json(newUser);
    });

    app.post('/login', async (req, res) => {
        const { email, password } = req.body;
        const user = await db.collection('users').findOne({ email, password });
        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }
        res.status(200).json({ message: 'Login successful', user });
    });

    app.get('/groups', async (req, res) => {
        const groups = await db.collection('groups').find({}).toArray();
        res.status(200).json(groups);
    });

    // Start the HTTP server
    server = http.createServer(app);
    const peerServer = PeerServer({ port: 9002, path: '/peerjs' });
    peerServer.listen(() => {
        console.log('PeerJS server is running on http://localhost:9002');
    });
    server.listen(3001, () => {
        console.log('Test server is running on http://localhost:3001');
    });
});

// Close the database connection and server after tests
after(async () => {
    await client.close();
    server.close();
});

// Test cases
describe('API Routes', () => {
    describe('POST /signup', () => {
        it('should create a new user', async () => {
            const newUser = {
                id: 'user123',
                email: 'test@example.com',
                password: 'password123',
                username: 'testuser',
            };

            const res = await request(server).post('/signup').send(newUser);
            assert.strictEqual(res.status, 201);
            assert.strictEqual(res.body.email, newUser.email);
        });
    });

    describe('POST /login', () => {
        it('should login a user with valid credentials', async () => {
            const credentials = {
                email: 'test@example.com',
                password: 'password123'
            };

            const res = await request(server).post('/login').send(credentials);
            assert.strictEqual(res.status, 200);
            assert.strictEqual(res.body.message, 'Login successful');
        });

        it('should return 401 for invalid credentials', async () => {
            const credentials = {
                email: 'wrong@example.com',
                password: 'wrongpassword'
            };

            const res = await request(server).post('/login').send(credentials);
            assert.strictEqual(res.status, 401);
            assert.strictEqual(res.body.message, 'Invalid email or password');
        });
    });

    describe('GET /groups', () => {
        it('should return all groups', async () => {
            const res = await request(server).get('/groups');
            assert.strictEqual(res.status, 200);
            assert.ok(Array.isArray(res.body)); // Check if response is an array
        });
    });

    // Test for creating a new user
describe('POST /signup', () => {
    it('should create a new user', async () => {
      const newUser = {
        id: 'user123',
        email: 'test@example.com',
        password: 'password123',
        username: 'testuser',
      };
  
      // Send a POST request to the signup route
      const res = await request(server).post('/signup').send(newUser);
  
      // Check if the response status is 201 (Created)
      assert.strictEqual(res.status, 201);
  
      // Check if the email in the response matches the new user's email
      assert.strictEqual(res.body.email, newUser.email);
    });
  });
  
  // Test for logging in a user
  describe('POST /login', () => {
    it('should login a user with valid credentials', async () => {
      const credentials = {
        email: 'test@example.com',
        password: 'password123'
      };
  
      // Send a POST request to the login route
      const res = await request(server).post('/login').send(credentials);
  
      // Check if the response status is 200 (OK)
      assert.strictEqual(res.status, 200);
  
      // Check if the login was successful by verifying the message
      assert.strictEqual(res.body.message, 'Login successful');
    });
  
    it('should return 401 for invalid credentials', async () => {
      const credentials = {
        email: 'wrong@example.com',
        password: 'wrongpassword'
      };
  
      // Send a POST request with invalid credentials
      const res = await request(server).post('/login').send(credentials);
  
      // Check if the response status is 401 (Unauthorized)
      assert.strictEqual(res.status, 401);
  
      // Check if the error message matches 'Invalid email or password'
      assert.strictEqual(res.body.message, 'Invalid email or password');
    });
  });
  
  // Test for fetching all groups
  describe('GET /groups', () => {
    it('should return all groups', async () => {
      // Send a GET request to retrieve all groups
      const res = await request(server).get('/groups');
  
      // Check if the response status is 200 (OK)
      assert.strictEqual(res.status, 200);
  
      // Check if the response body is an array
      assert.ok(Array.isArray(res.body)); // true if the result is an array
    });
  });
  
 

});
