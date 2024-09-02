import { Component, OnInit } from '@angular/core';
import { User } from '../models/user.model';
import { CommonModule } from '@angular/common'; 

@Component({
  selector: 'app-manage-users',
  standalone: true, // standalone 컴포넌트임을 명시합니다
  imports: [CommonModule], // CommonModule을 imports에 추가합니다
  templateUrl: './manage-users.component.html',
  styleUrls: ['./manage-users.component.css']
})
export class ManageUsersComponent implements OnInit {

  users: User[] = [];

  constructor() { }

  ngOnInit(): void {
    this.loadUsers(); // 컴포넌트가 로드될 때 사용자 목록을 불러옵니다.
  }

  loadUsers(): void {
    // 로컬 스토리지에서 사용자 목록을 불러옵니다.
    const storedUsers = localStorage.getItem('users');
    if (storedUsers) {
      this.users = JSON.parse(storedUsers);
    }
  }

  deleteUser(userId: string): void {
    // 사용자 삭제 로직
    this.users = this.users.filter(user => user.id !== userId);
    localStorage.setItem('users', JSON.stringify(this.users)); // 업데이트된 사용자 목록을 로컬 스토리지에 저장
  }

  changeUserRole(userId: string, newRole: string) {
    console.log(`Role changed to: ${newRole} for user with ID: ${userId}`);
    // 추후에 역할을 실제로 변경하는 로직 추가 가능
  }
  }
  // 추가적인 사용자 관리 함수들 (예: 사용자 추가, 수정 등) 추가 가능

