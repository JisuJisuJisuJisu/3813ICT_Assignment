const express = require('express');
const router = express.Router();

// 사용자 목록 가져오기
router.get('/', (req, res) => {
  res.send('모든 사용자 목록');
});

// 사용자를 초대하는 라우트
router.post('/invite', (req, res) => {
  res.send('사용자 초대 완료');
});

// 사용자의 가입 요청을 승인하는 라우트
router.put('/approve/:userId', (req, res) => {
  res.send('사용자 승인 완료');
});

module.exports = router;
