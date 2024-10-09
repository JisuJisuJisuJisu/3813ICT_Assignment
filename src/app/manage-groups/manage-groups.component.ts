import { Component, OnInit } from '@angular/core';
import { Group } from '../models/group.model';
import { User } from '../models/user.model'; // Model for the current user information
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-manage-groups',
  standalone: true,
  templateUrl: './manage-groups.component.html',
  styleUrls: ['./manage-groups.component.css'],
  imports: [FormsModule, CommonModule]
})
export class ManageGroupsComponent implements OnInit {

  groups: Group[] = []; // List of all groups
  newGroup: Group = { id: '', name: '', description: '', createdBy: '', channels: [], imageUrl: '' }; // Object for creating a new group
  user: User | null = null; // Current logged-in user information
  isSuperAdmin: boolean = false; // Check if the current user is a Super Admin
  showModal: boolean = false; // Control modal visibility
  successMessage: string = ''; // Success message for feedback
  router: any;
  

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadUser(); // Load the current user data on component initialization
  }

  // Load current user data from the session storage
  loadUser(): void {
    const loggedInUserEmail = sessionStorage.getItem('loggedInUserEmail');

    if (loggedInUserEmail) {
      this.http.get<User[]>(`http://localhost:3000/users`).subscribe({
        next: (users: User[]) => {
          this.user = users.find(u => u.email === loggedInUserEmail) || null;

          if (this.user) {
            this.isSuperAdmin = this.user.roles.includes('Super Admin'); // Determine if the user is a Super Admin
            console.log('Current user:', this.user);
            this.loadGroups(); // Load group data after the user is loaded
          } else {
            console.log('User not found.');
            // Redirect to the login page if no user is found
            this.router.navigate(['/login']);
          }
        },
        error: (error) => {
          console.error('Error fetching user data:', error);
        }
      });
    } else {
      console.log('No login information found.');
      // Redirect to the login page if no login information is found
      this.router.navigate(['/login']);
    }
  }

  // Load all groups or the groups created by the user
  loadGroups(): void {
    console.log("Loading groups...");
    this.http.get<Group[]>(`http://localhost:3000/groups`).subscribe({
      next: (groups: Group[]) => {
        if (this.isSuperAdmin) {
          this.groups = groups; // Super Admin can view all groups
        } else {
          this.groups = groups.filter(group => group.createdBy === this.user?.id); // Group Admin can only view groups they created
        }
        console.log("Loaded Groups:", this.groups);
        // Store the groups in local storage
        localStorage.setItem('groups', JSON.stringify(this.groups));
      },
      error: (error) => {
        console.error('Error loading group data:', error);
      }
    });
  }

  // Delete a group (only allowed for Super Admin or Group Admin who created the group)
  deleteGroup(groupId: string): void {
    // Super Admin or Group Admin who created the group can delete it
    if (this.isSuperAdmin || this.groups.some(group => group.id === groupId && group.createdBy === this.user?.id)) {
      this.http.delete(`http://localhost:3000/groups/${groupId}`).subscribe({
        next: () => {
          console.log(`Group with ID ${groupId} deleted successfully`);

          // Remove the group from the group list
          this.groups = this.groups.filter(group => group.id !== groupId);

          // Remove the group from local storage
          let storedGroups = JSON.parse(localStorage.getItem('groups') || '[]');
          storedGroups = storedGroups.filter((group: Group) => group.id !== groupId);
          localStorage.setItem('groups', JSON.stringify(storedGroups));

          // Remove the group from the current user's group list
          if (this.user) {
            this.user.groups = this.user.groups.filter(group => group.id !== groupId);
            this.updateUserInStorage(this.user); // Update the user information in storage
          }

          // Display success message
          this.successMessage = `Group with ID ${groupId} deleted successfully.`;
          this.clearMessageAfterTimeout();
        },
        error: (error) => {
          console.error('Error deleting group:', error);
        }
      });
    } else {
      alert('You do not have permission to delete this group.');
    }
  }

  // Update the user information in local storage and on the server
  updateUserInStorage(user: User): void {
    // Update the users array in local storage
    let storedUsers = JSON.parse(localStorage.getItem('users') || '[]');
    storedUsers = storedUsers.map((u: User) => u.id === user.id ? user : u);
    localStorage.setItem('users', JSON.stringify(storedUsers));

    // Update the current user in local storage
    localStorage.setItem('currentUser', JSON.stringify(user));

    // Send a PUT request to update user data on the server (excluding _id to avoid modification)
    const { _id, ...updatedUserData } = user;  // Exclude _id from the data sent to the server
    this.http.put(`http://localhost:3000/users/${user.id}`, updatedUserData).subscribe({
      next: () => {
        console.log('User data updated successfully.');
      },
      error: (error) => {
        console.error('Error updating user data:', error);
      }
    });
  }

  // Add a new channel to the group
  addChannel(): void {
    this.newGroup.channels.push({
      id: this.generateUniqueId(), // Generate a unique ID for the new channel
      name: '',
      description: '',
      groupId: ''
    });
  }

  // Handle form submission for creating a new group
  onSubmit(): void {
    this.newGroup.id = this.generateUniqueId();
    this.newGroup.createdBy = this.user?.id || '';

    // Send a POST request to the server to create a new group
    this.http.post<Group>(`http://localhost:3000/groups`, this.newGroup).subscribe({
      next: (group) => {
        console.log('New group created successfully:', group);

        // Add the new group to the group list
        this.groups.push(group);

        // Store the new group in local storage
        const storedGroups = JSON.parse(localStorage.getItem('groups') || '[]');
        storedGroups.push(group);
        localStorage.setItem('groups', JSON.stringify(storedGroups));

        // Add the new group to the current user's group list
        if (this.user) {
          this.user.groups.push(group);  // Use the group data from the server
          this.updateUserInStorage(this.user); // Update the user information in storage
        }

        // Reset the form and close the modal
        this.newGroup = { id: '', name: '', description: '', createdBy: '', channels: [], imageUrl: '' };
        this.showModal = false;

        // Display success message
        this.successMessage = 'New group created successfully.';
        this.clearMessageAfterTimeout();
      },
      error: (error) => {
        console.error('Error creating group:', error);
      }
    });
  }

  // Generate a unique ID for new channels and groups
  generateUniqueId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  // Handle file selection for group image upload
  onFileSelected(event: any): void {
    const file: File = event.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append('image', file);  // Append the selected file to FormData
  
      // Send the image to the server
      this.http.post<{ imageUrl: string }>(`http://localhost:3000/upload-group-image`, formData)
        .subscribe({
          next: (response) => {
            console.log('File uploaded successfully:', response.imageUrl);
            // Store the image URL in the new group's imageUrl field
            this.newGroup.imageUrl = response.imageUrl;
          },
          error: (error) => {
            console.error('Error uploading file:', error);
          }
        });
    }
  }
  

  // Clear success messages after a timeout (5 seconds)
  clearMessageAfterTimeout(): void {
    setTimeout(() => {
      this.successMessage = '';
    }, 5000); // Clear the message after 5 seconds
  }
}
