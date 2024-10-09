import { Component, OnInit } from '@angular/core';
import { Channel } from '../models/channel.model'; // Channel model을 사용
import { Group } from '../models/group.model'; // Group model을 사용
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

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
  newChannel: Channel = { id: '', name: '', description: '', groupId: '' }; // groupId는 더 이상 사용하지 않음
  showModal: boolean = false;
  successMessage: string = '';
  router: any;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadChannels();
    this.loadGroups();
  }

  // Load all channels
  loadChannels(): void {
    this.http.get<Channel[]>(`http://localhost:3000/channels`).subscribe({
      next: (channels: Channel[]) => {
        this.channels = channels;
        localStorage.setItem('channels', JSON.stringify(this.channels));
      },
      error: (error) => {
        console.error('Error loading channel data:', error);
      }
    });
  }

  // Load all groups
  loadGroups(): void {
    this.http.get<Group[]>(`http://localhost:3000/groups`).subscribe({
      next: (groups: Group[]) => {
        this.groups = groups;
        localStorage.setItem('groups', JSON.stringify(this.groups));
      },
      error: (error) => {
        console.error('Error loading group data:', error);
      }
    });
  }

  getGroupNameByChannel(channelId: string): string {
    // Check if groups array is not defined or empty
    if (!this.groups || this.groups.length === 0) {
      return 'Unknown Group'; // Return 'Unknown Group' if groups have not loaded
    }
  
    // Check if channels array exists before calling 'some'
    const group = this.groups.find(g => g.channels && g.channels.some(channel => channel.id === channelId));
  
    // Return group name if found, otherwise return 'Unknown Group'
    return group ? group.name : 'Unknown Group';
  }
  
  // Handle form submission for creating a new channel in a group
  onSubmit(): void {
    const groupId = this.newChannel.groupId as string; // Group ID를 사용하는 방식은 유지

    // Generate a unique ID for the new channel
    this.newChannel.id = this.generateUniqueId(); // Ensure ID is generated on the client side

    // Remove groupId from newChannel before sending the request
    const channelToAdd = { ...this.newChannel };
    delete channelToAdd.groupId;

    // Make the API call to add the channel to the group
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
    // Make sure the channelId is valid before making the API call
    if (!channelId) {
      console.error('Channel ID is missing.');
      return;
    }

    this.http.delete(`http://localhost:3000/channels/${channelId}`).subscribe({
      next: () => {
        console.log(`Channel with ID ${channelId} deleted successfully`);

        // Update the local channels list by removing the deleted channel
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
