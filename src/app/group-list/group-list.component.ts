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
      this.getUserData(loggedInUserEmail);
    } else {
      console.log('로그인 정보가 없습니다.');
    }
  }

  getUserData(email: string): void {
    this.http.get<User[]>('http://localhost:3000/users').subscribe({
      next: (users) => {
        const user = users.find(u => u.email === email);
        if (user) {
          this.userGroups = user.groups;
        } else {
          console.log('사용자를 찾을 수 없습니다.');
        }
      },
      error: (err) => {
        console.error('사용자 정보를 가져오는 중 오류 발생:', err);
      }
    });
  }

  getUserGroups(): Group[] {
    return this.userGroups;
  }
}
