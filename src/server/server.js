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

    // 모든 그룹 목록 가져오기
    if (req.method === 'GET' && req.url === '/groups') {
        fs.readFile(groupsFilePath, 'utf8', (err, data) => {
            if (err) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'Internal Server Error' }));
                return;
            }

            const groups = JSON.parse(data); // 그룹 데이터 가져오기
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(groups)); // 그룹 데이터를 응답으로 보내기
        });
    }
    // 특정 그룹 가져오기
    else if (req.method === 'GET' && req.url.startsWith('/groups/')) {
        const groupId = req.url.split('/')[2]; // 그룹 ID 추출
        fs.readFile(groupsFilePath, 'utf8', (err, data) => {
            if (err) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'Internal Server Error' }));
                return;
            }

            const groups = JSON.parse(data);
            const group = groups.find(g => g.id === groupId); // 해당 그룹 찾기

            if (!group) {
                res.writeHead(404, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'Group not found' }));
                return;
            }

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(group));
        });
    }
    // 새로운 그룹 생성
    else if (req.method === 'POST' && req.url === '/groups') {
        let body = '';

        req.on('data', chunk => {
            body += chunk.toString();
        });

        req.on('end', () => {
            const newGroup = JSON.parse(body); // 새로운 그룹 정보

            fs.readFile(groupsFilePath, 'utf8', (err, data) => {
                if (err) {
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ message: 'Internal Server Error' }));
                    return;
                }

                let groups = data ? JSON.parse(data) : [];
                groups.push(newGroup); // 새로운 그룹을 배열에 추가

                fs.writeFile(groupsFilePath, JSON.stringify(groups, null, 2), 'utf8', err => {
                    if (err) {
                        res.writeHead(500, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ message: 'Internal Server Error' }));
                        return;
                    }

                    res.writeHead(201, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify(newGroup));
                });
            });
        });
    }
    // 그룹에 채널 추가 (채널 자체를 별도로 저장하지 않고 그룹 내에 저장)
    else if (req.method === 'POST' && req.url.startsWith('/groups/')) {
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

    } 
    // 사용자 등록
    else if (req.method === 'POST' && req.url === '/signup') {
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

    } 
    // 로그인
    else if (req.method === 'POST' && req.url === '/login') {
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

    } 
    // 사용자 목록 조회 (email 쿼리 파라미터로 사용자 조회)
    else if (req.method === 'GET' && req.url.startsWith('/users')) {
        const url = new URL(req.url, `http://${req.headers.host}`);
        const email = url.searchParams.get('email');  // 이메일 쿼리 파라미터 추출

        fs.readFile(usersFilePath, 'utf8', (err, data) => {
            if (err && err.code !== 'ENOENT') {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'Internal Server Error' }));
                return;
            }

            const users = data ? JSON.parse(data) : [];
            if (email) {
                const user = users.find(u => u.email === email);
                if (user) {
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify(user));
                } else {
                    res.writeHead(404, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ message: 'User not found' }));
                }
            } else {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(users));
            }
        });
    }
    // 사용자 정보 업데이트
    else if (req.method === 'PUT' && req.url.startsWith('/users/')) {
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

    } 
    // 그룹 삭제
    else if (req.method === 'DELETE' && req.url.startsWith('/groups/')) {
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
