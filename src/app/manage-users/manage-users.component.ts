import { Component, OnInit } from '@angular/core';
import { User } from '../models/user.model';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';  

@Component({
  selector: 'app-manage-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './manage-users.component.html',
  styleUrls: ['./manage-users.component.css']
})
export class ManageUsersComponent implements OnInit {

  users: User[] = [];
  selectedUser: User | null = null;
  newRole: string = '';

  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.http.get<User[]>('http://localhost:3000/users').subscribe({
      next: (data) => {
        this.users = data;
      },
      error: (err) => {
        console.error('사용자 목록을 불러오는 중 오류가 발생했습니다.', err);
      }
    });
  }

  openRoleModal(user: User): void {
    this.selectedUser = user;
    this.newRole = user.roles[0]; // 현재 역할을 기본값으로 설정
    const modalElement = document.getElementById('roleModal');
    if (modalElement) {
      modalElement.classList.add('show');
      modalElement.style.display = 'block';
    }
  }

  closeRoleModal(): void {
    const modalElement = document.getElementById('roleModal');
    if (modalElement) {
      modalElement.classList.remove('show');
      modalElement.style.display = 'none';
    }
  }

  confirmRoleChange(): void {
    if (this.selectedUser) {
        this.changeUserRole(this.selectedUser.id, this.newRole, () => {
            this.updateLocalStorageUser(this.selectedUser!.id);
            this.closeRoleModal(); // 역할 변경 후 모달 닫기
        });
    }
}

changeUserRole(userId: string, newRole: string, callback?: () => void): void {
  const user = this.users.find(u => u.id === userId);
  if (user) {
      user.roles = [newRole];

      // MongoDB에서는 _id 필드가 수정되지 않도록 _id 필드를 삭제한 데이터를 전송
      const { _id, ...updatedUserData } = user;

      this.http.put(`http://localhost:3000/users/${userId}`, updatedUserData).subscribe({
          next: () => {
              console.log(`Role changed to: ${newRole} for user with ID: ${userId}`);
              
              // 로컬 스토리지에서 사용자 역할 업데이트
              let storedUsers = JSON.parse(localStorage.getItem('users') || '[]');
              storedUsers = storedUsers.map((u: any) => {
                  if (u.id === userId) {
                      u.roles = [newRole];
                  }
                  return u;
              });
              localStorage.setItem('users', JSON.stringify(storedUsers));

              // 콜백 함수가 존재하는 경우 호출
              if (callback) {
                  callback();
              }
          },
          error: (err) => {
              console.error('사용자 역할 변경 중 오류가 발생했습니다.', err);
          }
      });
  }
}

updateLocalStorageUser(userId: string): void {
  this.http.get<User>(`http://localhost:3000/users/${userId}`).subscribe({
      next: (user) => {
          const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
          if (currentUser.id === userId) {
              currentUser.roles = user.roles;
              localStorage.setItem('currentUser', JSON.stringify(currentUser));
          }
      },
      error: (err) => {
          console.error('사용자 정보를 가져오는 중 오류가 발생했습니다.', err);
          console.log('서버에서 전달된 에러:', err.message); // 추가로 에러 메시지 로그
      }
  });
}
deleteUser(userId: string): void {
  this.http.delete(`http://localhost:3000/users/${userId}`).subscribe({
      next: () => {
          console.log(`User with ID ${userId} deleted successfully`);
          
          // 로컬 스토리지에서 해당 사용자 삭제
          let storedUsers = JSON.parse(localStorage.getItem('users') || '[]');
          storedUsers = storedUsers.filter((user: any) => user.id !== userId);
          localStorage.setItem('users', JSON.stringify(storedUsers));

          // 필요한 추가 작업
      },
      error: (err) => {
          console.error('사용자 삭제 중 오류가 발생했습니다.', err);
      }
  });
}

}
