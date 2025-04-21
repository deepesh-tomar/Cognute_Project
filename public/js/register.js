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
  const registerForm = document.getElementById('registerForm');
  const errorMessage = document.getElementById('errorMessage');

  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Get form values
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    // Clear previous error
    errorMessage.textContent = '';
    
    // Validate email format
    if (!email.includes('@') || !/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) {
      errorMessage.textContent = 'Please enter a valid email address';
      errorMessage.classList.add('animate-shake');
      setTimeout(() => {
        errorMessage.classList.remove('animate-shake');
      }, 500);
      return;
    }

    // Validate password requirements
    if (password.length < 6) {
      errorMessage.textContent = 'Password must be at least 6 characters long';
      errorMessage.classList.add('animate-shake');
      setTimeout(() => {
        errorMessage.classList.remove('animate-shake');
      }, 500);
      return;
    }

    if (!/[A-Z]/.test(password)) {
      errorMessage.textContent = 'Password must contain at least one uppercase letter';
      errorMessage.classList.add('animate-shake');
      setTimeout(() => {
        errorMessage.classList.remove('animate-shake');
      }, 500);
      return;
    }

    if (!/\d/.test(password)) {
      errorMessage.textContent = 'Password must contain at least one number';
      errorMessage.classList.add('animate-shake');
      setTimeout(() => {
        errorMessage.classList.remove('animate-shake');
      }, 500);
      return;
    }
    
    // Check if passwords match
    if (password !== confirmPassword) {
      errorMessage.textContent = 'Passwords do not match';
      errorMessage.classList.add('animate-shake');
      setTimeout(() => {
        errorMessage.classList.remove('animate-shake');
      }, 500);
      return;
    }
    
    // Create request body
    const userData = { name, email, password };
    
    try {
      // Submit registration request
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      });
      
      // Check if response is JSON before parsing
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Server error: Unexpected response format');
      }
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }
      
      // Save user data in local storage
      localStorage.setItem('token', data.token);
      localStorage.setItem('userName', data.name);
      localStorage.setItem('userEmail', data.email);
      
      // Redirect to dashboard
      window.location.href = 'dashboard.html';
      
    } catch (error) {
      console.error('Registration error:', error);
      errorMessage.textContent = error.message || 'Registration failed. Please try again.';
      errorMessage.classList.add('animate-shake');
      setTimeout(() => {
        errorMessage.classList.remove('animate-shake');
      }, 500);
    }
  });
}); 