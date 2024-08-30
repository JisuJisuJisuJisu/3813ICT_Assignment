import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-super-admin',
  standalone: true,
  imports: [CommonModule,RouterModule],
  templateUrl: './super-admin.component.html',
  styleUrl: './super-admin.component.css'
})
export class SuperAdminComponent {
  // 임시로 user 역할을 설정 (나중에 실제 사용자 정보에서 가져올 수 있음)
  // 사용자 역할을 확인하는 메서드들
  user = {
    roles: ['Super Admin', 'Group Admin']  // 실제 사용자 정보에서 roles를 가져옵니다
  };

  // 사용자가 가입한 채널 목록
  userChannels = [
    { name: 'Channel 1' },
    { name: 'Channel 2' },
    { name: 'Channel 3' }
  ];

  isSuperAdmin(): boolean {
    return this.user.roles.includes('Super Admin');
  }

  isGroupAdmin(): boolean {
    return this.user.roles.includes('Group Admin');
  }

}
