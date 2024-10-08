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
const server = http.createServer(app); // Generate Http Server
// const io = require('./socket')(server, db); 
// PeerJS 모듈 추가
const { PeerServer } = require('peer');

// PeerJS 서버 설정 (server.js 파일 상단에 추가)
const peerServer = PeerServer({ port: 9001, path: '/peerjs' });

// 기존 서버 로직 아래에 Peer 서버 추가
peerServer.listen(() => {
    console.log('PeerJS server is running on http://localhost:9001');
});
app.use(express.json()); 
app.use(cors());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))
// multer 설정 (이미지 저장 경로 및 파일 이름)
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = './uploads/profile-images';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir); 
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); 
    }
});

const upload = multer({ storage });

// multer Setting
const chatImageStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = './uploads/chat-images';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true }); 
        }
        cb(null, uploadDir); 
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); 
    }
});

const uploadChatImage = multer({ storage: chatImageStorage });

// MongoDB
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

// Start the server
async function startServer() {
    const db = await connectDB();
    if (!db) {
        console.log("데이터베이스 연결 실패. 서버를 시작할 수 없습니다.");
        return;
    }

    // Serving image file
    app.use('/uploads/profile-images', express.static(path.join(__dirname, 'uploads', 'profile-images')));
    
    app.post('/upload-profile-image', upload.single('profileImage'), async (req, res) => {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }
        const userId = req.body.userId;
        const imageUrl = `/uploads/profile-images/${req.file.filename}`;

        try {
            const result = await db.collection('users').updateOne(
                { id: userId },
                { $set: { profileImage: imageUrl } }
            );

            if (result.matchedCount === 0) {
                return res.status(404).json({ message: 'User not found' });
            }

            res.status(200).json({ message: 'Image uploaded successfully', imageUrl });
        } catch (error) {
            console.error('Error updating user:', error);
            res.status(500).json({ message: 'Internal Server Error', error: error.toString() });
        }
    });

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

app.put('/groups/approve/:groupId', async (req, res) => {
    console.log('PUT request received for approval');
    const { groupId } = req.params; // URL에서 groupId 추출
    const { userId } = req.body; // 요청 본문에서 userId 추출

    try {
        // 1. 그룹 정보를 먼저 조회
        const group = await db.collection('groups').findOne({ id: groupId });
        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }

        // 2. 그룹 업데이트: pendingUsers에서 제거하고 members에 추가
        const groupUpdateResult = await db.collection('groups').updateOne(
            { id: groupId }, // id로 그룹 검색
            {
                $pull: { pendingUsers: userId }, // pendingUsers 배열에서 해당 userId 제거
                $push: { members: userId } // members 배열에 userId 추가
            }
        );

        if (groupUpdateResult.matchedCount === 0) {
            return res.status(404).json({ message: 'Group not found' });
        }

        // 3. 사용자의 groups 배열에 그룹의 전체 정보 추가 및 interestGroups에서 그룹 제거
        const userUpdateResult = await db.collection('users').updateOne(
            { id: userId },
            {
                // 중복 없이 그룹 전체 데이터를 추가 ($addToSet 사용 시 중복 방지)
                $addToSet: { groups: group }, // group 객체 전체 추가
                $pull: { interestGroups: groupId } // interestGroups에서 해당 groupId 제거
            }
        );

        if (userUpdateResult.matchedCount === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({ message: 'User approved successfully', group });
    } catch (error) {
        console.error('Error during approval process:', error);
        res.status(500).json({ message: 'Internal Server Error', error: error.toString() });
    }
});



// 그룹 요청 거절
app.put('/groups/reject/:groupId', async (req, res) => {
    const { groupId } = req.params; // URL에서 groupId 추출
    const { userId } = req.body; // 사용자 ID 가져오기

    try {
        const result = await db.collection('groups').updateOne(
            { id: groupId }, // _id가 아닌 id 필드로 검색
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

app.get('/users/:email/interest-groups', async (req, res) => {
    const { email } = req.params;
    
    try {
      // 이메일로 사용자 조회
      const user = await db.collection('users').findOne({ email: email });
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      res.status(200).json(user.interestGroups || []);
    } catch (error) {
      res.status(500).json({ message: 'Internal Server Error', error: error.toString() });
    }
});

// 가입 요청 처리
app.post('/groups/:groupId/join', async (req, res) => {
    const { groupId } = req.params; // 그룹 ID 추출
    const { email } = req.body; // 사용자 이메일 가져오기

    try {
        // 그룹의 pendingUsers에 사용자 추가
        const groupUpdateResult = await db.collection('groups').updateOne(
            { id: groupId },
            { $push: { pendingUsers: email } }
        );

        if (groupUpdateResult.matchedCount === 0) {
            return res.status(404).json({ message: 'Group not found' });
        }

        // 사용자의 interestGroups에 그룹 추가
        const userUpdateResult = await db.collection('users').updateOne(
            { email: email }, // email로 사용자 찾기
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
app.post('/group/:groupId/invite', async (req, res) => {
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
    console.log("hello");
    try {
        console.log("hello2");
        const { channelId, userId, message } = req.body;  // 요청 본문에서 필요한 필드 추출

        // 필수 필드가 모두 있는지 확인
        if (!channelId || !userId || !message) {
            return res.status(400).json({ message: 'Missing required fields: channelId, userId, message' });
        }

        console.log('요청된 userId:', userId);
        // 작성자 정보 조회 (profileImage 포함)
        const user = await db.collection('users').findOne({ id: userId });
        console.log('조회된 사용자 정보:', user);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // 로그로 user 정보 확인
        console.log('사용자 정보:', user);

        // MongoDB에 메시지 저장
        const result = await db.collection('messages').insertOne({
            channelId,
            userId,
            message,
            timestamp: new Date()
        });

        // 저장된 메시지와 함께 작성자의 profileImage를 반환
        const savedMessage = {
            messageId: result.insertedId,
            userId,
            username: user.username,
            profileImage: user.profileImage,  // 프로필 이미지 URL 추가
            message,
            timestamp: new Date()
        };

        console.log('저장된 메시지:', savedMessage); // 확인을 위한 로그 추가
        res.status(201).json({ message: 'Message saved successfully', savedMessage });
    } catch (error) {
        console.error('메시지 저장 중 오류 발생:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});
// 채팅에서 이미지를 보내는 라우트
app.post('/upload-chat-image', uploadChatImage.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
    }

    const imageUrl = `/uploads/chat-images/${req.file.filename}`; // 업로드된 이미지 URL 생성

    res.status(200).json({ imageUrl }); // 클라이언트에 이미지 URL 반환
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

        // 각 메시지 작성자의 profileImage 추가
        const messagesWithUserProfile = await Promise.all(
            messages.map(async (message) => {
                try {
                    // userId를 ObjectId로 변환하여 사용자 정보 조회
                    const user = await db.collection('users').findOne({ _id: new ObjectId(message.userId) });

                    if (!user) {
                        console.error(`User with id ${message.userId} not found`);
                        return {
                            ...message,
                            profileImageUrl: '/default/path/to/image.png' // 사용자 없을 때 기본 이미지 제공
                        };
                    }

                    return {
                        ...message,
                        profileImageUrl: user.profileImage || '/default/path/to/image.png' // 사용자 이미지 없을 때 기본 이미지 제공
                    };
                } catch (err) {
                    console.error(`Error fetching user with id ${message.userId}:`, err);
                    return {
                        ...message,
                        profileImageUrl: '/default/path/to/image.png' // 오류 발생 시 기본 이미지 제공
                    };
                }
            })
        );

        res.status(200).json(messagesWithUserProfile);
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
