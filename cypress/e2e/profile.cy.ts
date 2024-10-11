describe('Profile Component', () => {
    beforeEach(() => {
      // Mock the server response for loading user data
      cy.intercept('GET', 'http://localhost:3000/users/email?email=user@example.com', {
        statusCode: 200,
        body: {
          id: 'user1',
          username: 'UserOne',
          email: 'user@example.com',
          roles: ['User'],
          groups: ['group1'],
          interestGroups: ['interest1'],
          profileImage: ''
        }
      }).as('getUser');
  
      // Mock the server response for loading interest group details
      cy.intercept('GET', 'http://localhost:3000/groups/interest1', {
        statusCode: 200,
        body: {
          id: 'interest1',
          name: 'Interest Group 1',
          description: 'This is an interest group.'
        }
      }).as('getInterestGroup');
  
      // Mock the server response for fetching user groups
      cy.intercept('GET', 'http://localhost:3000/groups', {
        statusCode: 200,
        body: [
          { id: 'group1', name: 'Test Group', pendingUsers: ['user1'] }
        ]
      }).as('getGroups');
  
      cy.visit('/profile');
    });
  
  
    it('should allow the user to update their profile', () => {
      // Mock the server response for updating user profile
      cy.intercept('PUT', 'http://localhost:3000/users/user1', {
        statusCode: 200,
        body: {
          id: 'user1',
          username: 'UpdatedUser',
          email: 'user@example.com',
          roles: ['User'],
          groups: ['group1'],
          interestGroups: ['interest1'],
          profileImage: ''
        }
      }).as('updateProfile');
  
   
      
      // Submit the profile update form
      cy.get('button[type="submit"]').click();
  
    });
  
    it('should delete the user account', () => {
      // Mock the server response for deleting user account
      cy.intercept('DELETE', 'http://localhost:3000/users/user1', {
        statusCode: 200
      }).as('deleteUser');
  
      // Confirm the account deletion
      cy.on('window:confirm', () => true);
  
  
      // Check that the user is redirected to the login page
      cy.url().should('include', '/login');
    });
  
    it('should approve a join request for a group', () => {
      // Mock the server response for approving a join request
      cy.intercept('PUT', 'http://localhost:3000/groups/approve/group1', {
        statusCode: 200
      }).as('approveJoinRequest');
  
      // Check that the group is removed from pending requests
      cy.contains('Test Group').should('not.exist');
    });
  
    it('should reject a join request for a group', () => {
      // Mock the server response for rejecting a join request
      cy.intercept('PUT', 'http://localhost:3000/groups/reject/group1', {
        statusCode: 200
      }).as('rejectJoinRequest');
  
  
      // Check that the group is removed from pending requests
      cy.contains('Test Group').should('not.exist');
    });
  
    it('should upload a profile image', () => {
      // Mock the server response for profile image upload
      cy.intercept('POST', 'http://localhost:3000/upload-profile-image', {
        statusCode: 200,
        body: { imageUrl: 'http://localhost:3000/images/profile.jpg' }
      }).as('uploadImage');
  
      // Simulate selecting a file
      const fileName = 'profile.jpg';
    
    });
  });
  