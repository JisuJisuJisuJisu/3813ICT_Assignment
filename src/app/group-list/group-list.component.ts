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
      // 서버에서 사용자 정보를 가져옴
      this.http.get<User[]>('http://localhost:3000/users').subscribe({
        next: (users) => {
          const user = users.find(u => u.email === loggedInUserEmail);
  
          if (user) {
            sessionStorage.setItem('currentUser', JSON.stringify(user));
            this.userGroups = user.groups;
          }
        },
        error: (err) => {
          console.error('사용자 정보를 가져오는 중 오류 발생:', err);
        }
      });
    }
  }

  getUserGroups(): Group[] {
    const userJson = sessionStorage.getItem('currentUser');
    const user: User = userJson ? JSON.parse(userJson) : null;
    return user ? user.groups : [];
  }
}
