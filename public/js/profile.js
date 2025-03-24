document.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('userToken');
  
  // Redirect if not logged in
  if (!token) {
    window.location.href = 'login.html';
    return;
  }

  // Redirect to dashboard
  window.location.href = 'dashboard.html';
}); 