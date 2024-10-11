const { ObjectId } = require('mongodb'); // ObjectId import
const socketIo = require('socket.io');

function setupSocket(server, db) {
  const io = socketIo(server, {
    cors: {
      origin: '*', // Allow all origins (CORS issue prevention)
    }
  });

  io.on('connection', (socket) => {
    console.log('A new user has connected.');

    // When a user joins a specific channel
    socket.on('join-channel', (channelId) => {
      socket.join(channelId);
      console.log(`User has joined channel ${channelId}.`);
      const timestamp = new Date().toLocaleString(); // Get current time

      // Notify everyone in the channel that a user has joined, along with the time
      io.to(channelId).emit('user-joined', { channelId, userId: socket.id, timestamp });
    });

    // When a user sends a text message
    socket.on('send-message', async (data) => {
      console.log('Message received:', data);
      const { channelId, message, userId, username } = data;

      try {
        // MongoDB user profile image lookup
        const user = await db.collection('users').findOne({ _id: new ObjectId(userId) });
        const profileImageUrl = user ? user.profileImage : null;

        // Save message to MongoDB
        await db.collection('messages').insertOne({
          groupId: data.groupId || null, 
          channelId,
          userId,
          username,
          message,
          timestamp: new Date() // Store message timestamp
        });

        // Send the message to all users in the channel, including the timestamp
        io.to(channelId).emit('new-message', {
          userId,
          username,
          text: message,
          profileImageUrl, 
          timestamp: new Date().toLocaleString() // Send current time to users
        });
      } catch (error) {
        console.error('Error saving message:', error);
      }
    });

    // When a user sends an image message
    socket.on('send-image', async (data) => {
      const { channelId, message, userId, username } = data;
      
      try {
        // MongoDB user profile image lookup
        const user = await db.collection('users').findOne({ _id: new ObjectId(userId) });
        const profileImageUrl = user ? user.profileImage : null;

        // Save image message to MongoDB
        await db.collection('messages').insertOne({
          channelId,
          userId,
          username,
          message: message, // Save image URL as the message
          timestamp: new Date() // Store message timestamp
        });

        // Send the image to all users in the channel
        io.to(channelId).emit('new-message', {
          userId,
          username,
          text: message,  // Send image URL as the message
          profileImageUrl,
          timestamp: new Date().toLocaleString() // Send current time with the message
        });
      } catch (error) {
        console.error('Error saving image message:', error);
      }
    });

    socket.on('disconnect', () => {
      console.log('User has disconnected.');
      const timestamp = new Date().toLocaleString(); // Get the current time
    
      // Send user-left event with timestamp to all clients
      io.emit('user-left', { userId: socket.id, timestamp });
    });
    
  });
}

module.exports = setupSocket;