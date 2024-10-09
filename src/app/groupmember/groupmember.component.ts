import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

interface User {
  interestGroups: any;
  id: string;
  email: string;
  username: string;
  roles: string[];
}

interface Group {
  id: string;
  name: string;
  pendingUsers: string[];
  members: string[]; // members now stores user IDs instead of User objects
}

@Component({
  selector: 'app-group-member',
  templateUrl: './groupmember.component.html',
  imports: [CommonModule, FormsModule],
  standalone: true,
  styleUrls: ['./groupmember.component.css']
})
export class GroupMemberComponent implements OnInit {
  groupId: string | null = null;  // Stores groupId from URL
  selectedGroup: Group | null = null;
  allUsers: User[] = [];  // All users fetched from the server
  interestedUsers: User[] = [];  // Users who sent join requests
  isLoading: boolean = true;  // Loading state
  showAllUsers: boolean = false;  // Controls whether all users are shown
  showInterestUsers: boolean = false;  // Controls whether interested users are shown
  errorMessage: string | null = null;  // Error message in case of failure
  memberDetails: User[] = []; // Stores detailed information about group members

  constructor(private http: HttpClient, private route: ActivatedRoute) {}

  ngOnInit(): void {
    // Retrieve the groupId from the URL
    this.route.parent?.paramMap.subscribe(params => {
      this.groupId = params.get('id'); // Get 'id' parameter from the parent route
      console.log('Group ID from URL:', this.groupId);

      if (this.groupId) {
        this.fetchGroupDetails(this.groupId);  // Fetch group details if groupId is present
      } else {
        console.error('No group ID found.');
        this.isLoading = false;  // Stop loading if no groupId is found
      }
    });
  }

  // Delete a member from the group
  deleteMember(memberId: string): void {
    const loggedInUser = JSON.parse(sessionStorage.getItem('loggedinUser') || '{}'); // Get the logged in user info from sessionStorage
  
    if (!loggedInUser || !loggedInUser.roles.includes('Group Admin') && !loggedInUser.roles.includes('Super Admin')) {
      alert('You do not have permission to delete members.');
      return;
    }
  
    if (confirm('Are you sure you want to delete this member?')) {
      this.http.delete(`http://localhost:3000/groups/${this.selectedGroup?.id}/members/${memberId}`, { // Backend server URL
        body: { loggedInUser } // Pass loggedInUser in the request body
      }).subscribe({
        next: () => {
          alert('Member deleted successfully.');
          this.fetchGroupDetails(this.selectedGroup!.id);  // Refresh group details after deleting the member
        },
        error: (error) => {
          console.error('Error deleting member:', error);
          alert('Failed to delete the member.');
        }
      });
    }
  }
  
  
  // Fetch group details from the server
  fetchGroupDetails(groupId: string): void {
    this.http.get<Group>(`http://localhost:3000/groups/${groupId}`)
      .subscribe({
        next: (group) => {
          console.log('Fetched Group:', group);
          this.selectedGroup = group;  // Set the selected group
          this.fetchAllUsers(); // Fetch all users to map group members
        },
        error: (error) => {
          console.error('Error fetching group:', error);
          this.errorMessage = 'Failed to load group details.';
          this.isLoading = false;
        }
      });
  }

  // Fetch all users from the server
  fetchAllUsers(): void {
    this.http.get<User[]>('http://localhost:3000/users')
      .subscribe({
        next: (users) => {
          console.log('Fetched Users:', users);
          this.allUsers = users;  // Store fetched users
          this.mapMemberDetails();  // Map group members to detailed user information
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error fetching users:', error);
          this.errorMessage = 'Failed to load user list.';
          this.isLoading = false;
        }
      });
  }

  // Map group member IDs to detailed user information
  mapMemberDetails(): void {
    if (this.selectedGroup && this.selectedGroup.members) {
      // Find users based on member IDs and filter out undefined results
      this.memberDetails = this.selectedGroup.members
        .map(memberId => this.allUsers.find(user => user.id === memberId))
        .filter((user): user is User => user !== undefined);

      // Ensure that roles is always defined, even if it's empty
      this.memberDetails.forEach(member => {
        member.roles = member.roles || [];  // If roles is undefined, set it to an empty array
      });
    } else {
      this.memberDetails = []; // Assign an empty array if no members are found
    }
    console.log('Mapped Member Details:', this.memberDetails);
  }

  // Show all users when the Invite button is clicked
  inviteUser(): void {
    this.showAllUsers = true;  // Show the list of all users
  }

  // Invite a specific user to the group
  inviteUserToGroup(groupId: string | undefined, userId: string): void {
    console.log('groupId:', groupId);
    console.log('userId:', userId);

    if (!this.selectedGroup || !this.selectedGroup.id) {
      alert('No group selected.');
      return;
    }

    this.http.post(`http://localhost:3000/group/${this.selectedGroup.id}/invite`, { groupId: this.selectedGroup.id, userId })
      .subscribe({
        next: () => {
          alert('Invitation sent successfully.');
          this.fetchGroupDetails(this.selectedGroup!.id);  // Refresh group details after inviting the user
        },
        error: (error) => {
          console.error('Error inviting user:', error);
          alert('Failed to send the invitation.');
        }
      });
  }

  // Show the list of users who requested to join the group when the Request button is clicked
  requestUser() {
    if (!this.selectedGroup || !this.selectedGroup.id) {
      alert('No group selected.');
      return;
    }

    this.showInterestUsers = true;  // Show the list of interested users

    // Filter users who are interested in joining the group
    this.interestedUsers = this.allUsers.filter(user => 
      user.interestGroups && user.interestGroups.includes(this.selectedGroup!.id)
    );

    // Log or display the filtered list of users
    console.log('Users interested in this group:', this.interestedUsers);
  }

  // Approve a user's request to join the group
  allowUserToJoin(groupId: string | undefined, userId: string): void {
    if (!this.selectedGroup || !this.selectedGroup.id) {
      alert('No group selected.');
      return;
    }

    // Send a request to the server to add the user to the group and remove them from pendingUsers
    this.http.put(`http://localhost:3000/groups/approve/${groupId}`, { userId })
      .subscribe({
        next: () => {
          alert('User has been approved.');
          this.fetchGroupDetails(this.selectedGroup!.id);  // Refresh group details after approval
        },
        error: (error) => {
          console.error('Error approving user:', error);
          alert('Failed to approve the user.');
        }
      });
  }

  // Reject a user's request to join the group
  rejectUserFromGroup(groupId: string | undefined, userId: string): void {
    if (!this.selectedGroup || !this.selectedGroup.id) {
      alert('No group selected.');
      return;
    }

    // Send a request to the server to remove the user from pendingUsers
    this.http.put(`http://localhost:3000/groups/reject/${groupId}`, { userId })
      .subscribe({
        next: () => {
          alert('User has been rejected.');
          this.fetchGroupDetails(this.selectedGroup!.id);  // Refresh group details after rejection
        },
        error: (error) => {
          console.error('Error rejecting user:', error);
          alert('Failed to reject the user.');
        }
      });
  }
}
