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
  interestGroups: string[] = []; // 사용자가 이미 요청한 그룹 리스트
  isLoading: boolean = true;
  errorMessage: string | null = null;
  loggedInUserEmail: string | null = null;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loggedInUserEmail = sessionStorage.getItem('loggedInUserEmail'); // 현재 로그인한 사용자의 이메일 가져오기
    this.fetchInterestGroups(); // 관심 그룹 먼저 불러오기
    this.fetchGroups(); // 전체 그룹 불러오기
  }

  fetchInterestGroups(): void {
    if (this.loggedInUserEmail) {
      this.http.get<string[]>(`http://localhost:3000/users/${this.loggedInUserEmail}/interest-groups`)
        .subscribe({
          next: (interestGroups) => {
            this.interestGroups = interestGroups; // 관심 그룹 업데이트
          },
          error: (error) => {
            console.error('Error fetching interest groups:', error);
            this.errorMessage = 'Error loading interest groups';
          }
        });
    }
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
      if (this.interestGroups.includes(groupId)) {
        alert('You have already requested to join this group.');
        return;
      }

      const requestData = { email: this.loggedInUserEmail }; // 요청 데이터: 사용자 이메일

      this.http.post(`http://localhost:3000/groups/${groupId}/join`, requestData)
        .subscribe({
          next: () => {
            alert(`Join request sent for group ID: ${groupId}`);
            this.interestGroups.push(groupId); // 요청 후 interestGroups에 추가
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
