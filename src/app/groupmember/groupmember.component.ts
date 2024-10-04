import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

interface User {
  id: string;
  email: string;
  username: string;
  roles: string;
}

interface Group {
  id: string;
  name: string;
  pendingUsers: string[];
  members: User[];
}

@Component({
  selector: 'app-group-member',
  templateUrl: './groupmember.component.html',
  imports: [CommonModule, FormsModule],
  standalone: true,
  styleUrls: ['./groupmember.component.css']
})
export class GroupMemberComponent implements OnInit {
  groupId: string | null = null;  // URL에서 가져온 groupId 저장
  selectedGroup: Group | null = null;
  allUsers: User[] = [];
  isLoading: boolean = true;
  showAllUsers: boolean = false;
  errorMessage: string | null = null;

  constructor(private http: HttpClient, private route: ActivatedRoute) {}

  ngOnInit(): void {
    // URL에서 groupId를 가져옴
    this.route.parent?.paramMap.subscribe(params => {
      this.groupId = params.get('id'); // 부모 경로에서 'id' 파라미터 가져오기
      console.log('Group ID from URL:', this.groupId);

      if (this.groupId) {
        this.fetchGroupDetails(this.groupId);
      } else {
        console.error('그룹 ID가 없습니다.');
        this.isLoading = false;
      }
    });
  }

  // 그룹 세부 사항 가져오기
  fetchGroupDetails(groupId: string): void {
    this.http.get<Group>(`http://localhost:3000/groups/${groupId}`)
      .subscribe({
        next: (group) => {
          console.log('Fetched Group:', group);
          this.selectedGroup = group;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('그룹을 불러오는 중 오류 발생:', error);
          this.errorMessage = '그룹을 불러오는 데 실패했습니다.';
          this.isLoading = false;
        }
      });
  }

  // Invite 버튼 클릭 시 전체 유저 리스트를 표시
  inviteUser(): void {
    this.fetchAllUsers();  // 전체 유저 리스트 로드
  }

  // 전체 유저 리스트 가져오기
  fetchAllUsers(): void {
    this.http.get<User[]>('http://localhost:3000/users')
      .subscribe({
        next: (users) => {
          console.log('Fetched Users:', users);
          this.allUsers = users;
          this.showAllUsers = true;
        },
        error: (error) => {
          console.error('유저 리스트를 불러오는 중 오류 발생:', error);
          this.errorMessage = '유저 리스트를 불러오는 데 실패했습니다.';
        }
      });
  }

  // 특정 유저를 그룹에 초대
  inviteUserToGroup(groupId: string | undefined, userId: string): void {
    console.log('groupId:', groupId);
    console.log('userId:', userId);

    if (!this.selectedGroup || !this.selectedGroup.id) {
      alert('그룹이 선택되지 않았습니다.');
      return;
    }

    this.http.post(`http://localhost:3000/group/${this.selectedGroup.id}/invite`, { groupId: this.selectedGroup.id, userId })
      .subscribe({
        next: () => {
          alert('초대가 성공적으로 보내졌습니다.');
          this.fetchGroupDetails(this.selectedGroup!.id);  // 그룹 정보를 다시 불러옴
        },
        error: (error) => {
          console.error('초대 중 오류 발생:', error);
          alert('초대에 실패했습니다.');
        }
      });
  }
}
