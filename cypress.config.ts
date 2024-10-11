import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:4200', // 로컬 개발 서버 주소로 변경
    setupNodeEvents(on, config) {
      // Node 이벤트 리스너 추가 (필요 시)
    },
  },
});
