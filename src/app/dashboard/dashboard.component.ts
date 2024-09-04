import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { User } from '../models/user.model';
import { Router } from '@angular/router';
import { Channel } from '../models/channel.model'; 
import { Group } from '../models/group.model';
import { HttpClient } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { GroupListComponent } from '../group-list/group-list.component';


@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule,GroupListComponent],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  user: User | null = null;
  selectedGroup: Group | null = null;  // 선택된 그룹

  constructor(private router: Router, private http: HttpClient) {}

  ngOnInit() {
    // 세션 스토리지에서 로그인된 사용자의 이메일을 가져옴
    const loggedInUserEmail = sessionStorage.getItem('loggedInUserEmail');

    if (loggedInUserEmail) {
      // 서버로부터 사용자 데이터를 가져옵니다.
      this.http.get<User[]>(`http://localhost:3000/users`).subscribe({
        next: (users: User[]) => {
          this.user = users.find(u => u.email === loggedInUserEmail) || null;

          if (!this.user) {
            console.log('사용자 정보가 없습니다.');
            this.router.navigate(['/login']);
          }
        },
        error: (error) => {
          console.error('사용자 정보를 가져오는 중 오류 발생:', error);
          this.router.navigate(['/login']);
        }
      });
    } else {
      console.log('로그인 정보가 없습니다.');
      this.router.navigate(['/login']);
    }
  }

  onGroupSelected(group: Group): void {
    this.selectedGroup = group;  // 선택된 그룹 저장
    console.log('Selected group:', group);
  }

  isSuperAdmin(): boolean {
    return this.user?.roles.includes('Super Admin') || false;
  }

  isGroupAdmin(): boolean {
    return this.user?.roles.includes('Group Admin') || false;
  }
}

