// Check authentication on page load
document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    const currentPage = window.location.pathname;

    if (token) {
        // If logged in and on login page, redirect to dashboard
        if (currentPage === '/' || currentPage === '/index.html') {
            window.location.href = '/dashboard.html';
        }
    } else {
        // If not logged in and trying to access dashboard, redirect to login
        if (currentPage === '/dashboard.html') {
            window.location.href = '/index.html';
        }
    }

    // Setup form handlers
    setupForms();
});

// Setup all form handlers
function setupForms() {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const searchForm = document.getElementById('searchForm');
    const addCustomerForm = document.getElementById('addCustomerForm');

    if (loginForm) loginForm.addEventListener('submit', handleLogin);
    if (registerForm) registerForm.addEventListener('submit', handleRegister);
    if (searchForm) searchForm.addEventListener('submit', handleSearch);
    if (addCustomerForm) addCustomerForm.addEventListener('submit', handleAddCustomer);
}

// Toggle between login and register forms
function toggleForms(form) {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    
    if (form === 'login') {
        loginForm.style.display = 'block';
        registerForm.style.display = 'none';
    } else {
        loginForm.style.display = 'none';
        registerForm.style.display = 'block';
    }
}

// Handle login
async function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const errorDiv = document.getElementById('loginError');

    try {
        const response = await fetch('/api/users/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (response.ok) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('userName', data.name);
            window.location.href = '/dashboard.html';
        } else {
            errorDiv.textContent = data.message;
        }
    } catch (error) {
        errorDiv.textContent = 'Login failed. Please try again.';
    }
}

// Handle registration
async function handleRegister(e) {
    e.preventDefault();
    const name = document.getElementById('registerName').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const errorDiv = document.getElementById('registerError');

    try {
        const response = await fetch('/api/users', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password })
        });

        const data = await response.json();

        if (response.ok) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('userName', data.name);
            window.location.href = '/dashboard.html';
        } else {
            errorDiv.textContent = data.message;
        }
    } catch (error) {
        errorDiv.textContent = 'Registration failed. Please try again.';
    }
}

// Handle customer search
async function handleSearch(e) {
    e.preventDefault();
    const customerId = document.getElementById('customerId').value;
    const resultsDiv = document.getElementById('searchResults');
    const resultsContent = document.getElementById('resultsContent');

    try {
        const response = await fetch(`/api/customers?customer_id=${customerId}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        const data = await response.json();

        if (response.ok) {
            resultsDiv.style.display = 'block';
            if (data.data.length > 0) {
                resultsContent.innerHTML = data.data.map(customer => `
                    <div class="customer-card">
                        <h3>Customer ID: ${customer.customer_id}</h3>
                        <p>Age: ${customer.age}</p>
                        <p>Salary: $${customer.salary_net_income}</p>
                        <p>Loan Amount: $${customer.loan_amount}</p>
                    </div>
                `).join('');
            } else {
                resultsContent.innerHTML = '<p>No customers found.</p>';
            }
        } else {
            resultsContent.innerHTML = `<p class="error">${data.message}</p>`;
        }
    } catch (error) {
        resultsContent.innerHTML = '<p class="error">Search failed. Please try again.</p>';
    }
}

// Handle adding new customer
async function handleAddCustomer(e) {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);
    const customerData = Object.fromEntries(formData.entries());

    try {
        const response = await fetch('/api/customers', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(customerData)
        });

        const data = await response.json();

        if (response.ok) {
            alert('Customer added successfully!');
            form.reset();
        } else {
            alert(data.message || 'Failed to add customer');
        }
    } catch (error) {
        alert('Failed to add customer. Please try again.');
    }
}

// Handle logout
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('userName');
    window.location.href = '/index.html';
} 