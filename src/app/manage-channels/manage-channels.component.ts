import { Component, OnInit } from '@angular/core';
import { Channel } from '../models/channel.model'; // Using Channel model
import { Group } from '../models/group.model'; // Using Group model
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { User } from '../models/user.model'; // Using User model

@Component({
  selector: 'app-manage-channels',
  standalone: true,
  templateUrl: './manage-channels.component.html',
  styleUrls: ['./manage-channels.component.css'],
  imports: [FormsModule, CommonModule]
})
export class ManageChannelsComponent implements OnInit {
  channels: Channel[] = [];
  groups: Group[] = [];
  newChannel: Channel = { id: '', name: '', description: '', groupId: '' };
  showModal: boolean = false;
  successMessage: string = '';
  isSuperAdmin: boolean = false; // Super Admin check
  user: User | null = null; // Current user information
  router: any;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadUser(); // Load user information first
  }

  // Load current user data from session storage
  loadUser(): void {
    const loggedInUserEmail = sessionStorage.getItem('loggedInUserEmail');

    if (loggedInUserEmail) {
      this.http.get<User[]>(`http://localhost:3000/users`).subscribe({
        next: (users: User[]) => {
          this.user = users.find(u => u.email === loggedInUserEmail) || null;

          if (this.user) {
            this.isSuperAdmin = this.user.roles.includes('Super Admin'); // Check if the user is Super Admin
            console.log('Current user:', this.user);
            this.loadGroups(); // Load groups and channels
          } else {
            console.log('User not found.');
            this.router.navigate(['/login']);
          }
        },
        error: (error) => {
          console.error('Error fetching user data:', error);
        }
      });
    } else {
      console.log('No login information found.');
      this.router.navigate(['/login']);
    }
  }

  loadGroups(): void {
    this.http.get<Group[]>(`http://localhost:3000/groups`).subscribe({
      next: (groups: Group[]) => {
        if (this.isSuperAdmin) {
          this.groups = groups; // Super Admin은 모든 그룹을 볼 수 있음
        } else {
          // Group Admin은 자신이 생성한 그룹만 볼 수 있음
          this.groups = groups.filter(group => group.createdBy === this.user?.id);
          console.log('Filtered groups for Group Admin:', this.groups);
        }
        this.loadChannels(); // 그룹 정보를 불러온 후에 채널 정보도 로드
      },
      error: (error) => {
        console.error('Error loading group data:', error);
      }
    });
  }
  
 // Get group name by channelId
getGroupNameByChannel(channelId: string): string {
  // Ensure that groups array is defined and not empty
  if (!this.groups || this.groups.length === 0) {
    return 'Unknown Group'; // Return 'Unknown Group' if groups are not loaded
  }

  // Find the group that contains the given channelId, and ensure channels are defined
  const group = this.groups.find(g => g.channels && g.channels.some(channel => channel.id === channelId));

  // Return group name if found, otherwise return 'Unknown Group'
  return group ? group.name : 'Unknown Group';
}


 // Load channels based on the groups the user has access to
loadChannels(): void {
  this.http.get<Group[]>(`http://localhost:3000/groups`).subscribe({
    next: (groups: Group[]) => {
      if (this.isSuperAdmin) {
        // Super Admin일 경우 모든 그룹의 채널을 볼 수 있음
        this.channels = groups.flatMap(group => group.channels || []);
      } else {
        // Group Admin일 경우 자신이 생성한 그룹의 채널만 볼 수 있음
        const accessibleGroups = groups.filter(group => group.createdBy === this.user?.id);
        this.channels = accessibleGroups.flatMap(group => group.channels || []);
      }
      console.log('Filtered channels for Group Admin:', this.channels);
      localStorage.setItem('channels', JSON.stringify(this.channels));
    },
    error: (error) => {
      console.error('Error loading channels:', error);
    }
  });
}




  // Handle form submission for creating a new channel in a group
  onSubmit(): void {
    const groupId = this.newChannel.groupId;

    // Check if groupId is not undefined
    if (!groupId) {
      console.error('Group ID is missing.');
      alert('Group ID is missing. Please select a group.');
      return;
    }

      // Check if the channel name is empty
  if (!this.newChannel.name || this.newChannel.name.trim() === '') {
    alert('Please enter a channel name.');
    return; // Stop the form submission if the channel name is missing
  }

    // Check if the user is allowed to create a channel in the selected group
    if (!this.isSuperAdmin && !this.groups.some(group => group.id === groupId && group.createdBy === this.user?.id)) {
      alert('You do not have permission to create a channel in this group.');
      return;
    }

    // Generate a unique ID for the new channel
    this.newChannel.id = this.generateUniqueId();

    const channelToAdd = { ...this.newChannel };
    delete channelToAdd.groupId;

    // Add the new channel to the server
    this.http.post<Channel>(`http://localhost:3000/groups/${groupId}/channels`, channelToAdd).subscribe({
      next: (channel) => {
        const group = this.groups.find(g => g.id === groupId);
        if (group) {
          group.channels.push(channel); // Update the local group data
        }
        this.newChannel = { id: '', name: '', description: '', groupId: '' }; // Reset the form
        this.showModal = false;
        this.successMessage = 'New channel added successfully.';
        this.clearMessageAfterTimeout();
      },
      error: (error) => {
        console.error('Error adding channel:', error);
      }
    });
  }

  // Delete a channel
deleteChannel(channelId: string): void {
  // Find the channel to delete
  const channel = this.channels.find(c => c.id === channelId);
  
  if (!channel) {
    console.error('Channel not found.');
    return;
  }

  // Find the group that contains this channel
  const group = this.groups.find(g => g.channels?.some(c => c.id === channelId));

  if (!group) {
    console.error('Group not found for this channel.');
    return;
  }

  // Check if the user is allowed to delete the channel in the selected group
  if (!this.isSuperAdmin && group.createdBy !== this.user?.id) {
    alert('You do not have permission to delete a channel in this group.');
    return;
  }

  // Proceed to delete the channel
  this.http.delete(`http://localhost:3000/channels/${channelId}`).subscribe({
    next: () => {
      console.log(`Channel with ID ${channelId} deleted successfully`);
      this.channels = this.channels.filter(channel => channel.id !== channelId);
      this.successMessage = `Channel with ID ${channelId} deleted successfully.`;
      this.clearMessageAfterTimeout();
    },
    error: (error) => {
      console.error('Error deleting channel:', error);
    }
  });
}


  // Generate a unique ID for new channels
  generateUniqueId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  // Clear success messages after a timeout (5 seconds)
  clearMessageAfterTimeout(): void {
    setTimeout(() => {
      this.successMessage = '';
    }, 5000);
  }
}
