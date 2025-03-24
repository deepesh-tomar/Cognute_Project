// Check if user is already logged in
document.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('userToken');
  
  if (token) {
    // Redirect to dashboard page if token exists
    window.location.href = 'dashboard.html';
  }
}); 