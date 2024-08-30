import { Component, OnInit } from '@angular/core';
import { Group } from '../models/group.model';
import { User } from '../models/user.model'; // 현재 사용자 정보에 대한 모델
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common'; 

@Component({
  selector: 'app-manage-groups',
  standalone: true,
  templateUrl: './manage-groups.component.html',
  styleUrls: ['./manage-groups.component.css'],
  imports: [FormsModule, CommonModule]
})
export class ManageGroupsComponent implements OnInit {

  groups: Group[] = []; // 모든 그룹 목록
  newGroup: Group = { id: '', name: '', description: '', createdBy: '', channels: [], imageUrl: '' }; // 새로운 그룹을 위한 객체
  user: User | null = null; // 현재 로그인한 사용자 정보
  isSuperAdmin: boolean = false; // 현재 사용자가 Super Admin인지 여부
  showModal: boolean = false; // 모달 가시성 제어
  router: any;

  constructor() { }

  onFileSelected(event: any): void {
    const file: File = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.newGroup.imageUrl = e.target.result;  // base64로 이미지 데이터를 저장합니다.
      };
      reader.readAsDataURL(file);
    }
  }
  ngOnInit(): void {
    this.loadUser();
    this.loadGroups();
    // 로컬 스토리지에서 모든 사용자 정보를 가져옴
    const storedUsers = localStorage.getItem('users');
    
    if (storedUsers) {
      const users = JSON.parse(storedUsers) as User[];

      // 현재 로그인한 사용자를 세션 스토리지에서 가져옴
      const loggedInUserEmail = sessionStorage.getItem('loggedInUserEmail');

      // 로그인된 사용자를 users 배열에서 찾음
      this.user = users.find(u => u.email === loggedInUserEmail) || null;

      if (this.user) {
        console.log('현재 사용자:', this.user);
      } else {
        console.log('사용자를 찾을 수 없습니다.');
        // 로그인이 필요한 경우 로그인 페이지로 리디렉션
        this.router.navigate(['/login']);
      }
    } else {
      console.log('사용자 목록이 없습니다.');
      // 로그인이 필요한 경우 로그인 페이지로 리디렉션
      this.router.navigate(['/login']);
    }
  }


  loadUser(): void {
    const storedUsers = localStorage.getItem('users');
    
    if (storedUsers) {
      const users = JSON.parse(storedUsers) as User[];

      // 현재 로그인한 사용자를 세션 스토리지에서 가져옴
      const loggedInUserEmail = sessionStorage.getItem('loggedInUserEmail');

      // 로그인된 사용자를 users 배열에서 찾음
      this.user = users.find(u => u.email === loggedInUserEmail) || null;

      if (this.user) {
        this.isSuperAdmin = this.user.roles.includes('Super Admin');
        console.log('현재 사용자:', this.user);
      } else {
        console.log('사용자를 찾을 수 없습니다.');
        // 로그인이 필요한 경우 로그인 페이지로 리디렉션
        this.router.navigate(['/login']);
      }
    } else {
      console.log('사용자 목록이 없습니다.');
      // 로그인이 필요한 경우 로그인 페이지로 리디렉션
      this.router.navigate(['/login']);
    }
  }

  loadGroups(): void {
    const storedGroups = localStorage.getItem('groups');
    if (storedGroups) {
      const allGroups = JSON.parse(storedGroups) as Group[];
      if (this.isSuperAdmin) {
        this.groups = allGroups;
      } else {
        this.groups = allGroups.filter(group => group.createdBy === this.user?.id);
      }
    }
  }

  deleteGroup(groupId: string): void {
    if (this.isSuperAdmin || this.groups.some(group => group.id === groupId && group.createdBy === this.user?.id)) {
        
        // 그룹 리스트에서 해당 그룹 삭제
        this.groups = this.groups.filter(group => group.id !== groupId);
        localStorage.setItem('groups', JSON.stringify(this.groups));

        // 사용자 정보에서 해당 그룹 삭제
        if (this.user) {
            this.user.groups = this.user.groups.filter(group => group.id !== groupId);
            
            // 사용자 정보 갱신
            const storedUsers = JSON.parse(localStorage.getItem('users') || '[]') as User[];
            const updatedUsers = storedUsers.map(u => u.id === this.user?.id ? this.user : u);
            localStorage.setItem('users', JSON.stringify(updatedUsers));
        }

    } else {
        alert('You do not have permission to delete this group.');
    }
}

  generateUniqueId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  
  onSubmit(): void {
    // 새로운 그룹 생성
    this.newGroup.id = this.generateUniqueId();
    this.newGroup.createdBy = this.user?.id || '';
    
    // 그룹 추가
    this.groups.push({ ...this.newGroup });
  
    // 현재 사용자에 그룹 추가
    if (this.user) {
      this.user.groups.push({ ...this.newGroup });  // 새로운 그룹 객체를 사용자의 groups에 추가
  
      // 사용자 정보 갱신
      const storedUsers = JSON.parse(localStorage.getItem('users') || '[]') as User[];
      const updatedUsers = storedUsers.map(u => u.id === this.user?.id ? this.user : u);
      localStorage.setItem('users', JSON.stringify(updatedUsers));
    }
  
    // 그룹 정보 저장
    localStorage.setItem('groups', JSON.stringify(this.groups));
  
    // 폼 리셋 및 모달 닫기
    this.newGroup = { id: '', name: '', description: '', createdBy: '', channels: [] };
    this.showModal = false;
  }
}
