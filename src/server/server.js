const http = require('http');
const { MongoClient } = require('mongodb');
const uri = "mongodb://localhost:27017";
const client = new MongoClient(uri);

async function startServer() {
    async function connectDB() {
        try {
            await client.connect();
            console.log("MongoDB에 성공적으로 연결되었습니다.");
            return client.db('s5310537'); // MongoDB 데이터베이스를 반환
        } catch (error) {
            console.error('MongoDB 연결 실패:', error);
            return null; // 연결 실패 시 null 반환
        }
    }

    const db = await connectDB();
    if (!db) {
        console.log("데이터베이스 연결 실패. 서버를 시작할 수 없습니다.");
        return;
    }

    const server = http.createServer((req, res) => {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

        if (req.method === 'OPTIONS') {
            res.writeHead(204);
            res.end();
            return;
        }

        // 특정 그룹 가져오기
    else if (req.method === 'GET' && req.url.startsWith('/groups/')) {
        const groupId = req.url.split('/')[2]; // 그룹 ID 추출
        db.collection('groups').findOne({ id: groupId }, (err, group) => {
            if (err) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'Internal Server Error' }));
                return;
            }
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
            const newGroup = JSON.parse(body);
            newGroup.pendingUsers = []; // pendingUsers 필드 초기화
    
            db.collection('groups').insertOne(newGroup, (err, result) => {
                if (err) {
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ message: 'Internal Server Error' }));
                    return;
                }
    
                res.writeHead(201, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(newGroup));
            });
        });
    }
    else if (req.method === 'GET' && req.url === '/groups') {
        db.collection('groups').find({}).toArray((err, groups) => {
            if (err) {
                console.error('Error reading groups data:', err);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'Internal Server Error' }));
                return;
            }
            console.log('Groups data:', groups);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(groups));
        });
    }
    
    
    // 그룹에 채널 추가 (채널 자체를 별도로 저장하지 않고 그룹 내에 저장)
    else if (req.method === 'POST' && req.url.startsWith('/groups/')) {
        const groupId = req.url.split('/')[2];
        let body = '';
    
        req.on('data', chunk => {
            body += chunk.toString();
        });
    
        req.on('end', () => {
            const newChannel = JSON.parse(body);
    
            db.collection('groups').updateOne(
                { id: groupId },
                { $push: { channels: newChannel } },
                (err, result) => {
                    if (err) {
                        res.writeHead(500, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ message: 'Internal Server Error' }));
                        return;
                    }
                    if (result.matchedCount === 0) {
                        res.writeHead(404, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ message: 'Group not found' }));
                        return;
                    }
    
                    res.writeHead(201, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ message: 'Channel added successfully', group: groupId }));
                }
            );
        });
    }
    
    // 가입 요청 처리
    else if (req.method === 'POST' && req.url.startsWith('/groups/')) {
        const groupId = req.url.split('/')[2]; // 그룹 ID 추출
        let body = '';
    
        req.on('data', chunk => {
            body += chunk.toString();
        });
    
        req.on('end', async () => {
            const { userId } = JSON.parse(body); // 사용자 ID 가져오기
    
            try {
                const groupUpdateResult = await db.collection('groups').updateOne(
                    { id: groupId },
                    { $push: { pendingUsers: userId } }
                );
    
                if (groupUpdateResult.matchedCount === 0) {
                    res.writeHead(404, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ message: 'Group not found' }));
                    return;
                }
    
                const userUpdateResult = await db.collection('users').updateOne(
                    { id: userId },
                    { $push: { interestGroups: groupId } }
                );
    
                if (userUpdateResult.matchedCount === 0) {
                    res.writeHead(404, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ message: 'User not found' }));
                    return;
                }
    
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'Join request submitted successfully' }));
            } catch (err) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'Internal Server Error' }));
            }
        });
    }
    

    // 가입 승인 처리
    else if (req.method === 'PUT' && req.url.startsWith('/groups/approve/')) {
        const groupId = req.url.split('/')[2]; // 그룹 ID 추출
        let body = '';
    
        req.on('data', chunk => {
            body += chunk.toString();
        });
    
        req.on('end', async () => {
            const { userId } = JSON.parse(body); // 사용자 ID 가져오기
    
            try {
                // 그룹에서 사용자의 가입 요청 승인 처리
                const groupUpdateResult = await db.collection('groups').updateOne(
                    { id: groupId },
                    { $pull: { pendingUsers: userId } }
                );
    
                if (groupUpdateResult.matchedCount === 0) {
                    res.writeHead(404, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ message: 'Group not found' }));
                    return;
                }
    
                // 사용자 문서에 그룹 추가
                const userUpdateResult = await db.collection('users').updateOne(
                    { id: userId },
                    { $push: { groups: groupId } }
                );
    
                if (userUpdateResult.matchedCount === 0) {
                    res.writeHead(404, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ message: 'User not found' }));
                    return;
                }
    
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'User approved successfully' }));
            } catch (error) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'Internal Server Error', error: error.toString() }));
            }
        });
    }
    
    // 사용자 등록
    else if (req.method === 'POST' && req.url === '/signup') {
        let body = '';
    
        req.on('data', chunk => {
            body += chunk.toString();
            console.log('Receiving data chunk:', chunk.toString()); 
        });
    
        req.on('end', () => {
            const newUser = JSON.parse(body);
            newUser.interestGroups = [];  // 사용자의 관심 그룹 목록 초기화
            console.log('Attempting to register new user:', newUser);
    
            db.collection('users').insertOne(newUser, (err, result) => {
                if (err) {
                    console.error('Database insertion error:', err); 
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ message: 'Internal Server Error' }));
                    return;
                }
                console.log('New user registered successfully:', result);
                res.writeHead(201, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(newUser));
            });
        });
    }
    
    // 로그인
    // 로그인
    else if (req.method === 'POST' && req.url === '/login') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
    
        req.on('end', async () => {  // 비동기 함수로 변경
            try {
                const { email, password } = JSON.parse(body);
                console.log(`Login attempt for email: ${email}, with password: ${password}`);
    
                try {
                    const user = await db.collection('users').findOne({ email: email, password: password });
                    if (!user) {
                        console.log('No user found with that email and password');
                        res.writeHead(401, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ message: 'Invalid email or password' }));
                        return;
                    }
                    
                    console.log('Login successful:', user);
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ message: 'Login successful', user }));
                } catch (dbError) {
                    console.error('Database query error:', dbError);
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ message: 'Internal Server Error', error: dbError.toString() }));
                }
            } catch (parseError) {
                console.error('Error parsing the body:', parseError);
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'Bad request', error: parseError.toString() }));
            }
        });
    }
    

    
    // 사용자 목록 조회
    else if (req.method === 'GET' && req.url === '/users') {
        db.collection('users').find({}).toArray((err, users) => {
            if (err) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'Internal Server Error' }));
                return;
            }
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(users));
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
    
            db.collection('users').updateOne(
                { id: userId },
                { $set: updatedUser },
                (err, result) => {
                    if (err) {
                        res.writeHead(500, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ message: 'Internal Server Error' }));
                        return;
                    }
                    if (result.matchedCount === 0) {
                        res.writeHead(404, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ message: 'User not found' }));
                        return;
                    }
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ message: 'User updated successfully' }));
                }
            );
        });
    }
    
    // 그룹 삭제
    else if (req.method === 'DELETE' && req.url.startsWith('/groups/')) {
        const groupId = req.url.split('/').pop();
    
        db.collection('groups').deleteOne({ id: groupId }, async (err, result) => {
            if (err) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'Internal Server Error' }));
                return;
            }
            if (result.deletedCount === 0) {
                res.writeHead(404, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'Group not found' }));
                return;
            }
    
            // 사용자 문서에서 삭제된 그룹 ID 제거
            await db.collection('users').updateMany(
                { groups: groupId },
                { $pull: { groups: groupId } }
            );
    
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Group and related user data deleted successfully' }));
        });
    }
     else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not Found');
    }
});// 이하의 요청 처리 로직 구현
    

    const PORT = 3000;
    server.listen(PORT, () => {
        console.log(`Server running at http://localhost:${PORT}`);
    });

}

startServer();
