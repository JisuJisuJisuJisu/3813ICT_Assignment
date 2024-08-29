export interface User {
    id: string;        // 고유한 사용자 ID
    username: string;  // 사용자 이름
    email: string;     // 이메일 주소
    roles: string[];   // 사용자의 역할을 저장하는 배열
    groups: string[];  // 사용자가 속한 그룹을 저장하는 배열
  }
  