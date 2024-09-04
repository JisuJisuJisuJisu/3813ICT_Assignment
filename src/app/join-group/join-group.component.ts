import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule} from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Group {
  id: string;
  name: string;
  description: string;
}

@Component({
  selector: 'app-join-group',
  templateUrl: './join-group.component.html',
  imports:[CommonModule,FormsModule],
  standalone:true,
  styleUrls: ['./join-group.component.css']
})
export class JoinGroupComponent implements OnInit {
  groups: Group[] = [];
  isLoading: boolean = true;
  errorMessage: string | null = null;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
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
    // 그룹 가입 요청 로직 추가
    console.log(`Join request sent for group ID: ${groupId}`);
    alert(`Join request sent for group ID: ${groupId}`);
  }
}
