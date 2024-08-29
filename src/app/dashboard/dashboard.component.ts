import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { User } from '../models/user.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  user: User | null = null;  // 초기값을 null로 설정

  constructor(private router: Router) {}

  ngOnInit() {
    // 로컬 스토리지에서 모든 사용자 정보를 가져옵니다.
    const storedUsers = localStorage.getItem('users');
    
    if (storedUsers) {
      const users = JSON.parse(storedUsers) as User[];

      // 현재 로그인한 사용자를 세션 스토리지 등에서 가져옵니다.
      const loggedInUserEmail = sessionStorage.getItem('loggedInUserEmail');

      // 로그인된 사용자를 users 배열에서 찾음
      this.user = users.find(u => u.email === loggedInUserEmail) || null;

      if (this.user) {
        // 사용자가 Super Admin인지 확인
        if (this.isSuperAdmin()) {
          console.log('Super Admin 로그인:', this.user);
        } else {
          console.log('일반 사용자 로그인:', this.user);
        }
      } else {
        console.log('사용자 정보가 없습니다.');
        // 로그인이 필요한 경우 로그인 페이지로 리디렉션
        this.router.navigate(['/login']);
      }
    } else {
      console.log('사용자 목록이 없습니다.');
      // 로그인이 필요한 경우 로그인 페이지로 리디렉션
      this.router.navigate(['/login']);
    }
  }

  isSuperAdmin(): boolean {
    return this.user?.roles.includes('Super Admin') || false;
  }

  isGroupAdmin(): boolean {
    return this.user?.roles.includes('Group Admin') || false;
  }
}
