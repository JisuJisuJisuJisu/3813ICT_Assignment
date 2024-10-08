const { ObjectId } = require('mongodb'); // ObjectId 추가
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

    // 사용자가 텍스트 메시지를 보낼 때
    socket.on('send-message', async (data) => {
      console.log('메시지 수신:', data);
      const { channelId, message, userId, username } = data;

      try {
        // MongoDB에서 사용자 프로필 이미지 조회
        console.log('사용자 조회 시작, userId:', userId);

        const user = await db.collection('users').findOne({ _id: new ObjectId(userId) });
        console.log('조회된 사용자 정보:', user);

        const profileImageUrl = user ? user.profileImage : null; // 사용자 프로필 이미지 가져오기

        // MongoDB에 메시지 저장
        await db.collection('messages').insertOne({
          groupId: data.groupId || null, // 그룹 ID가 있으면 저장
          channelId,
          userId,
          username, // username 필드 추가
          message,
          timestamp: new Date()
        });

        // 메시지를 해당 채널에 있는 모든 사용자에게 전송 (프로필 이미지 포함)
        io.to(channelId).emit('new-message', {
          userId,
          username,
          text: message,
          profileImageUrl // 사용자 프로필 이미지 추가
        });
      } catch (error) {
        console.error('메시지 저장 중 오류 발생:', error);
      }
    });

    // 사용자가 이미지 메시지를 보낼 때 (새로운 이벤트)
    socket.on('send-image', async (data) => {
      
      const { channelId, message, userId, username } = data;
      console.log('이미지 메시지 수신 데이터:', data); // 수신 데이터 확인 로그
       console.log('전송된 imageUrl:', message); // imageUrl이 undefined인지 확인

      try {
        // MongoDB에서 사용자 프로필 이미지 조회
        console.log('사용자 조회 시작, userId:', userId);

        const user = await db.collection('users').findOne({ _id: new ObjectId(userId) });
        console.log('조회된 사용자 정보:', user);

        const profileImageUrl = user ? user.profileImage : null;

        // MongoDB에 이미지 메시지 저장
        console.log('이미지 메시지를 MongoDB에 저장 중:', message);  // 이미지 URL 확인
        const result = await db.collection('messages').insertOne({
          channelId,
          userId,
          username,
          message: message, // 이미지 URL을 메시지로 저장
          timestamp: new Date()
        });
        console.log('MongoDB에 저장된 메시지 결과:', result);  
        console.log('이미지 메시지 수신:', data);
        // 이미지를 해당 채널에 있는 모든 사용자에게 전송
        io.to(channelId).emit('new-message', {
          userId,
          username,
          text: message,  // 이미지 URL을 메시지로 전송
          profileImageUrl
        });
      } catch (error) {
        console.error('이미지 메시지 저장 중 오류 발생:', error);
      }
    });

    // 사용자가 연결을 끊었을 때
    socket.on('disconnect', () => {
      console.log('사용자가 연결을 끊었습니다.');
    });
  });
}

module.exports = setupSocket;
