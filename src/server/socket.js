const socketIo = require('socket.io');

function setupSocket(server, db) {
  const io = socketIo(server, {
    cors: {
      origin: '*', // 모든 오리진 허용 (CORS 문제 방지)
    }
  });

  io.on('connection', (socket) => {
    console.log('새로운 사용자가 연결되었습니다.');

    // 특정 채널에 사용자가 참여할 때
    socket.on('join-channel', (channelId) => {
      socket.join(channelId);
      console.log(`사용자가 채널 ${channelId}에 참여했습니다.`);
      io.to(channelId).emit('user-joined', { channelId, userId: socket.id });
    });

    // 사용자가 메시지를 보낼 때
    socket.on('send-message', async (data) => {
      console.log('메시지 수신:', data);
      const { channelId, message, userId, username } = data; // username도 추가

      // MongoDB에 메시지 저장
      try {
        await db.collection('messages').insertOne({
          groupId: data.groupId || null, // 그룹 ID가 있으면 저장, 없으면 null
          channelId,
          userId,
          message,
          timestamp: new Date()
        });

        // 메시지를 해당 채널에 있는 모든 사용자에게 전송
        io.to(channelId).emit('new-message', { userId, username, text: message }); // userId와 username 모두 전송
      } catch (error) {
        console.error('메시지 저장 중 오류 발생:', error);
      }
    });

    // 사용자가 연결을 끊었을 때
    socket.on('disconnect', () => {
      console.log('사용자가 연결을 끊었습니다.');
    });
  });
}

module.exports = setupSocket;
