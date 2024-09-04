import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Group {
  id: string;
  name: string;
  description: string;
}

@Component({
  selector: 'app-join-group',
  templateUrl: './join-group.component.html',
  imports: [CommonModule, FormsModule],
  standalone: true,
  styleUrls: ['./join-group.component.css']
})
export class JoinGroupComponent implements OnInit {
  groups: Group[] = [];
  isLoading: boolean = true;
  errorMessage: string | null = null;
  loggedInUserEmail: string | null = null;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loggedInUserEmail = sessionStorage.getItem('loggedInUserEmail'); // 현재 로그인한 사용자의 이메일 가져오기
    this.fetchGroups();
  }

  fetchGroups(): void {
    this.http.get<Group[]>('http://localhost:3000/groups')
      .subscribe({
        next: (groups) => {
          this.groups = groups;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error fetching groups:', error);
          this.errorMessage = 'Error loading groups';
          this.isLoading = false;
        }
      });
  }

  joinGroup(groupId: string): void {
    if (this.loggedInUserEmail) {
      const requestData = { email: this.loggedInUserEmail }; // 요청 데이터: 사용자 이메일

      this.http.post(`http://localhost:3000/groups/${groupId}/join`, requestData)
        .subscribe({
          next: () => {
            alert(`Join request sent for group ID: ${groupId}`);
          },
          error: (error) => {
            console.error('Error sending join request:', error);
            alert('Failed to send join request.');
          }
        });
    } else {
      alert('You must be logged in to join a group.');
    }
  }
}
