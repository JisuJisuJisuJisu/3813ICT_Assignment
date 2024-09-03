import { Component, OnInit } from '@angular/core';
import { User } from '../models/user.model';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-manage-users',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './manage-users.component.html',
  styleUrls: ['./manage-users.component.css']
})
export class ManageUsersComponent implements OnInit {

  users: User[] = [];

  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    this.loadUsers(); // 컴포넌트가 로드될 때 사용자 목록을 불러옵니다.
  }

  loadUsers(): void {
    // 서버에서 사용자 목록을 불러옵니다.
    this.http.get<User[]>('http://localhost:3000/users').subscribe({
      next: (data) => {
        this.users = data;
      },
      error: (err) => {
        console.error('사용자 목록을 불러오는 중 오류가 발생했습니다.', err);
      }
    });
  }

  deleteUser(userId: string): void {
    // 서버로 DELETE 요청을 보냅니다.
    this.http.delete(`http://localhost:3000/users/${userId}`).subscribe({
      next: () => {
        // 사용자 목록에서 해당 사용자를 제거합니다.
        this.users = this.users.filter(user => user.id !== userId);
      },
      error: (err) => {
        console.error('사용자 삭제 중 오류가 발생했습니다.', err);
      }
    });
  }

  changeUserRole(userId: string, newRole: string): void {
    // 사용자의 역할을 변경하는 로직을 서버에 구현합니다.
    const user = this.users.find(u => u.id === userId);
    if (user) {
      user.roles = [newRole]; // 단순히 새로운 역할로 교체 (실제 요구사항에 따라 수정 가능)
      
      this.http.put(`http://localhost:3000/users/${userId}`, user).subscribe({
        next: () => {
          console.log(`Role changed to: ${newRole} for user with ID: ${userId}`);
        },
        error: (err) => {
          console.error('사용자 역할 변경 중 오류가 발생했습니다.', err);
        }
      });
    }
  }

  // 추가적인 사용자 관리 함수들 (예: 사용자 추가, 수정 등) 추가 가능
}
