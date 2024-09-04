import { Component, OnInit } from '@angular/core';
import { User } from '../models/user.model';
import { Group } from '../models/group.model';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-group-list',
  templateUrl: './group-list.component.html',
  styleUrls: ['./group-list.component.css'],
  imports: [CommonModule],
  standalone: true
})
export class GroupListComponent implements OnInit {
  userGroups: Group[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    const loggedInUserEmail = sessionStorage.getItem('loggedInUserEmail');
  
    if (loggedInUserEmail) {
      // 서버에서 users.json 파일을 가져와 사용자 이메일과 일치하는 사용자의 그룹을 찾음
      this.http.get<User[]>('http://localhost:3000/users').subscribe({
        next: (users) => {
          const user = users.find(u => u.email === loggedInUserEmail);
  
          if (user) {
            this.userGroups = user.groups; // 사용자의 그룹 정보를 userGroups에 저장
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

  getUserGroups(): Group[] {
    return this.userGroups;
  }
}
