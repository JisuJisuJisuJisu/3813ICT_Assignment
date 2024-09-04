import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';


interface User {
  id: string;
  email: string;
  username: string;
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
  isLoading: boolean = true;
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
