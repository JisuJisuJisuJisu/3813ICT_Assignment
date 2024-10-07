const express = require('express');
const { MongoClient } = require('mongodb');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const socketIO = require('socket.io');
const http = require('http');
const cors = require('cors');
const setupSocket = require('./socket');
const { ObjectId } = require('mongodb');


const app = express();
const uri = "mongodb://localhost:27017";
const client = new MongoClient(uri);
const server = http.createServer(app); // http 서버 생성
// const io = require('./socket')(server, db); 

app.use(express.json()); // JSON 형식의 요청 본문을 자동으로 파싱
app.use(cors());

// multer 설정 (이미지 저장 경로 및 파일 이름)
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = './uploads/profile-images';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true }); // 폴더가 없으면 생성
        }
        cb(null, uploadDir); // 이미지 파일 저장 경로 설정
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // 파일 이름 설정
    }
});

const upload = multer({ storage });

// MongoDB 연결 함수
async function connectDB() {
    try {
        await client.connect();
        console.log("MongoDB에 성공적으로 연결되었습니다.");
        return client.db('s5310537'); // MongoDB 데이터베이스를 반환
    } catch (error) {
        console.error('MongoDB 연결 실패:', error);
        return null;
    }
}

// 서버 시작 함수
async function startServer() {
    const db = await connectDB();
    if (!db) {
        console.log("데이터베이스 연결 실패. 서버를 시작할 수 없습니다.");
        return;
    }

    // 정적 파일 제공: 이미지 파일 서빙
    app.use('/uploads/profile-images', express.static(path.join(__dirname, 'uploads', 'profile-images')));

    // 여기에 다른 라우트들을 추가해 나갈 거야.
    
        // 모든 그룹 가져오기
    app.get('/groups', async (req, res) => {
        try {
            const groups = await db.collection('groups').find({}).toArray();
            res.status(200).json(groups);  // 그룹 리스트 반환
        } catch (error) {
            console.error('Error reading groups data:', error);
            res.status(500).json({ message: 'Internal Server Error' });
        }
    });

    // 특정 그룹 가져오기
    app.get('/groups/:groupId', async (req, res) => {
        const { groupId } = req.params; // 그룹 ID 추출

        try {
            const group = await db.collection('groups').findOne({ id: groupId });
            
            if (!group) {
                return res.status(404).json({ message: 'Group not found' });
            }

            res.status(200).json(group);  // 그룹 정보 반환
        } catch (error) {
            console.error('Error fetching group:', error);
            res.status(500).json({ message: 'Internal Server Error' });
        }
    });
    // 새로운 그룹 생성
app.post('/groups', async (req, res) => {
    try {
        let newGroup = req.body;

        // MongoDB가 _id를 자동 생성하므로, 수동으로 _id 필드를 삭제
        if (newGroup._id) {
            delete newGroup._id;
        }

        newGroup.pendingUsers = [];  // pendingUsers 필드 초기화
        newGroup.members = [];  // members 필드 초기화

        // 그룹 생성 및 MongoDB에 저장
        const result = await db.collection('groups').insertOne(newGroup);

        // 생성된 그룹 다시 조회
        const insertedGroup = await db.collection('groups').findOne({ _id: result.insertedId });

        // 생성한 사용자의 그룹 리스트에 추가
        const createdBy = newGroup.createdBy;
        if (createdBy) {
            await db.collection('users').updateOne(
                { id: createdBy },
                { $push: { groups: { id: insertedGroup.id, name: insertedGroup.name, description: insertedGroup.description } } }
            );
        }

        // 성공적으로 생성된 그룹 반환
        res.status(201).json(insertedGroup);

    } catch (error) {
        console.error('Error inserting group:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});
        // 모든 그룹 가져오기
app.get('/groups', async (req, res) => {
    try {
        const groups = await db.collection('groups').find({}).toArray();
        res.status(200).json(groups);  // 그룹 리스트 반환
    } catch (error) {
        console.error('Error reading groups data:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// 그룹에 채널 추가
app.post('/groups/:groupId/channels', async (req, res) => {
    const { groupId } = req.params; // URL에서 groupId 추출
    const newChannel = req.body;

    // MongoDB가 _id를 자동 생성하므로, 수동으로 _id 필드를 삭제
    delete newChannel._id;

    try {
        const result = await db.collection('groups').updateOne(
            { id: groupId }, // 그룹을 groupId로 식별
            { $push: { channels: newChannel } } // 새로운 채널 추가
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({ message: 'Group not found' });
        }

        res.status(201).json({ message: 'Channel added successfully', group: groupId });

    } catch (error) {
        console.error('Error adding channel:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// 가입 요청 처리
app.post('/groups/:groupId/join', async (req, res) => {
    const { groupId } = req.params; // 그룹 ID 추출
    const { userId } = req.body; // 사용자 ID 가져오기

    try {
        const groupUpdateResult = await db.collection('groups').updateOne(
            { id: groupId },
            { $push: { pendingUsers: userId } }
        );

        if (groupUpdateResult.matchedCount === 0) {
            return res.status(404).json({ message: 'Group not found' });
        }

        const userUpdateResult = await db.collection('users').updateOne(
            { id: userId },
            { $push: { interestGroups: groupId } }
        );

        if (userUpdateResult.matchedCount === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({ message: 'Join request submitted successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// 그룹에 사용자를 초대하는 라우트
app.post('/groups/:groupId/invite', async (req, res) => {
    const { groupId } = req.params; // 그룹 ID 추출
    const { userId } = req.body; // 사용자 ID 가져오기

    try {
        const groupUpdateResult = await db.collection('groups').updateOne(
            { id: groupId },
            { $push: { pendingUsers: userId } }
        );

        if (groupUpdateResult.matchedCount === 0) {
            return res.status(404).json({ message: 'Group not found' });
        }

        res.status(200).json({ message: 'User invited successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Internal Server Error', error: error.toString() });
    }
});

// 가입 승인 처리
app.put('/groups/:groupId/approve', async (req, res) => {
    const { groupId } = req.params; // 그룹 ID 추출
    const { userId } = req.body; // 사용자 ID 가져오기

    try {
        const groupUpdateResult = await db.collection('groups').updateOne(
            { id: groupId },
            {
                $pull: { pendingUsers: userId },
                $push: { members: userId }
            }
        );

        if (groupUpdateResult.matchedCount === 0) {
            return res.status(404).json({ message: 'Group not found' });
        }

        const userUpdateResult = await db.collection('users').updateOne(
            { id: userId },
            { $push: { groups: groupId } }
        );

        if (userUpdateResult.matchedCount === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({ message: 'User approved successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Internal Server Error', error: error.toString() });
    }
});

// 그룹 요청 거절
app.put('/groups/:groupId/reject', async (req, res) => {
    const { groupId } = req.params; // 그룹 ID 추출
    const { userId } = req.body; // 사용자 ID 가져오기

    try {
        const result = await db.collection('groups').updateOne(
            { id: groupId },
            { $pull: { pendingUsers: userId } }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({ message: 'Group not found' });
        }

        res.status(200).json({ message: 'Join request rejected successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Internal Server Error', error: error.toString() });
    }
});

// 사용자 등록
app.post('/signup', async (req, res) => {
    try {
        const newUser = req.body;  // 요청 본문에서 사용자 데이터 가져오기
        newUser.interestGroups = [];  // 관심 그룹 목록 초기화
        console.log('Attempting to register new user:', newUser);

        const result = await db.collection('users').insertOne(newUser);
        console.log('New user registered successfully:', result);

        res.status(201).json(newUser);  // 성공적으로 등록된 사용자 반환
    } catch (err) {
        console.error('Database insertion error:', err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// 로그인
app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;  // 요청 본문에서 이메일과 비밀번호 추출
        console.log(`Login attempt for email: ${email}, with password: ${password}`);

        const user = await db.collection('users').findOne({ email, password });
        if (!user) {
            console.log('No user found with that email and password');
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        console.log('Login successful:', user);
        res.status(200).json({ message: 'Login successful', user });
    } catch (err) {
        console.error('Database query error:', err);
        res.status(500).json({ message: 'Internal Server Error', error: err.toString() });
    }
});

// 모든 사용자 조회
app.get('/users', async (req, res) => {
    console.log('Received GET request for /users');
    try {
        const users = await db.collection('users').find({}).toArray();
        res.status(200).json(users);  // 사용자 리스트 반환
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// 특정 이메일을 기반으로 사용자 조회
app.get('/users/email', async (req, res) => {
    console.log('Received GET request for /users with email query');
    const { email } = req.query;  // 쿼리 파라미터에서 이메일 추출

    console.log('Email parameter received:', email); 
    if (!email) {
        return res.status(400).json({ message: 'Email query parameter is missing' });
    }

    try {
        const user = await db.collection('users').findOne({ email });
        if (user) {
            res.status(200).json(user);  // 단일 사용자 정보 반환
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});
// 사용자 정보 가져오기
app.get('/users/:userId', async (req, res) => {
    const { userId } = req.params;

    try {
        const user = await db.collection('users').findOne({ id: userId }); // id 필드로 사용자 조회

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json(user); // 사용자 정보 반환
    } catch (err) {
        console.error('Error fetching user:', err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});



// 채널에 새로운 메시지 추가하기
app.post('/messages', async (req, res) => {
    try {
        const { channelId, userId, message } = req.body;  // 요청 본문에서 필요한 필드 추출

        // 필수 필드가 모두 있는지 확인
        if (!channelId || !userId || !message) {
            return res.status(400).json({ message: 'Missing required fields: channelId, userId, message' });
        }

        // MongoDB에 메시지 저장
        const result = await db.collection('messages').insertOne({
            channelId,
            userId,
            message,
            timestamp: new Date()
        });

        res.status(201).json({ message: 'Message saved successfully', messageId: result.insertedId });
    } catch (error) {
        console.error('메시지 저장 중 오류 발생:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// 특정 채널의 모든 메시지 가져오기
app.get('/messages', async (req, res) => {
    const { channelId } = req.query;  // 쿼리 파라미터에서 channelId 추출

    if (!channelId) {
        return res.status(400).json({ message: 'channelId query parameter is missing' });
    }

    try {
        // 특정 채널의 모든 메시지 가져오기
        const messages = await db.collection('messages').find({ channelId }).toArray();
        res.status(200).json(messages);
    } catch (error) {
        console.error('메시지 가져오기 중 오류 발생:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});


// 사용자 정보 업데이트
app.put('/users/:userId', async (req, res) => {
    const { userId } = req.params; // URL에서 userId 추출
    const updatedUser = req.body;  // 요청 본문에서 업데이트할 사용자 정보 추출

    try {
        // _id 대신 id 필드로 사용자 업데이트
        const result = await db.collection('users').updateOne(
            { id: userId },  // id 필드를 사용하여 사용자를 식별
            { $set: updatedUser }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({ message: 'User updated successfully' });
    } catch (err) {
        console.error('Error updating user:', err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});


// 사용자 삭제
app.delete('/users/:userId', async (req, res) => {
    const { userId } = req.params; // URL에서 userId 추출

    try {
        const result = await db.collection('users').deleteOne({ id: userId });

        if (result.deletedCount === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({ message: `User with ID ${userId} deleted successfully` });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// 그룹 삭제
app.delete('/groups/:groupId', async (req, res) => {
    const { groupId } = req.params; // URL에서 groupId 추출

    try {
        // 그룹 데이터베이스에서 그룹 삭제
        const groupResult = await db.collection('groups').deleteOne({ id: groupId });
        if (groupResult.deletedCount === 0) {
            return res.status(404).json({ message: 'Group not found' });
        }

        // 사용자 데이터베이스에서 삭제된 그룹 제거
        await db.collection('users').updateMany(
            { "groups.id": groupId },
            { $pull: { groups: { id: groupId } } }
        );

        res.status(200).json({ message: 'Group and related user data deleted successfully' });
    } catch (err) {
        console.error('Error deleting group:', err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

    
    // 소켓 설정
    setupSocket(server, db);

    // 서버 시작
    const PORT = 3000;
    server.listen(PORT, () => { // server.listen으로 변경
        console.log(`서버가 http://localhost:${PORT} 에서 실행 중입니다.`);
    });
}

startServer();
