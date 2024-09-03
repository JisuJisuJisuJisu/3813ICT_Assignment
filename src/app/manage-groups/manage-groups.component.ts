import { Component, OnInit } from '@angular/core';
import { Group } from '../models/group.model';
import { User } from '../models/user.model'; // 현재 사용자 정보에 대한 모델
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

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

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadUser();
    this.loadGroups();
  }

  loadUser(): void {
    const loggedInUserEmail = sessionStorage.getItem('loggedInUserEmail');

    if (loggedInUserEmail) {
      this.http.get<User[]>(`http://localhost:3000/users`).subscribe({
        next: (users: User[]) => {
          this.user = users.find(u => u.email === loggedInUserEmail) || null;

          if (this.user) {
            this.isSuperAdmin = this.user.roles.includes('Super Admin');
            console.log('현재 사용자:', this.user);
          } else {
            console.log('사용자를 찾을 수 없습니다.');
            // 로그인이 필요한 경우 로그인 페이지로 리디렉션
            this.router.navigate(['/login']);
          }
        },
        error: (error) => {
          console.error('사용자 정보를 가져오는 중 오류 발생:', error);
        }
      });
    } else {
      console.log('로그인 정보가 없습니다.');
      // 로그인이 필요한 경우 로그인 페이지로 리디렉션
      this.router.navigate(['/login']);
    }
  }

  loadGroups(): void {
    this.http.get<Group[]>(`http://localhost:3000/groups`).subscribe({
      next: (groups: Group[]) => {
        if (this.isSuperAdmin) {
          this.groups = groups;
        } else {
          this.groups = groups.filter(group => group.createdBy === this.user?.id);
        }
      },
      error: (error) => {
        console.error('그룹 정보를 가져오는 중 오류 발생:', error);
      }
    });
  }

  deleteGroup(groupId: string): void {
    if (this.isSuperAdmin || this.groups.some(group => group.id === groupId && group.createdBy === this.user?.id)) {
      this.http.delete(`http://localhost:3000/groups/${groupId}`).subscribe({
        next: () => {
          // 그룹 리스트에서 해당 그룹 삭제
          this.groups = this.groups.filter(group => group.id !== groupId);

          if (this.user) {
            this.user.groups = this.user.groups.filter(group => group.id !== groupId);
            // 사용자 정보 갱신
            this.updateUserInStorage(this.user);
          }
        },
        error: (error) => {
          console.error('그룹 삭제 중 오류 발생:', error);
        }
      });
    } else {
      alert('You do not have permission to delete this group.');
    }
  }

  updateUserInStorage(user: User): void {
    this.http.put(`http://localhost:3000/users/${user.id}`, user).subscribe({
      next: () => {
        console.log('사용자 정보가 성공적으로 갱신되었습니다.');
      },
      error: (error) => {
        console.error('사용자 정보 갱신 중 오류 발생:', error);
      }
    });
  }

  generateUniqueId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  onFileSelected(event: any): void {
    const file: File = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        console.log('File selected:', e.target.result);
        // 필요한 경우 여기서 이미지 데이터를 처리합니다
      };
      reader.readAsDataURL(file);
    }
  }
  
  onSubmit(): void {
    // 새로운 그룹 생성
    this.newGroup.id = this.generateUniqueId();
    this.newGroup.createdBy = this.user?.id || '';

    // 서버에 새로운 그룹 추가 요청
    this.http.post<Group>(`http://localhost:3000/groups`, this.newGroup).subscribe({
      next: (group) => {
        // 그룹 추가
        this.groups.push(group);

        // 현재 사용자에 그룹 추가
        if (this.user) {
          this.user.groups.push(group);
          this.updateUserInStorage(this.user);
        }

        // 폼 리셋 및 모달 닫기
        this.newGroup = { id: '', name: '', description: '', createdBy: '', channels: [], imageUrl: '' };
        this.showModal = false;
      },
      error: (error) => {
        console.error('그룹 생성 중 오류 발생:', error);
      }
    });
  }
}
