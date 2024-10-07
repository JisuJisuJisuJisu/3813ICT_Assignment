import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

interface User {
  interestGroups: any;
  id: string;
  email: string;
  username: string;
  roles: string[];
}

interface Group {
  id: string;
  name: string;
  pendingUsers: string[];
  members: string[]; // members는 이제 User 객체가 아닌 사용자 ID만을 저장
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
  interestedUsers: User[] = [];  // 요청을 보낸 유저들
  isLoading: boolean = true;
  showAllUsers: boolean = false;
  showInterestUsers: boolean = false;  // 요청 보낸 유저 리스트를 보여줄지 여부
  errorMessage: string | null = null;
  memberDetails: User[] = []; // 멤버의 상세 정보를 저장

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
          this.fetchAllUsers(); // 전체 유저 리스트를 불러와서 멤버 정보를 매핑
        },
        error: (error) => {
          console.error('그룹을 불러오는 중 오류 발생:', error);
          this.errorMessage = '그룹을 불러오는 데 실패했습니다.';
          this.isLoading = false;
        }
      });
  }

  // 전체 유저 리스트 가져오기
  fetchAllUsers(): void {
    this.http.get<User[]>('http://localhost:3000/users')
      .subscribe({
        next: (users) => {
          console.log('Fetched Users:', users);
          this.allUsers = users;
          this.mapMemberDetails();
          this.isLoading = false;
        },
        error: (error) => {
          console.error('유저 리스트를 불러오는 중 오류 발생:', error);
          this.errorMessage = '유저 리스트를 불러오는 데 실패했습니다.';
          this.isLoading = false;
        }
      });
  }

  // 그룹 멤버 ID를 전체 유저 정보와 매핑하여 상세 정보 생성
  mapMemberDetails(): void {
    if (this.selectedGroup) {
      this.memberDetails = this.selectedGroup.members
        .map(memberId => this.allUsers.find(user => user.id === memberId))
        .filter((user): user is User => user !== undefined);
      console.log('Mapped Member Details:', this.memberDetails);
    }
  }

  // Invite 버튼 클릭 시 전체 유저 리스트를 표시
  inviteUser(): void {
    this.showAllUsers = true;  // 전체 유저 리스트를 보여줌
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

  // Request 버튼 클릭 시 요청 보낸 유저 리스트를 가져옴
  requestUser() {
    if (!this.selectedGroup || !this.selectedGroup.id) {
      alert('그룹이 선택되지 않았습니다.');
      return;
    }

    this.showInterestUsers = true;  // 관심 유저 리스트를 보여줌

    // InterestGroups에 해당 그룹 ID가 포함된 유저들을 필터링
    this.interestedUsers = this.allUsers.filter(user => 
      user.interestGroups && user.interestGroups.includes(this.selectedGroup!.id)
    );

    // 필터링된 유저 리스트를 출력 (콘솔 로그 또는 화면에 표시)
    console.log('Users interested in this group:', this.interestedUsers);
  }

  // 유저를 그룹에 승인
  allowUserToJoin(groupId: string | undefined, userId: string): void {
    if (!this.selectedGroup || !this.selectedGroup.id) {
      alert('그룹이 선택되지 않았습니다.');
      return;
    }

    // 서버에 요청하여 사용자를 그룹에 추가 (members)하고, pendingUsers에서 제거
    this.http.put(`http://localhost:3000/groups/approve/${groupId}`, { userId })
      .subscribe({
        next: () => {
          alert('사용자가 승인되었습니다.');
          this.fetchGroupDetails(this.selectedGroup!.id);  // 그룹 정보를 다시 불러옴
        },
        error: (error) => {
          console.error('사용자 승인 중 오류 발생:', error);
          alert('사용자 승인이 실패했습니다.');
        }
      });
  }

  // 유저를 그룹에서 거부
  rejectUserFromGroup(groupId: string | undefined, userId: string): void {
    if (!this.selectedGroup || !this.selectedGroup.id) {
      alert('그룹이 선택되지 않았습니다.');
      return;
    }

    // 서버에 요청하여 사용자를 pendingUsers에서 제거
    this.http.put(`http://localhost:3000/groups/reject/${groupId}`, { userId })
      .subscribe({
        next: () => {
          alert('사용자가 거부되었습니다.');
          this.fetchGroupDetails(this.selectedGroup!.id);  // 그룹 정보를 다시 불러옴
        },
        error: (error) => {
          console.error('사용자 거부 중 오류 발생:', error);
          alert('사용자 거부가 실패했습니다.');
        }
      });
  }
}
