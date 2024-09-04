import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { User } from '../models/user.model';  // 사용자 모델 정의
import { Group } from '../models/group.model';  // 그룹 모델

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  user: User | null = null;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.getUserProfile();
  }

  getUserProfile(): void {
    // 세션에서 로그인한 사용자의 이메일 정보를 불러옵니다.
    const loggedInUserEmail = sessionStorage.getItem('loggedInUserEmail');
    if (loggedInUserEmail) {
      this.http.get<User>(`http://localhost:3000/users?email=${loggedInUserEmail}`).subscribe({
        next: (userData) => {
          this.user = userData;
        },
        error: (err) => {
          console.error('사용자 정보를 불러오는 중 오류가 발생했습니다:', err);
        }
      });
    }
  }

  saveProfile(): void {
    if (this.user) {
      this.http.put(`http://localhost:3000/users/${this.user.id}`, this.user).subscribe({
        next: () => {
          alert('프로필이 성공적으로 업데이트되었습니다.');
        },
        error: (err) => {
          console.error('프로필 업데이트 중 오류가 발생했습니다:', err);
        }
      });
    }
  }
}
