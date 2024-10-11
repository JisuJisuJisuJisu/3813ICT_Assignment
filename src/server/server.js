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

const { PeerServer } = require('peer');

// PeerJS Server Setting 
const peerServer = PeerServer({ port: 9001, path: '/peerjs' });

peerServer.listen(() => {
    console.log('PeerJS server is running on http://localhost:9001');
});
app.use(express.json()); 
app.use(cors());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

// Paths to JSON files
const usersFilePath = path.join(__dirname, 'users.json');
const groupsFilePath = path.join(__dirname, 'groups.json');

// Function to save user data to JSON file
function saveUserData(data) {
    fs.writeFileSync(usersFilePath, JSON.stringify(data, null, 2), 'utf-8');
  }
  
  // Function to save group data to JSON file
  function saveGroupData(data) {
    fs.writeFileSync(groupsFilePath, JSON.stringify(data, null, 2), 'utf-8');
  }
  
  // Function to load user data from JSON file
  function loadUserData() {
    if (fs.existsSync(usersFilePath)) {
      const fileData = fs.readFileSync(usersFilePath, 'utf-8');
      return JSON.parse(fileData);
    }
    return [];
  }
  
  // Function to load group data from JSON file
  function loadGroupData() {
    if (fs.existsSync(groupsFilePath)) {
      const fileData = fs.readFileSync(groupsFilePath, 'utf-8');
      return JSON.parse(fileData);
    }
    return [];
  }

// multer 
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

// Set up Multer for file upload handling
const groupImageStorages = multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadDir = './uploads/group-images';  // Set the upload directory path
      if (!fs.existsSync(uploadDir)) {
        try {
          fs.mkdirSync(uploadDir, { recursive: true });  // Create the directory if it does not exist
        } catch (err) {
          console.error('Error creating directory:', err);
          return cb(err, uploadDir);  // Return an error if the directory creation fails
        }
      }
      cb(null, uploadDir);  // Proceed to the upload destination
    },
    filename: (req, file, cb) => {
      cb(null, Date.now() + path.extname(file.originalname));  // Generate a unique file name with timestamp
    }
  });
  

const uploadGroupImage = multer({ storage: groupImageStorages });
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
        console.log("Successgully linked with MongoDB.");
        return client.db('s5310537'); 
    } catch (error) {
        console.error('MongoDB Connect Fail:', error);
        return null;
    }
}

// Start the server
async function startServer() {
    const db = await connectDB();
    if (!db) {
        console.log("Database connection failed, server could not be started.");
        return;
    }

    app.get('/users-json', (req, res) => {
        const filePath = path.join(__dirname, './users.json'); // 서버 내의 JSON 파일 경로
        fs.readFile(filePath, 'utf8', (err, data) => {
          if (err) {
            res.status(500).json({ message: 'Failed to load JSON file.' });
          } else {
            res.json(JSON.parse(data));
          }
        });
      });
    // Use the configured uploadGroupImage instead of upload
app.post('/upload-group-image', uploadGroupImage.single('image'), (req, res) => {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const imageUrl = `/uploads/group-images/${req.file.filename}`;  // Create the image URL
    res.status(200).json({ imageUrl });  // Send the image URL back to the client
});

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
            res.status(200).json(groups);  
        } catch (error) {
            console.error('Error reading groups data:', error);
            res.status(500).json({ message: 'Internal Server Error' });
        }
    });


    app.get('/groups/:groupId', async (req, res) => {
        const { groupId } = req.params; 

        try {
            const group = await db.collection('groups').findOne({ id: groupId });
            
            if (!group) {
                return res.status(404).json({ message: 'Group not found' });
            }

            res.status(200).json(group); 
        } catch (error) {
            console.error('Error fetching group:', error);
            res.status(500).json({ message: 'Internal Server Error' });
        }
    });
    
    // Delete a member from a group (only for Group Admin or Super Admin)
app.delete('/groups/:groupId/members/:memberId', async (req, res) => {
    const { groupId, memberId } = req.params; // Extract groupId and memberId from URL
    const { loggedInUser } = req.body; // Get the logged in user information from the request body

    try {
        // Check if loggedInUser exists and has the required role
        if (!loggedInUser || !loggedInUser.roles.includes('Group Admin') && !loggedInUser.roles.includes('Super Admin')) {
            return res.status(403).json({ message: 'You do not have permission to delete members.' });
        }

        // Remove the member from the group
        const result = await db.collection('groups').updateOne(
            { id: groupId }, // Find group by groupId
            { $pull: { members: memberId } } // Remove the memberId from the members array
        );

        if (result.modifiedCount === 0) {
            return res.status(404).json({ message: 'Group or member not found' });
        }

        res.status(200).json({ message: 'Member deleted successfully' });
    } catch (error) {
        console.error('Error deleting member:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});


// New group creation
app.post('/groups', async (req, res) => {
    try {
        let newGroup = req.body;

        // Remove _id if it exists, since MongoDB will generate it automatically
        if (newGroup._id) {
            delete newGroup._id;
        }

        newGroup.pendingUsers = [];  // Initialize pendingUsers field
        newGroup.members = [];  // Initialize members field

        // Insert the new group into MongoDB
        const result = await db.collection('groups').insertOne(newGroup);

        // Fetch the inserted group by ID
        const insertedGroup = await db.collection('groups').findOne({ _id: result.insertedId });

        // Add the created group to the user's group list
        const createdBy = newGroup.createdBy;
        if (createdBy) {
            await db.collection('users').updateOne(
                { id: createdBy },
                { $push: { groups: { id: insertedGroup.id, name: insertedGroup.name, description: insertedGroup.description } } }
            );
        }

        // Check if channels exist in the request body
        if (newGroup.channels && newGroup.channels.length > 0) {
            // Loop through each channel and insert it into the channels collection
            for (const channel of newGroup.channels) {
                const newChannel = {
                    id: channel.id || '',  // If id exists, use it, otherwise generate or leave empty
                    name: channel.name,
                    description: channel.description || '',
                    groupId: insertedGroup._id.toString()  // Link the channel with the newly created group
                };
                await db.collection('channels').insertOne(newChannel);
            }
        }

        // Fetch the existing groups from groups.json
        const existingGroups = loadGroupData();

        // Add the new group to the array
        existingGroups.push(insertedGroup);

        // Save the updated groups to groups.json
        saveGroupData(existingGroups);

        // Return the successfully created group
        res.status(201).json(insertedGroup);

    } catch (error) {
        console.error('Error inserting group:', error);
        res.status(500).json({ message: 'Internal Server Error' });
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


app.post('/groups/:groupId/channels', async (req, res) => {
    const { groupId } = req.params; 
    const newChannel = req.body;

    
    delete newChannel._id;

    try {
        const result = await db.collection('groups').updateOne(
            { id: groupId }, 
            { $push: { channels: newChannel } }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({ message: 'Group not found' });
        }

        // Add the new channel to the channels collection
        const newChannelInCollection = {
            id: newChannel.id || '',  // Use existing id if provided, otherwise leave blank
            name: newChannel.name,
            description: newChannel.description || '',
            groupId: groupId  // Ensure the channel is linked to the group
        };

        // Insert the new channel into the channels collection
        await db.collection('channels').insertOne(newChannelInCollection);

        res.status(201).json({ message: 'Channel added successfully', group: groupId });

    } catch (error) {
        console.error('Error adding channel:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

app.put('/groups/approve/:groupId', async (req, res) => {
    console.log('PUT request received for approval');
    const { groupId } = req.params;
    const { userId } = req.body; 

    try {
       
        const group = await db.collection('groups').findOne({ id: groupId });
        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }

      
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
            {
                
                $addToSet: { groups: group }, 
                $pull: { interestGroups: groupId } 
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



app.put('/groups/reject/:groupId', async (req, res) => {
    const { groupId } = req.params; 
    const { userId } = req.body; 

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

app.get('/users/:email/interest-groups', async (req, res) => {
    const { email } = req.params;
    
    try {
      
      const user = await db.collection('users').findOne({ email: email });
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      res.status(200).json(user.interestGroups || []);
    } catch (error) {
      res.status(500).json({ message: 'Internal Server Error', error: error.toString() });
    }
});


app.post('/groups/:groupId/join', async (req, res) => {
    const { groupId } = req.params;
    const { email } = req.body; 

    try {
        
        const groupUpdateResult = await db.collection('groups').updateOne(
            { id: groupId },
            { $push: { pendingUsers: email } }
        );

        if (groupUpdateResult.matchedCount === 0) {
            return res.status(404).json({ message: 'Group not found' });
        }

     
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


// invite user to group
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


// Sign up
app.post('/signup', async (req, res) => {
    try {
        const newUser = req.body;  
        newUser.interestGroups = []; 
        console.log('Attempting to register new user:', newUser);

        const result = await db.collection('users').insertOne(newUser);
        console.log('New user registered successfully:', result);

        const users = loadUserData();
        users.push(newUser);
        saveUserData(users);

        res.status(201).json(newUser); 
    } catch (err) {
        console.error('Database insertion error:', err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// Log in
app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;  
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

// All User Data
app.get('/users', async (req, res) => {
    console.log('Received GET request for /users');
    try {
        const users = await db.collection('users').find({}).toArray();
        res.status(200).json(users);  
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// Look up users based on specific emails
app.get('/users/email', async (req, res) => {
    console.log('Received GET request for /users with email query');
    const { email } = req.query; 

    console.log('Email parameter received:', email); 
    if (!email) {
        return res.status(400).json({ message: 'Email query parameter is missing' });
    }

    try {
        const user = await db.collection('users').findOne({ email });
        if (user) {
            res.status(200).json(user); 
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});
// User Information
app.get('/users/:userId', async (req, res) => {
    const { userId } = req.params;

    try {
        const user = await db.collection('users').findOne({ id: userId }); // id 필드로 사용자 조회

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json(user); 
    } catch (err) {
        console.error('Error fetching user:', err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// Add new message to channel
app.post('/messages', async (req, res) => {
    console.log("hello");
    try {
        console.log("hello2");
        const { channelId, userId, message } = req.body;  

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
                            profileImageUrl: '/uploads/profile-images/basicprofile.jpg' // 사용자 없을 때 기본 이미지 제공
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


// delete users
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

// Delete Groups
app.delete('/groups/:groupId', async (req, res) => {
    const { groupId } = req.params; // get group Id from url

    try {
        // delete group from database
        const groupResult = await db.collection('groups').deleteOne({ id: groupId });
        if (groupResult.deletedCount === 0) {
            return res.status(404).json({ message: 'Group not found' });
        }

        // delete group from users
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

// Get all channels in a specific group
app.get('/groups/:groupId/channels', async (req, res) => {
    const { groupId } = req.params; // Extract groupId from URL

    try {
        const group = await db.collection('groups').findOne({ id: groupId });
        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }

        res.status(200).json(group.channels || []); // Return the list of channels in the group
    } catch (error) {
        console.error('Error fetching channels:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// Delete a specific channel by channelId (without groupId)
app.delete('/channels/:channelId', async (req, res) => {
    const { channelId } = req.params;

    try {
        // Find the group that contains the channel with the given ID
        const result = await db.collection('groups').updateOne(
            { 'channels.id': channelId },  // Find the group that contains the channel
            { $pull: { channels: { id: channelId } } }  // Remove the channel with the matching ID
        );

        if (result.modifiedCount === 0) {
            return res.status(404).json({ message: 'Channel not found' });
        }

        res.status(200).json({ message: 'Channel deleted successfully' });
    } catch (error) {
        console.error('Error deleting channel:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});



// Update a specific channel's information
app.put('/groups/:groupId/channels/:channelId', async (req, res) => {
    const { groupId, channelId } = req.params; // Extract groupId and channelId from URL
    const updatedChannel = req.body; // Extract updated channel data from request body

    try {
        const group = await db.collection('groups').findOne({ id: groupId });
        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }

        // Update the specific channel information
        const result = await db.collection('groups').updateOne(
            { id: groupId, "channels.id": new ObjectId(channelId) }, // Search for the channel by group and channel ID
            { $set: { "channels.$": updatedChannel } } // Update the channel
        );

        if (result.modifiedCount === 0) {
            return res.status(404).json({ message: 'Channel not found' });
        }

        res.status(200).json({ message: 'Channel updated successfully' });
    } catch (error) {
        console.error('Error updating channel:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});
// Get all channels across all groups
app.get('/channels', async (req, res) => {
    try {
        // Search for all groups and retrieve their channels
        const groups = await db.collection('groups').find({}).toArray();
        const allChannels = groups.flatMap(group => group.channels || []); // Combine all channels from all groups

        res.status(200).json(allChannels); // Return all channels
    } catch (error) {
        console.error('Error fetching channels:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});


    setupSocket(server, db);

 
    const PORT = 3000;
    server.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT} `);
    });
}

startServer();
