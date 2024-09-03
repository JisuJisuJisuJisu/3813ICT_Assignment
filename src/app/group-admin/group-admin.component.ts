import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { User } from '../models/user.model';
import { Group } from '../models/group.model';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-group-admin',
  templateUrl: './group-admin.component.html',
  standalone: true,
  imports: [CommonModule, RouterModule],
  styleUrls: ['./group-admin.component.css']
})
export class GroupAdminComponent implements OnInit {
  user: User | null = null;
  userGroups: Group[] = [];  // Group Admin이 관리하는 그룹 목록
  userChannels: any[] = [];  // 사용자가 속한 채널 목록
  isGroupAdmin: boolean = false;
  isSuperAdmin: boolean = false;

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit() {
    // 세션 스토리지에서 로그인된 사용자의 이메일을 가져옵니다.
    const loggedInUserEmail = sessionStorage.getItem('loggedInUserEmail');

    if (loggedInUserEmail) {
      // 서버에서 사용자 정보를 가져옵니다.
      this.http.get<User[]>(`http://localhost:3000/users`).subscribe({
        next: (users: User[]) => {
          this.user = users.find(u => u.email === loggedInUserEmail) || null;

          if (this.user) {
            this.isGroupAdmin = this.user.roles.includes('Group Admin');
            this.isSuperAdmin = this.user.roles.includes('Super Admin');

            if (!this.isGroupAdmin && !this.isSuperAdmin) {
              console.log('이 사용자는 Group Admin 또는 Super Admin이 아닙니다.');
              this.router.navigate(['/dashboard']);  // 권한이 없는 경우 대시보드로 리디렉션
            } else {
              this.loadUserGroups();  // 사용자가 관리하는 그룹 목록을 가져옵니다.
            }
          } else {
            console.log('사용자 정보를 찾을 수 없습니다.');
            this.router.navigate(['/login']);  // 사용자가 없는 경우 로그인 페이지로 리디렉션
          }
        },
        error: (error) => {
          console.error('사용자 정보를 가져오는 중 오류 발생:', error);
        }
      });
    } else {
      console.log('로그인 정보가 없습니다.');
      this.router.navigate(['/login']);  // 로그인 정보가 없는 경우 로그인 페이지로 리디렉션
    }
  }

  loadUserGroups(): void {
    // Group Admin이 관리하는 그룹만 필터링하여 가져오는 로직
    if (this.user) {
      this.http.get<Group[]>(`http://localhost:3000/groups`).subscribe({
        next: (groups: Group[]) => {
          this.userGroups = groups.filter(group => group.createdBy === this.user!.id);
        },
        error: (error) => {
          console.error('그룹 정보를 가져오는 중 오류 발생:', error);
        }
      });
    }
  }

  // 사용자가 Super Admin인지 확인하는 메서드
  isSuperAdminFunc(): boolean {
    return this.user?.roles.includes('Super Admin') || false;
  }

  // 사용자가 Group Admin인지 확인하는 메서드
  isGroupAdminFunc(): boolean {
    return this.user?.roles.includes('Group Admin') || false;
  }
}
