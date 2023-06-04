export{}

describe('WelcomePage', () => {
  it('Contains Log In button', () => {
    cy.visit('http://localhost:3000/');
    cy.get('button').contains('Log in').should('be.visible');
    cy.wait(2000)
  });

  it('Clicks the Log In button', () => {
    cy.visit('http://localhost:3000/');
    cy.get('button').contains('Log in').click();
    cy.url().should('include', '/login');
    cy.wait(2000)
  });
});


describe('Profile Page', () => {
  beforeEach(() => {
    // Simulate the login process before visiting the profile page
    cy.visit('http://localhost:3000/login');
    cy.get('input[name="email"]').type('john.cobain@gmail.com');
    cy.get('input[name="password"]').type('123456');
    cy.get('button[type="submit"]').click();
    cy.wait(2000); // Wait for the login process to complete
  });

  it('should display the user profile', () => {

    // Add assertions to verify that the profile page is displayed correctly
    cy.contains('Your Profile');
    cy.contains('Name');
    cy.contains('About me');
    cy.contains('Interests');
    cy.contains('Books on the shelf');  
    cy.contains('Upload Book');
    
    cy.get('input').should('have.value', 'John Cobain');
    cy.get('textarea').should('have.value', 'I am a Copenhagen based photographer, interested in the latest advancements in technology, as well as personal development ideas and philosophy.');
  });
});

