import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { User } from '../models/user.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class ProfileComponent implements OnInit {
  user: User = {
    username: '',
    email: '',
    roles: [],
    id: '',
    password: '',
    groups: [],
    interestGroups: [],
    profileImage: ''
  };
  
  userGroups: any[] = []; // Variable to store user's groups
  loggedInUserEmail: string | null = null;
  selectedFile: File | null = null;

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit(): void {
    // Retrieve email from sessionStorage
    this.loggedInUserEmail = sessionStorage.getItem('loggedInUserEmail');
  
    console.log(this.loggedInUserEmail);

    // If no login information is found
    if (!this.loggedInUserEmail) {
      console.log('No login information found.');
      this.router.navigate(['/login']);  // Redirect to login page
      return; // Stop further execution
    }

    // If email exists, fetch user information from the server
    this.http.get<User>(`http://localhost:3000/users/email?email=${this.loggedInUserEmail}`).subscribe({
      next: (user: User) => {  // If a user object is returned from the server
        this.user = user;
        if (!this.user) {
          console.log('User information not found.');
          this.router.navigate(['/login']);
        } else {
          this.fetchUserGroups(this.user.id); // Fetch user groups
          this.fetchInterestGroups();
        }
      },
      error: (error) => {
        console.error('Error fetching user information:', error);
      }
    });
  }

  // Fetch user's interest groups
fetchInterestGroups(): void {
  this.http.get<any[]>(`http://localhost:3000/users/${this.user.email}/interest-groups`).subscribe({
    next: (groups: any[]) => {
      this.user.interestGroups = groups; // Save interest groups
      console.log('Interest Groups:', this.user.interestGroups);
    },
    error: (error) => {
      console.error('Error fetching interest groups:', error);
    }
  });
}
  // Handle file selection for profile image
  onFileSelected(event: any): void {
    this.selectedFile = event.target.files[0];
    this.uploadProfileImage();
  }

  // Upload selected profile image to the server
  uploadProfileImage(): void {
    if (!this.selectedFile) {
      alert('Please select a file');
      return;
    }

    const formData = new FormData();
    formData.append('profileImage', this.selectedFile);
    formData.append('userId', this.user.id);

    this.http.post('http://localhost:3000/upload-profile-image', formData)
      .subscribe({
        next: (response: any) => {
          console.log('Image upload successful:', response);
          this.user.profileImage = response.imageUrl; // Save image URL from server
        },
        error: (error) => {
          console.error('Image upload failed:', error);
        }
      });
  }
  
  // Fetch the groups the user belongs to
  fetchUserGroups(userId: string): void {
    this.http.get<any[]>(`http://localhost:3000/groups`).subscribe({
      next: (groups) => {
        // Filter groups where userId is in pendingUsers
        this.userGroups = groups.filter(group => group.pendingUsers.includes(userId));
        console.log('Groups with pending join requests:', this.userGroups);
      },
      error: (error) => {
        console.error('Error fetching group information:', error);
      }
    });
  }

  // Approve a join request
  approveJoinRequest(groupId: string, userId: string): void {
    console.log('Approving join request for groupId:', groupId, 'userId:', userId);
    this.http.put(`http://localhost:3000/groups/approve/${groupId}`, { userId }).subscribe({
      next: () => {
        console.log('Join request approved.');
        this.fetchUserGroups(userId); // Refresh group list
      },
      error: (error) => {
        console.error('Error approving join request:', error);
      }
    });
  }

  // Reject a join request
  rejectJoinRequest(groupId: string, userId: string): void {
    this.http.put(`http://localhost:3000/groups/reject/${groupId}`, { userId }).subscribe({
      next: () => {
        console.log('Join request rejected.');
        this.fetchUserGroups(userId); // Refresh group list
      },
      error: (error) => {
        console.error('Error rejecting join request:', error);
      }
    });
  }

  // Update the user profile
  updateProfile(): void {
    if (this.user) {
      this.http.put(`http://localhost:3000/users/${this.user.id}`, this.user).subscribe({
        next: () => {
          console.log('Profile update successful');
        },
        error: (error) => {
          console.error('Error updating profile:', error);
        }
      });
    }
  }
}
