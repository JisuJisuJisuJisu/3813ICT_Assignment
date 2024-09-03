import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { User } from '../models/user.model';  // User 모델 가져오기

@Component({
  selector: 'app-super-admin',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './super-admin.component.html',
  styleUrls: ['./super-admin.component.css']  // 'styleUrl'이 아닌 'styleUrls'로 수정
})
export class SuperAdminComponent implements OnInit {
  user: User | null = null;  // 초기값을 null로 설정하여 서버에서 실제 사용자 정보를 가져옵니다.
  userChannels = [];  // 사용자가 가입한 채널 목록

  constructor(private http: HttpClient) {}

  ngOnInit() {
    // 세션 스토리지에서 로그인된 사용자의 이메일을 가져옵니다.
    const loggedInUserEmail = sessionStorage.getItem('loggedInUserEmail');

    if (loggedInUserEmail) {
      // 서버에서 사용자 정보를 가져옵니다.
      this.http.get<User[]>(`http://localhost:3000/users`).subscribe({
        next: (users: User[]) => {
          this.user = users.find(u => u.email === loggedInUserEmail) || null;

          if (this.user) {
            // 사용자가 가입한 그룹의 채널 목록을 가져옵니다.
            // this.userChannels = this.getUserChannels(this.user.groups);
          } else {
            console.log('사용자 정보를 찾을 수 없습니다.');
          }
        },
        error: (error) => {
          console.error('사용자 정보를 가져오는 중 오류 발생:', error);
        }
      });
    } else {
      console.log('로그인 정보가 없습니다.');
    }
  }

  // getUserChannels(groups: any[]): any[] {
  //   const channels = [];
  //   groups.forEach(group => {
  //     channels.push(...group.channels);  // 그룹 내의 채널들을 채널 배열에 추가합니다.
  //   });
  //   return channels;
  // }

  isSuperAdmin(): boolean {
    return this.user?.roles.includes('Super Admin') || false;
  }

  isGroupAdmin(): boolean {
    return this.user?.roles.includes('Group Admin') || false;
  }
}

