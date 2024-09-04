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

    // 그룹에 채널 추가 (채널 자체를 별도로 저장하지 않고 그룹 내에 저장)
    if (req.method === 'POST' && req.url.startsWith('/groups/')) {
        const groupId = req.url.split('/')[2]; // 그룹 ID를 URL에서 추출
        let body = '';

        req.on('data', chunk => {
            body += chunk.toString();
        });

        req.on('end', () => {
            const newChannel = JSON.parse(body); // 새로운 채널 정보

            fs.readFile(groupsFilePath, 'utf8', (err, data) => {
                if (err) {
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ message: 'Internal Server Error' }));
                    return;
                }

                let groups = JSON.parse(data);
                const group = groups.find(g => g.id === groupId); // 그룹 찾기

                if (!group) {
                    res.writeHead(404, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ message: 'Group not found' }));
                    return;
                }

                group.channels.push(newChannel); // 채널을 그룹의 채널 목록에 추가

                fs.writeFile(groupsFilePath, JSON.stringify(groups, null, 2), 'utf8', err => {
                    if (err) {
                        res.writeHead(500, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ message: 'Internal Server Error' }));
                        return;
                    }

                    res.writeHead(201, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify(group));
                });
            });
        });

    } else if (req.method === 'POST' && req.url === '/signup') {
        // 사용자 등록
        let body = '';

        req.on('data', chunk => {
            body += chunk.toString();
        });

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

    } else if (req.method === 'POST' && req.url === '/login') {
        // 로그인
        let body = '';

        req.on('data', chunk => {
            body += chunk.toString();
        });

        req.on('end', () => {
            const { email, password } = JSON.parse(body);

            fs.readFile(usersFilePath, 'utf8', (err, data) => {
                if (err && err.code !== 'ENOENT') {
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ message: 'Internal Server Error' }));
                    return;
                }

                const users = data ? JSON.parse(data) : [];
                const user = users.find(u => u.email === email && u.password === password);

                if (user) {
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ message: 'Login successful', user }));
                } else {
                    res.writeHead(401, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ message: 'Invalid email or password' }));
                }
            });
        });

    } else if (req.method === 'GET' && req.url === '/users') {
        // 사용자 목록 조회
        fs.readFile(usersFilePath, 'utf8', (err, data) => {
            if (err && err.code !== 'ENOENT') {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'Internal Server Error' }));
                return;
            }

            const users = data ? JSON.parse(data) : [];
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(users));
        });

    } else if (req.method === 'PUT' && req.url.startsWith('/users/')) {
        // 사용자 정보 업데이트
        const userId = req.url.split('/')[2];
        let body = '';

        req.on('data', chunk => {
            body += chunk.toString();
        });

        req.on('end', () => {
            const updatedUser = JSON.parse(body);

            fs.readFile(usersFilePath, 'utf8', (err, data) => {
                if (err) {
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ message: 'Internal Server Error' }));
                    return;
                }

                let users = JSON.parse(data);
                users = users.map(user => user.id === userId ? updatedUser : user);

                fs.writeFile(usersFilePath, JSON.stringify(users, null, 2), 'utf8', err => {
                    if (err) {
                        res.writeHead(500, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ message: 'Internal Server Error' }));
                        return;
                    }

                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ message: 'User updated successfully' }));
                });
            });
        });

    } else if (req.method === 'DELETE' && req.url.startsWith('/groups/')) {
        // 그룹 삭제
        const groupId = req.url.split('/').pop();

        fs.readFile(groupsFilePath, 'utf8', (err, data) => {
            if (err) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'Internal Server Error' }));
                return;
            }

            let groups = JSON.parse(data);
            const groupIndex = groups.findIndex(group => group.id === groupId);

            if (groupIndex === -1) {
                res.writeHead(404, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'Group not found' }));
                return;
            }

            const deletedGroup = groups.splice(groupIndex, 1)[0];

            fs.writeFile(groupsFilePath, JSON.stringify(groups, null, 2), 'utf8', err => {
                if (err) {
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ message: 'Internal Server Error' }));
                    return;
                }

                // 그룹 삭제 후 사용자 정보에서 해당 그룹 삭제
                fs.readFile(usersFilePath, 'utf8', (err, data) => {
                    if (err) {
                        res.writeHead(500, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ message: 'Internal Server Error' }));
                        return;
                    }

                    let users = JSON.parse(data);
                    users = users.map(user => {
                        user.groups = user.groups.filter(group => group.id !== groupId);
                        return user;
                    });

                    fs.writeFile(usersFilePath, JSON.stringify(users, null, 2), 'utf8', err => {
                        if (err) {
                            res.writeHead(500, { 'Content-Type': 'application/json' });
                            res.end(JSON.stringify({ message: 'Internal Server Error' }));
                            return;
                        }

                        res.writeHead(200, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ message: 'Group and related user data deleted successfully', deletedGroup }));
                    });
                });
            });
        });

    } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not Found');
    }
});

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
