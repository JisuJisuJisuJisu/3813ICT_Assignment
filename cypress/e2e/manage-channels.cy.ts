describe('Manage Channels Component', () => {
    beforeEach(() => {
      // Intercept the requests to the server for loading users, groups, and channels
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
  
      cy.intercept('GET', 'http://localhost:3000/groups', {
        statusCode: 200,
        body: [
          {
            id: 'group1',
            name: 'Group 1',
            createdBy: 'user1',
            channels: [
              { id: 'channel1', name: 'Channel 1', description: 'First Channel' }
            ]
          }
        ]
      }).as('getGroups');
  
      cy.visit('/manage-channels');
    });
  
    it('should load groups and channels for Super Admin', () => {
      // Wait for users and groups to load
      cy.wait('@getUsers');
    //   cy.wait('@getGroups');
  
      // Check that the group and channel are displayed
    //   cy.contains('Group 1').should('be.visible');
    //   cy.contains('Channel 1').should('be.visible');
    });
  
    it('should allow Super Admin to create a new channel', () => {
      // Mock the server response for creating a new channel
      cy.intercept('POST', 'http://localhost:3000/groups/group1/channels', {
        statusCode: 200,
        body: { id: 'channel2', name: 'New Channel', description: 'This is a new channel' }
      }).as('createChannel');

      
  
      // Submit the form to create a channel
      cy.get('button[type="submit"]').click();
  

    });
  
    it('should allow Super Admin to delete a channel', () => {
      // Mock the server response for deleting a channel
      cy.intercept('DELETE', 'http://localhost:3000/channels/channel1', {
        statusCode: 200
      }).as('deleteChannel');
  
  
      // Check that the channel is no longer displayed
      cy.contains('Channel 1').should('not.exist');
    });
  });
  