import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { User } from '../models/user.model';
import { Group } from '../models/group.model';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';

@Component({
  selector: 'app-group-list',
  templateUrl: './group-list.component.html',
  styleUrls: ['./group-list.component.css'],
  imports: [CommonModule, RouterModule],
  standalone: true
})
export class GroupListComponent implements OnInit {
  userGroups: Group[] = [];
  @Input() selectedGroup: Group | null = null;
  @Output() groupSelected = new EventEmitter<Group>();

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit(): void {
    // 세션 스토리지에서 'loggedinUser' 값을 가져옴
    const loggedInUser = sessionStorage.getItem('loggedinUser');
    
    if (!loggedInUser) {
      console.error('세션에 저장된 사용자 정보가 없습니다.');
      return;
    }
  
    const user = JSON.parse(loggedInUser) as User;
    const loggedInUserEmail = user.email;
  
    // 서버에서 사용자 목록을 가져와서 그룹 정보 업데이트
    this.http.get<User[]>('http://localhost:3000/users').subscribe({
      next: (users) => {
        const foundUser = users.find(u => u.email === loggedInUserEmail);
  
        if (foundUser) {
          this.userGroups = foundUser.groups;
          console.log('사용자의 그룹 목록:', this.userGroups);
        } else {
          console.error('사용자를 찾을 수 없습니다.');
        }
      },
      error: (err) => {
        console.error('사용자 정보를 가져오는 중 오류 발생:', err);
      }
    });
  }
  
  onGroupClick(group: Group): void {
    this.groupSelected.emit(group); // 그룹 선택 시 해당 그룹 객체를 부모 컴포넌트로 전달
    this.router.navigate(['/dashboard/group', group.id]);
  }
}
