const http = require('http');
const { MongoClient } = require('mongodb');
const setupSocket = require('./socket');

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

    const server = http.createServer(async (req, res) => {
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
        
            try {
                const group = await db.collection('groups').findOne({ id: groupId });
                
                if (!group) {
                    res.writeHead(404, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ message: 'Group not found' }));
                    return;
                }
        
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(group));
            } catch (error) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'Internal Server Error' }));
            }
        }
        
        



   // 새로운 그룹 생성
  // 새로운 그룹 생성
else if (req.method === 'POST' && req.url === '/groups') {
    let body = '';

    req.on('data', chunk => {
        body += chunk.toString();
    });

    req.on('end', async () => {
        try {
            const newGroup = JSON.parse(body);

            // 새로운 그룹 생성 시 MongoDB의 _id 필드를 자동 생성하도록 설정
            if (newGroup._id) {
                delete newGroup._id;  // _id 필드가 존재할 경우 삭제하여 자동 생성
            }
            newGroup.pendingUsers = [];  // pendingUsers 필드 초기화
            newGroup.members = [];  // 정식 멤버 목록 초기화
            // 그룹 생성 및 저장
            const result = await db.collection('groups').insertOne(newGroup);

            // 삽입된 그룹의 정보를 가져오기 위해 다시 한 번 조회
            const insertedGroup = await db.collection('groups').findOne({ _id: result.insertedId });

            // 그룹이 저장된 후, 생성한 사용자의 groups 필드에 그룹 추가
            const createdBy = newGroup.createdBy;
            if (createdBy) {
                await db.collection('users').updateOne(
                    { id: createdBy },
                    { $push: { groups: { id: insertedGroup.id, name: insertedGroup.name, description: insertedGroup.description } } }
                );
            }

            res.writeHead(201, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(insertedGroup));  // 생성된 그룹 반환
        } catch (error) {
            console.error('Error inserting group:', error);
            if (!res.headersSent) {  // 응답 헤더가 전송되지 않았을 때만 응답을 전송
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'Internal Server Error' }));
            }
        }
    });
}

    
    //모든 그룹 가져오기
    else if (req.method === 'GET' && req.url === '/groups') {
        try {
            const groups = await db.collection('groups').find({}).toArray();
            console.log('Groups data:', groups);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(groups));
        } catch (error) {
            console.error('Error reading groups data:', error);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Internal Server Error' }));
        }
    }
    
    //그룹에 채널 추가
// 그룹에 채널 추가
    else if (req.method === 'POST' && req.url.startsWith('/groups/')) {
        const groupId = req.url.split('/')[2];
        let body = '';

        req.on('data', chunk => {
            body += chunk.toString();
        });

        req.on('end', async () => {
            try {
                const newChannel = JSON.parse(body);

                // _id 필드가 있을 경우 삭제하여 MongoDB가 자동 생성하도록 함
                delete newChannel._id;

                const result = await db.collection('groups').updateOne(
                    { id: groupId }, // groupId로 그룹 식별
                    { $push: { channels: newChannel } }, // 새로운 채널 추가
                    { $push: { pendingUsers: userId } }
                );

                if (result.matchedCount === 0) {
                    res.writeHead(404, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ message: 'Group not found' }));
                    return;
                }

                res.writeHead(201, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'Channel added successfully', group: groupId }));
            } catch (error) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'Internal Server Error' }));
            }
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
    
    // 그룹에 사용자를 초대하는 라우트
    else if (req.method === 'POST' && req.url.endsWith('/invite')) {
        console.log("helloo");
        const groupId = req.url.split('/')[2]; // 그룹 ID 추출
        let body = '';
    
        req.on('data', chunk => {
            body += chunk.toString();
        });
    
        req.on('end', async () => {
            const { userId } = JSON.parse(body);
            console.log('Invite user to group:', { groupId, userId }); // 요청 데이터 로그 출력
    
            try {
                const groupUpdateResult = await db.collection('groups').updateOne(
                    { id: groupId },
                    { $push: { pendingUsers: userId } } // 초대할 유저 추가
                );
    
                console.log('groupUpdateResult:', groupUpdateResult); // 업데이트 결과 로그 출력
    
                if (groupUpdateResult.matchedCount === 0) {
                    res.writeHead(404, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ message: 'Group not found' }));
                    return;
                }
    
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'User invited successfully' }));
            } catch (error) {
                console.error('Error inviting user:', error); // 서버 로그에 에러 출력
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'Internal Server Error', error: error.toString() }));
            }
        });
    }
    
        // 그룹 요청 승인
       // 그룹 요청 승인
// 가입 승인 처리
    else if (req.method === 'PUT' && req.url.startsWith('/groups/approve/')) {
        const groupId = req.url.split('/')[3]; // 그룹 ID 추출
        let body = '';

        req.on('data', chunk => {
            body += chunk.toString();
        });

        req.on('end', async () => {
            const { userId } = JSON.parse(body); // 사용자 ID 가져오기

            try {
                // 그룹에서 사용자의 가입 요청 승인 처리
                const group = await db.collection('groups').findOne({ id: groupId });
                if (!group) {
                    res.writeHead(404, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ message: 'Group not found' }));
                    return;
                }

                // 그룹 업데이트: pendingUsers에서 제거하고 members에 추가
                const groupUpdateResult = await db.collection('groups').updateOne(
                    { id: groupId },
                    {
                        $pull: { pendingUsers: userId },
                        $push: { members: userId }
                    }
                );

                if (groupUpdateResult.matchedCount === 0) {
                    res.writeHead(404, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ message: 'Group not found' }));
                    return;
                }

                // 사용자 문서에 그룹 정보 추가
                const userUpdateResult = await db.collection('users').updateOne(
                    { id: userId },
                    { $push: { groups: { id: group.id, name: group.name, description: group.description, createdBy: group.createdBy, channels: group.channels, imageUrl: group.imageUrl, pendingUsers: group.pendingUsers } } }
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



    // 그룹 요청 거절
    else if (req.method === 'PUT' && req.url.startsWith('/groups/reject/')) {
        const parts = req.url.split('/'); // URL을 '/'로 분할
        const groupId = parts.length > 3 ? parts[3] : null; // 그룹 ID 추출

        // 그룹 ID가 유효한지 확인
        if (!groupId) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: '그룹 ID가 필요합니다.' }));
            return;
        }

        let body = '';
        req.on('data', chunk => {
            body += chunk.toString(); // 본문 데이터를 수신
        });

        req.on('end', async () => {
            const { userId } = JSON.parse(body); // JSON으로 파싱하여 userId 가져오기

            try {
                const result = await db.collection('groups').updateOne(
                    { id: groupId },
                    { $pull: { pendingUsers: userId } }
                );

                if (result.matchedCount === 0) {
                    res.writeHead(404, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ message: '그룹을 찾을 수 없습니다.' }));
                    return;
                }

                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: '가입 요청이 거절되었습니다.' }));
            } catch (error) {
                console.error('가입 요청 거절 중 오류 발생:', error);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: '서버 오류가 발생했습니다.' }));
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
                    { $pull: { pendingUsers: userId },
                    $push: { members: userId } 
                }
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
    

    
    else if (req.method === 'GET' && req.url === '/users') {
        console.log('Received GET request for /users');
    
        try {
            const users = await db.collection('users').find({}).toArray();
            console.log('Users from DB:', users);  // 조회된 데이터를 확인
    
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(users));
        } catch (error) {
            console.error('Database error:', error);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Internal Server Error' }));
        }
    }

    else if (req.method === 'GET' && req.url.startsWith('/users')) {
    console.log('Received GET request for /users with email query');

    try {
        // URL에서 email 값을 추출 (URLSearchParams 사용)
        const url = new URL(req.url, `http://${req.headers.host}`);
        const email = url.searchParams.get('email');

        if (!email) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ message: 'Email query parameter is missing' }));
        }

        // 이메일을 기반으로 사용자 검색
        const user = await db.collection('users').findOne({ email: email });
        console.log('User from DB:', user);  // 조회된 사용자 데이터 확인

        if (user) {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(user));  // 단일 사용자 정보 반환
        } else {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'User not found' }));
        }
    } catch (error) {
        console.error('Database error:', error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Internal Server Error' }));
    }
}

        // 채널에 새로운 메시지 추가하기
    else if (req.method === 'POST' && req.url === '/messages') {
        let body = '';

        req.on('data', chunk => {
            body += chunk.toString();
        });

        req.on('end', async () => {
            try {
                const newMessage = JSON.parse(body);

                // 메시지 필수 필드가 있는지 확인
                const { channelId, userId, message } = newMessage;
                if (!channelId || !userId || !message) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ message: 'Missing required fields: channelId, userId, message' }));
                    return;
                }

                // MongoDB에 메시지 저장
                const result = await db.collection('messages').insertOne({
                    channelId,
                    userId,
                    message,
                    timestamp: new Date()
                });

                res.writeHead(201, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'Message saved successfully', messageId: result.insertedId }));
            } catch (error) {
                console.error('메시지 저장 중 오류 발생:', error);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'Internal Server Error' }));
            }
        });
    }

    // 특정 채널의 모든 메시지 가져오기
    else if (req.method === 'GET' && req.url.startsWith('/messages')) {
        try {
            // URL에서 channelId 값을 추출 (URLSearchParams 사용)
            const url = new URL(req.url, `http://${req.headers.host}`);
            const channelId = url.searchParams.get('channelId');

            if (!channelId) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                return res.end(JSON.stringify({ message: 'channelId query parameter is missing' }));
            }

            // 특정 채널의 메시지를 모두 가져오기
            const messages = await db.collection('messages').find({ channelId: channelId }).toArray();
            
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(messages));
        } catch (error) {
            console.error('메시지 가져오기 중 오류 발생:', error);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Internal Server Error' }));
        }
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
    // 사용자 삭제 요청 처리
    else if (req.method === 'DELETE' && req.url.startsWith('/users/')) {
        const userId = req.url.split('/')[2]; // URL에서 사용자 ID 추출
        try {
            const result = await db.collection('users').deleteOne({ id: userId }); // 사용자 삭제

            if (result.deletedCount === 0) {
                res.writeHead(404, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: '사용자를 찾을 수 없습니다.' }));
                return;
            }

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: `User with ID ${userId} deleted successfully` }));
        } catch (error) {
            console.error('사용자 삭제 중 오류 발생:', error);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: '서버 오류가 발생했습니다.' }));
        }
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
    

setupSocket(server, db);

    const PORT = 3000;
    server.listen(PORT, () => {
        console.log(`Server running at http://localhost:${PORT}`);
    });

}

startServer();
