import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { User } from '../models/user.model';
import { Channel } from '../models/channel.model';
import { Group } from '../models/group.model';
import { GroupListComponent } from '../group-list/group-list.component';
import { GroupDetailComponent } from '../group-detail/group-detail.component';


@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, GroupListComponent, GroupDetailComponent],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  user: User | null = null;
  userChannels: Channel[] = [];
  loggedInUserEmail: string | null = null;
  selectedGroup: Group | null = null;
  selectedGroupChannels: Channel[] = [];

  constructor(private router: Router, private route: ActivatedRoute, private http: HttpClient) {}

  ngOnInit() {
    const loggedInUserEmail = sessionStorage.getItem('loggedInUserEmail');
    if (loggedInUserEmail) {
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

    // URL 변경에 따라 그룹 선택 및 채널 업데이트
    this.route.paramMap.subscribe(params => {
      const groupId = params.get('id');
      if (groupId) {
        this.fetchGroupChannels(groupId);
      }
    });
  }

  onChannelsUpdated(channels: Channel[]): void {
    console.log('Channels received from child component:', channels);
    this.selectedGroupChannels = channels; // 자식 컴포넌트로부터 받은 채널 정보 저장
  }

  onGroupSelected(group: Group): void {
    this.selectedGroup = group; // 선택된 그룹 저장
    this.selectedGroupChannels = group.channels || [];
    console.log('Selected group:', group);
  }

  fetchGroupChannels(groupId: string | null): void {
    if (!groupId) {
      console.error('Invalid group ID:', groupId);
      return;
    }
  
    console.log('Fetching channels for group ID:', groupId); // groupId 확인
  
    this.http.get<Group>(`http://localhost:3000/groups/${groupId}`).subscribe({
      next: (group) => {
        this.selectedGroup = group;
        this.selectedGroupChannels = group.channels || [];
        console.log('Fetched group data:', group); // group 데이터 확인
        console.log('Fetched group channels:', this.selectedGroupChannels); // 채널 데이터 확인
      },
      error: (error) => {
        console.error('그룹 채널 정보를 가져오는 중 오류 발생:', error);
      }
    });
  }

  isSuperAdmin(): boolean {
    return this.user?.roles.includes('Super Admin') || false;
  }

  isGroupAdmin(): boolean {
    return this.user?.roles.includes('Group Admin') || false;
  }
}
