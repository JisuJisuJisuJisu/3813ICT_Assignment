import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { User } from '../models/user.model';
import { Group } from '../models/group.model';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-group-list',
  templateUrl: './group-list.component.html',
  styleUrls: ['./group-list.component.css'],
  imports: [CommonModule, RouterModule],
  standalone: true
})
export class GroupListComponent implements OnInit {
  userGroups: Group[] = [];

  @Output() groupSelected = new EventEmitter<Group>();

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    const loggedInUserEmail = sessionStorage.getItem('loggedInUserEmail');
  
    if (loggedInUserEmail) {
      this.http.get<User[]>('http://localhost:3000/users').subscribe({
        next: (users) => {
          const user = users.find(u => u.email === loggedInUserEmail);
  
          if (user) {
            this.userGroups = user.groups;
          }
        },
        error: (err) => {
          console.error('사용자 정보를 가져오는 중 오류 발생:', err);
        }
      });
    } else {
      console.error('세션에 저장된 사용자 이메일이 없습니다.');
    }
  }

  onGroupClick(group: Group): void {
    this.groupSelected.emit(group); // 그룹 선택 시 해당 그룹 객체를 부모 컴포넌트로 전달
  }
}
