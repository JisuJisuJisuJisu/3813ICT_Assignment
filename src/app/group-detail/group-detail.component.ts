import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { Group } from '../models/group.model';
import { Channel } from '../models/channel.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-group-detail',
  templateUrl: './group-detail.component.html',
  styleUrls: ['./group-detail.component.css'],
  standalone: true,
  imports: [CommonModule, RouterModule]  
})
export class GroupDetailComponent implements OnInit {
  group: Group | null = null;
  isLoading = true;  // Variable to indicate loading state
  isSuperAdmin = false;
  isGroupAdmin = false;
  selectedChannel: Channel | null = null; // Manages the state of the selected channel
  showGroupDescription = true;  // Whether to display the group description

  @Output() channelsUpdated = new EventEmitter<Channel[]>();  // Emits channels to the parent component

  constructor(private route: ActivatedRoute, private http: HttpClient, private router: Router) {}

  ngOnInit(): void {
    const groupId = this.route.snapshot.paramMap.get('id');  // Extracts the group ID from the URL
    this.isSuperAdmin = this.checkIfSuperAdmin();
    this.isGroupAdmin = this.checkIfGroupAdmin();
    
    if (groupId) {
      this.http.get<Group>(`http://localhost:3000/groups/${groupId}`).subscribe({
        next: (group) => {
          console.log("Group data:", group);
          this.group = group;
          this.channelsUpdated.emit(group.channels);  // Sends channel information to the parent component
          this.isLoading = false;  // Changes the loading state after data is loaded
        },
        error: (err) => {
          console.error('Error occurred while fetching group information:', err);
          this.isLoading = false;  // Changes the loading state even when an error occurs
        }
      });
    }
  }

  onChannelClick(channel: Channel): void {
    this.selectedChannel = channel; // Stores the selected channel in the state
    console.log('Selected Channel:', this.selectedChannel);
    console.log('Group ID:', this.group?.id);
    console.log('hello');
  }

  checkIfSuperAdmin(): boolean {
    // Logic to check if the user is a Super Admin
    return true; // Returns whether the user is a Super Admin
  }

  checkIfGroupAdmin(): boolean {
    // Logic to check if the user is a Group Admin
    return true; // Returns whether the user is a Group Admin
  }

  // Method to navigate to the group members and pending users management page
  goToGroupMembers(...args: []): void {
    if (this.group && this.group.id) {
      this.showGroupDescription = false;  // Hides the group description
      this.router.navigate([`/dashboard/group/${this.group.id}/members`]); // Uses group.id for navigation
    } else {
      console.error('Group ID does not exist.');
    }
    console.log('hello');
  }
}
