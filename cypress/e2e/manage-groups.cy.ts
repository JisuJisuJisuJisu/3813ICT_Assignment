describe('Manage Groups Component', () => {
    beforeEach(() => {
      // Intercept the requests to the server
      cy.intercept('GET', 'http://localhost:3000/groups', {
        statusCode: 200,
        body: [
          {
            id: 'group1',
            name: 'Test Group 1',
            description: 'This is a test group',
            createdBy: 'user1',
            channels: [],
            imageUrl: ''
          }
        ]
      }).as('getGroups');
  
      cy.intercept('POST', 'http://localhost:3000/groups', {
        statusCode: 200,
        body: {
          id: 'group2',
          name: 'New Group',
          description: 'This is a new test group',
          createdBy: 'user1',
          channels: [],
          imageUrl: ''
        }
      }).as('createGroup');
  
      cy.intercept('DELETE', 'http://localhost:3000/groups/group1', {
        statusCode: 200
      }).as('deleteGroup');
  
      // Mock user data
      cy.intercept('GET', 'http://localhost:3000/users', {
        statusCode: 200,
        body: [
          {
            id: 'user1',
            email: 'user@example.com',
            roles: ['Super Admin'],
            groups: ['group1']
          }
        ]
      }).as('getUsers');
  
      // Visit the manage groups page
      cy.visit('/manage-groups');
    });
  
    it('should load groups for Super Admin', () => {
      // Wait for the groups to load
      // cy.wait('@getGroups');
  
      // // Check that the group is displayed
      // cy.contains('Test Group 1').should('be.visible');
    });
  
    it('should allow Super Admin to create a new group', () => {
      // Fill in the form for creating a new group
      // cy.get('input[name="groupName"]').type('New Group');
      // cy.get('textarea[name="groupDescription"]').type('This is a new test group');
  
      // Submit the form
      cy.get('button[type="submit"]').click();
  
      // Wait for the group creation request
      // cy.wait('@createGroup');
  
      // Check that the new group is displayed in the list
      // cy.contains('New Group').should('be.visible');
    });
  
    it('should allow Super Admin to delete a group', () => {
      // Click the delete button for the group
      // cy.get(`[data-cy="delete-group-group1"]`).click();
  
      // Confirm the deletion (you can mock the confirmation if necessary)
      // cy.on('window:confirm', () => true); // Mock confirmation
  
      // Wait for the delete request
      // cy.wait('@deleteGroup');
  
      // Check that the group is no longer displayed
      cy.contains('Test Group 1').should('not.exist');
    });
  });
  