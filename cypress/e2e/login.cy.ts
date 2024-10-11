describe('Login Component', () => {
    beforeEach(() => {
      // Mock the server response for the login request
      cy.intercept('POST', 'http://localhost:3000/login', {
        statusCode: 200,
        body: {
          user: {
            _id: '12345',
            id: 'user1',
            username: 'JohnDoe',
            email: 'user@example.com',
            roles: ['user'],
            groups: ['group1', 'group2']
          }
        }
      }).as('loginRequest');
  
      // Navigate to the login page
      cy.visit('/login');
    });
  
    it('should log in successfully with valid credentials', () => {
      // 1. Enter valid email and password
      cy.get('input[formControlName="email"]').type('user@example.com');
      cy.get('input[formControlName="password"]').type('password123');
  
      // 2. Click the login button
      cy.get('button[type="submit"]').click();
  
      // 3. Wait for the server response and check session storage
      cy.wait('@loginRequest').then(() => {
        const user = JSON.parse(sessionStorage.getItem('loggedinUser') || '{}');
        expect(user.email).to.equal('user@example.com');
      });
  
      // 4. Verify redirection to the dashboard
      cy.url().should('include', '/dashboard');
    });
  });
