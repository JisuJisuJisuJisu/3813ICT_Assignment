import { Component, OnInit } from '@angular/core';
import { User } from '../models/user.model';
import { Group } from '../models/group.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-group-list',
  templateUrl: './group-list.component.html',
  styleUrls: ['./group-list.component.css'],
  imports:[CommonModule],
  standalone:true
})
export class GroupListComponent implements OnInit {
  userGroups: Group[] = [];

  ngOnInit(): void {
    const loggedInUserEmail = sessionStorage.getItem('loggedInUserEmail');
  
    if (loggedInUserEmail) {
      const storedUsers = JSON.parse(localStorage.getItem('users') || '[]');
      const user = storedUsers.find((u: User) => u.email === loggedInUserEmail);
  
      if (user) {
        localStorage.setItem('currentUser', JSON.stringify(user));
        this.userGroups = user.groups;
      }
    }
  }

  getUserGroups(): Group[] {
    const userJson = localStorage.getItem('currentUser');
    const user: User = userJson ? JSON.parse(userJson) : null;
    return user ? user.groups : [];
  }
}
