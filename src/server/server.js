const http = require('http');
const fs = require('fs');
const path = require('path');

const usersFilePath = path.join(__dirname, 'users.json');
const groupsFilePath = path.join(__dirname, 'groups.json');

const server = http.createServer((req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
   
    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    // Handle GET requests
    if (req.method === 'GET') {
        if (req.url.startsWith('/users')) {
            fs.readFile(usersFilePath, 'utf8', (err, data) => {
                if (err) {
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ message: 'Internal Server Error' }));
                    return;
                }
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(data);
            });
        } else if (req.url.startsWith('/groups')) {
            fs.readFile(groupsFilePath, 'utf8', (err, data) => {
                if (err) {
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ message: 'Internal Server Error' }));
                    return;
                }
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(data);
            });
        } else {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Not Found' }));
        }
    }

    // Handle POST requests
    else if (req.method === 'POST') {
        if (req.url === '/signup') {
            let body = '';
            req.on('data', chunk => { body += chunk.toString(); });
            req.on('end', () => {
                const newUser = JSON.parse(body);
                fs.readFile(usersFilePath, 'utf8', (err, data) => {
                    if (err && err.code !== 'ENOENT') {
                        res.writeHead(500, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ message: 'Internal Server Error' }));
                        return;
                    }
                    const users = data ? JSON.parse(data) : [];
                    users.push(newUser);
                    fs.writeFile(usersFilePath, JSON.stringify(users, null, 2), 'utf8', err => {
                        if (err) {
                            res.writeHead(500, { 'Content-Type': 'application/json' });
                            res.end(JSON.stringify({ message: 'Internal Server Error' }));
                            return;
                        }
                        res.writeHead(201, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify(newUser));
                    });
                });
            });
        }

        else if (req.url === '/login') {
            let body = '';
            req.on('data', chunk => { body += chunk.toString(); });
            req.on('end', () => {
                const { email, password } = JSON.parse(body);
                fs.readFile(usersFilePath, 'utf8', (err, data) => {
                    if (err) {
                        res.writeHead(500, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ message: 'Internal Server Error' }));
                        return;
                    }
                    const users = JSON.parse(data);
                    const user = users.find(u => u.email === email && u.password === password);
                    if (user) {
                        res.writeHead(200, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify(user));
                    } else {
                        res.writeHead(401, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ message: 'Unauthorized' }));
                    }
                });
            });
        }
    }

    // Handle DELETE requests
    else if (req.method === 'DELETE') {
        if (req.url.startsWith('/users/')) {
            const userId = req.url.split('/')[2];
            fs.readFile(usersFilePath, 'utf8', (err, data) => {
                if (err) {
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ message: 'Internal Server Error' }));
                    return;
                }
                let users = JSON.parse(data);
                users = users.filter(u => u.id !== userId);
                fs.writeFile(usersFilePath, JSON.stringify(users, null, 2), 'utf8', err => {
                    if (err) {
                        res.writeHead(500, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ message: 'Internal Server Error' }));
                        return;
                    }
                    res.writeHead(204);
                    res.end();
                });
            });
        }

        else if (req.url.startsWith('/groups/')) {
            const groupId = req.url.split('/')[2];
            fs.readFile(groupsFilePath, 'utf8', (err, data) => {
                if (err) {
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ message: 'Internal Server Error' }));
                    return;
                }
                let groups = JSON.parse(data);
                groups = groups.filter(g => g.id !== groupId);
                fs.writeFile(groupsFilePath, JSON.stringify(groups, null, 2), 'utf8', err => {
                    if (err) {
                        res.writeHead(500, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ message: 'Internal Server Error' }));
                        return;
                    }
                    res.writeHead(204);
                    res.end();
                });
            });
        }
    }

    // Handle PUT requests
    else if (req.method === 'PUT') {
        if (req.url.startsWith('/users/')) {
            const userId = req.url.split('/')[2];
            let body = '';
            req.on('data', chunk => { body += chunk.toString(); });
            req.on('end', () => {
                const updatedUser = JSON.parse(body);
                fs.readFile(usersFilePath, 'utf8', (err, data) => {
                    if (err) {
                        res.writeHead(500, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ message: 'Internal Server Error' }));
                        return;
                    }
                    let users = JSON.parse(data);
                    users = users.map(u => u.id === userId ? updatedUser : u);
                    fs.writeFile(usersFilePath, JSON.stringify(users, null, 2), 'utf8', err => {
                        if (err) {
                            res.writeHead(500, { 'Content-Type': 'application/json' });
                            res.end(JSON.stringify({ message: 'Internal Server Error' }));
                            return;
                        }
                        res.writeHead(200, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify(updatedUser));
                    });
                });
            });
        }

        else if (req.url.startsWith('/groups/')) {
            const groupId = req.url.split('/')[2];
            let body = '';
            req.on('data', chunk => { body += chunk.toString(); });
            req.on('end', () => {
                const updatedGroup = JSON.parse(body);
                fs.readFile(groupsFilePath, 'utf8', (err, data) => {
                    if (err) {
                        res.writeHead(500, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ message: 'Internal Server Error' }));
                        return;
                    }
                    let groups = JSON.parse(data);
                    groups = groups.map(g => g.id === groupId ? updatedGroup : g);
                    fs.writeFile(groupsFilePath, JSON.stringify(groups, null, 2), 'utf8', err => {
                        if (err) {
                            res.writeHead(500, { 'Content-Type': 'application/json' });
                            res.end(JSON.stringify({ message: 'Internal Server Error' }));
                            return;
                        }
                        res.writeHead(200, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify(updatedGroup));
                    });
                });
            });
        }
    }

    // Handle unknown methods
    else {
        res.writeHead(405, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Method Not Allowed' }));
    }
});

server.listen(3000, () => {
    console.log('서버가 포트 3000에서 실행 중입니다.');
});
