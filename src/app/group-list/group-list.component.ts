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
    // Retrieve 'loggedinUser' value from session storage
    const loggedInUser = sessionStorage.getItem('loggedinUser');
    
    if (!loggedInUser) {
      console.error('No user information stored in session.');
      return;
    }
  
    const user = JSON.parse(loggedInUser) as User;
    const loggedInUserEmail = user.email;
  
    // Fetch user list from server and update group information
    this.http.get<User[]>('http://localhost:3000/users').subscribe({
      next: (users) => {
        const foundUser = users.find(u => u.email === loggedInUserEmail);
  
        if (foundUser) {
          this.userGroups = foundUser.groups;
          console.log('User\'s group list:', this.userGroups);
        } else {
          console.error('User not found.');
        }
      },
      error: (err) => {
        console.error('Error occurred while fetching user information:', err);
      }
    });
  }
  
  onGroupClick(group: Group): void {
    console.log('Selected Group:', group); 
    this.groupSelected.emit(group); // When a group is selected, emit the selected group object to the parent component
    this.router.navigate(['/dashboard/group', group.id]);
  }
}
