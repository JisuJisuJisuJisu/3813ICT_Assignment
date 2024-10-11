describe('Signup Component', () => {
    beforeEach(() => {
      // Mock the server response for the signup request
      cy.intercept('POST', 'http://localhost:3000/signup', {
        statusCode: 200,
        body: {
          id: '12345',
          username: 'newuser',
          email: 'newuser@example.com',
          roles: ['User'],
          groups: []
        }
      }).as('signupRequest');
  
      // Navigate to the signup page
      cy.visit('/signup');
    });
  
    it('should sign up successfully with valid credentials', () => {
      // 1. Enter valid email and password
      cy.get('input[formControlName="email"]').type('newuser@example.com');
      cy.get('input[formControlName="password"]').type('password123');
  
      // 2. Click the signup button
      cy.get('button[type="submit"]').click();
  
      // 3. Wait for the server response and check localStorage
      cy.wait('@signupRequest').then(() => {
        const storedUsers = JSON.parse(localStorage.getItem('users') || '[]');
        expect(storedUsers.length).to.be.greaterThan(0);
       
      });
  
      // 4. Verify redirection to the login page
      cy.url().should('include', '/login');
    });
  
    it('should show validation errors for empty fields', () => {
      // 1. Leave email and password fields empty
      cy.get('button[type="submit"]').click();
  
      // 2. Assert that form control has validation error
      cy.get('input[formControlName="email"]:invalid').should('exist');
      cy.get('input[formControlName="password"]:invalid').should('exist');
  
      // 3. Verify alert message is shown
      cy.on('window:alert', (str) => {
        expect(str).to.equal('Please fill in all required fields.');
      });
    });
  
    it('should show an error for duplicate email', () => {
      // Mock the server response for duplicate email
      cy.intercept('POST', 'http://localhost:3000/signup', {
        statusCode: 400,
        body: { message: 'Email already exists' }
      }).as('signupRequest');
  
      // 1. Enter email that already exists
      cy.get('input[formControlName="email"]').type('existinguser@example.com');
      cy.get('input[formControlName="password"]').type('password123');
  
      // 2. Click the signup button
      cy.get('button[type="submit"]').click();
  
      // 3. Wait for the server response and check for error
      cy.wait('@signupRequest');
      cy.on('window:alert', (str) => {
        expect(str).to.equal('There was an error during signup!');
      });
    });
  });
  