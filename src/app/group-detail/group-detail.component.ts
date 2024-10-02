import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { Group } from '../models/group.model';
import { Channel } from '../models/channel.model';
import { Router } from '@angular/router';


@Component({
  selector: 'app-group-detail',
  templateUrl: './group-detail.component.html',
  styleUrls: ['./group-detail.component.css'],
  standalone: true,
  imports: [CommonModule, RouterModule]  
})
export class GroupDetailComponent implements OnInit {
  group: Group | null = null;
  isLoading = true;  // 로딩 상태를 나타내는 변수 추가
  isSuperAdmin = false;
  isGroupAdmin = false;
  selectedChannel: Channel | null = null; // 선택된 채널 상태 관리
  showGroupDescription = true;  // 그룹 설명을 보여줄지 여부

  @Output() channelsUpdated = new EventEmitter<Channel[]>();  // 부모로 채널 전달

  constructor(private route: ActivatedRoute, private http: HttpClient, private router: Router) {}

  ngOnInit(): void {
    const groupId = this.route.snapshot.paramMap.get('id');  // URL에서 그룹 ID를 추출
    this.isSuperAdmin = this.checkIfSuperAdmin();
    this.isGroupAdmin = this.checkIfGroupAdmin();
    
    if (groupId) {
      this.http.get<Group>(`http://localhost:3000/groups/${groupId}`).subscribe({
        next: (group) => {
          console.log("Group data:", group);
          this.group = group;
          this.channelsUpdated.emit(group.channels);  // 채널 정보를 부모로 전달
          this.isLoading = false;  // 데이터가 로드된 후 로딩 상태 변경
        },
        error: (err) => {
          console.error('그룹 정보를 가져오는 중 오류 발생:', err);
          this.isLoading = false;  // 오류 발생 시에도 로딩 상태 변경
        }
      });
    }
  }

  onChannelClick(channel: Channel): void {
    this.selectedChannel = channel; // 선택한 채널을 상태에 저장
    console.log('Selected Channel:', this.selectedChannel);
    console.log('Group ID:', this.group?.id);
    console.log('hello');
  }

  checkIfSuperAdmin(): boolean {
    // 사용자 권한을 확인하는 로직 구현
    return true; // Super Admin 여부를 리턴
  }

  checkIfGroupAdmin(): boolean {
    // 사용자 권한을 확인하는 로직 구현
    return true; // Group Admin 여부를 리턴
  }

  // 그룹 멤버 및 Pending Users 관리 페이지로 이동하는 메서드
  goToGroupMembers(...args: []): void {
    if (this.group && this.group.id) {
      this.showGroupDescription = false;  // 그룹 설명 숨기기
      this.router.navigate([`/dashboard/group/${this.group.id}/members`]); // group.id 사용
    } else {
      console.error('Group ID가 존재하지 않습니다.');
    }
    console.log('hello');
  }
}
