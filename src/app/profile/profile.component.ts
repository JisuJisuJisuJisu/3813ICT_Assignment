import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { User } from '../models/user.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class ProfileComponent implements OnInit {
  user: User = {
    username: '',
    email: '',
    roles: [],
    id: '',
    password: '',
    groups: [],
    interestGroups: []
  };
  
  userGroups: any[] = []; // 사용자 그룹을 저장할 변수
  loggedInUserEmail: string | null = null;

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit(): void {
    // sessionStorage에서 이메일을 가져옴
    this.loggedInUserEmail = sessionStorage.getItem('loggedInUserEmail');
    console.log(this.loggedInUserEmail);

    // 로그인 정보가 없는 경우
    if (!this.loggedInUserEmail) {
      console.log('로그인 정보가 없습니다.');
      this.router.navigate(['/login']);  // 로그인 페이지로 리다이렉트
      return; // 더 이상 진행하지 않음
    }

    // 이메일이 존재하는 경우 서버에서 사용자 정보를 가져옴
    this.http.get<User>(`http://localhost:3000/users?email=${this.loggedInUserEmail}`).subscribe({
      next: (user: User) => {  // 서버에서 단일 사용자 객체가 반환되는 경우
        this.user = user;
        if (!this.user) {
          console.log('사용자 정보를 찾을 수 없습니다.');
          this.router.navigate(['/login']);
        } else {
          this.fetchUserGroups(this.user.id); // 사용자 그룹을 가져옴
        }
      },
      error: (error) => {
        console.error('사용자 정보를 불러오는 중 오류가 발생했습니다:', error);
      }
    });
  }

  // 사용자가 속한 그룹을 가져오는 메서드
  fetchUserGroups(userId: string): void {
    this.http.get<any[]>(`http://localhost:3000/groups`).subscribe({
      next: (groups) => {
        // 모든 그룹에서 pendingUsers에 userId가 포함된 그룹만 필터링
        this.userGroups = groups.filter(group => group.pendingUsers.includes(userId));
        console.log('가입 요청을 보낸 그룹:', this.userGroups);
      },
      error: (error) => {
        console.error('그룹 정보를 불러오는 중 오류가 발생했습니다:', error);
      }
    });
  }

  // 가입 요청 승인 메서드
approveJoinRequest(groupId: string, userId: string): void {
  this.http.put(`http://localhost:3000/groups/approve/${groupId}`, { userId }).subscribe({
    next: () => {
      console.log('가입 요청이 승인되었습니다.');
      this.fetchUserGroups(userId); // 그룹 목록을 새로 고침
    },
    error: (error) => {
      console.error('가입 요청 승인 중 오류 발생:', error);
    }
  });
}

// 가입 요청 거절 메서드
rejectJoinRequest(groupId: string, userId: string): void {
  this.http.put(`http://localhost:3000/groups/reject/${groupId}`, { userId }).subscribe({
    next: () => {
      console.log('가입 요청이 거절되었습니다.');
      this.fetchUserGroups(userId); // 그룹 목록을 새로 고침
    },
    error: (error) => {
      console.error('가입 요청 거절 중 오류 발생:', error);
    }
  });
}


  updateProfile(): void {
    if (this.user) {
      this.http.put(`http://localhost:3000/users/${this.user.id}`, this.user).subscribe({
        next: () => {
          console.log('프로필 업데이트 성공');
        },
        error: (error) => {
          console.error('프로필 업데이트 중 오류가 발생했습니다:', error);
        }
      });
    }
  }
}
