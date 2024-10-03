import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface User {
  id: string;
  email: string;
  username: string;
  roles: string;
}

interface Group {
  id: string;
  name: string;
  pendingUsers: User[];
}

@Component({
  selector: 'app-group-member',
  templateUrl: './groupmember.component.html',
  imports: [CommonModule, FormsModule],
  standalone: true,
  styleUrls: ['./groupmember.component.css']
})
export class GroupMemberComponent implements OnInit {
  groups: Group[] = [];
  selectedGroup: Group | null = null;
  allUsers: User[] = [];  // 전체 유저 리스트
  isLoading: boolean = true;
  showAllUsers: boolean = false;  // 멤버 리스트와 전체 유저 리스트 전환 여부
  errorMessage: string | null = null;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.fetchGroups();
  }

  fetchGroups(): void {
    this.http.get<Group[]>('http://localhost:3000/groups')
      .subscribe({
        next: (groups) => {
          this.groups = groups;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('그룹을 불러오는 중 오류 발생:', error);
          this.errorMessage = '그룹을 불러오는 데 실패했습니다.';
          this.isLoading = false;
        }
      });
  }

  fetchAllUsers(): void {
    this.http.get<User[]>('http://localhost:3000/users')
      .subscribe({
        next: (users) => {
          console.log('유저 리스트 불러오기 성공:', users);  // 디버깅 로그
          this.allUsers = users;  // 데이터 할당
          this.showAllUsers = true;  // 전체 유저 리스트 표시 상태 변경
        },
        error: (error) => {
          console.error('전체 유저를 불러오는 중 오류 발생:', error);  // 에러 로그
          this.errorMessage = '유저 리스트를 불러오는 데 실패했습니다.';
        }
      });
}


  // Invite 버튼 클릭 시 전체 유저 리스트를 표시
  inviteUser(): void {
    console.log("hello");
    this.fetchAllUsers();  // 전체 유저 리스트 로드
    
  }
  inviteUserToGroup(groupId: string | undefined, userId: string): void {
    if (!groupId) {
      alert('그룹이 선택되지 않았습니다.');
      return;  // groupId가 없으면 함수 실행 중단
    }
    this.http.post(`http://localhost:3000/groups/invite`, { groupId, userId })
      .subscribe({
        next: () => {
          alert('초대가 성공적으로 보내졌습니다.');
          this.fetchGroups();  // 초대 후 그룹 목록 다시 로드
        },
        error: (error) => {
          console.error('초대 중 오류 발생:', error);
          alert('초대에 실패했습니다.');
        }
      });
  }
  
  
  approveUser(groupId: string, userId: string): void {
    this.http.put(`http://localhost:3000/groups/approve/${groupId}`, { userId })
      .subscribe({
        next: () => {
          alert('사용자가 승인되었습니다.');
          this.fetchGroups();  // 다시 그룹 목록을 불러와서 상태 업데이트
        },
        error: (error) => {
          console.error('사용자 승인 중 오류 발생:', error);
          alert('사용자 승인에 실패했습니다.');
        }
      });
  }
}
