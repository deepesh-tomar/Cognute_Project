document.addEventListener('DOMContentLoaded', () => {
  // Check if user is already logged in
  const token = localStorage.getItem('token');
  if (token) {
    window.location.href = 'dashboard.html';
    return;
  }

  // Add animation classes
  document.querySelector('.logo-container').classList.add('animate');
  document.querySelector('.welcome-message').classList.add('animate');
  document.querySelector('.subtitle').classList.add('animate');
  
  // Get form elements
  const loginForm = document.getElementById('loginForm');
  const errorMessage = document.getElementById('errorMessage');
  
  // Form elements animation
  const formGroups = document.querySelectorAll('.form-group');
  formGroups.forEach((group, index) => {
    group.classList.add('animate');
    group.style.animationDelay = `${index * 0.1 + 0.3}s`;
  });
  
  // Login button animation
  const loginButton = document.querySelector('.login-button');
  loginButton.classList.add('animate');
  loginButton.style.animationDelay = '0.6s';

  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Clear previous error
    errorMessage.textContent = '';
    
    // Get form values
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    try {
      // Submit login request
      const response = await fetch('/api/users/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });
      
      // Check if response is JSON before parsing
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Server error: Unexpected response format');
      }
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }
      
      // Save user data in local storage
      localStorage.setItem('token', data.token);
      localStorage.setItem('userName', data.name);
      localStorage.setItem('userEmail', data.email);
      
      // Redirect to dashboard
      window.location.href = 'dashboard.html';
      
    } catch (error) {
      console.error('Login error:', error);
      errorMessage.textContent = error.message || 'Login failed. Please try again.';
      errorMessage.classList.add('animate-shake');
      
      // Remove animation class after animation completes
      setTimeout(() => {
        errorMessage.classList.remove('animate-shake');
      }, 500);
    }
  });
}); 