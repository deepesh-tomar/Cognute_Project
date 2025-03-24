document.addEventListener('DOMContentLoaded', () => {
  // Check if user is logged in
  const token = localStorage.getItem('token');
  if (!token) {
    window.location.href = 'login.html';
    return;
  }

  // Display user name
  const userName = localStorage.getItem('userName');
  const userDisplayName = document.getElementById('user-display-name');
  if (userName) {
    userDisplayName.innerHTML = `<i class="fas fa-user-circle"></i> Welcome, ${userName}`;
  }

  // Logout functionality
  const logoutBtn = document.getElementById('logout-btn');
  logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userName');
    localStorage.removeItem('userEmail');
    window.location.href = 'login.html';
  });

  // Get references to DOM elements
  const searchForm = document.getElementById('search-form');
  const clearSearchBtn = document.getElementById('clear-search');
  const customerIdInput = document.getElementById('customer-id');
  const resultsContainer = document.getElementById('results-container');
  const customerModal = document.getElementById('customer-modal');
  const addCustomerBtn = document.getElementById('add-customer-btn');
  const addCustomerModal = document.getElementById('add-customer-modal');
  const addCustomerForm = document.getElementById('add-customer-form');
  const addCustomerError = document.getElementById('add-customer-error');

  // Ensure the customer ID input is visible
  if (customerIdInput) {
    // Make sure the input is visible and not affected by animations
    customerIdInput.style.display = 'block';
    customerIdInput.style.visibility = 'visible';
    customerIdInput.style.opacity = '1';
  }

  // Add subtle animations to page elements without affecting inputs
  const sections = document.querySelectorAll('.search-section, .add-customer-section, .results-section');
  sections.forEach((section, index) => {
    setTimeout(() => {
      section.style.opacity = '1';
      section.style.transform = 'translateY(0)';
    }, index * 200);
  });
  
  // Close modals when clicking the X
  const closeButtons = document.querySelectorAll('.close');
  closeButtons.forEach(button => {
    button.addEventListener('click', () => {
      customerModal.style.display = 'none';
      addCustomerModal.style.display = 'none';
    });
  });

  // Close modals when clicking outside of them
  window.addEventListener('click', (event) => {
    if (event.target === customerModal) {
      customerModal.style.display = 'none';
    }
    if (event.target === addCustomerModal) {
      addCustomerModal.style.display = 'none';
    }
  });

  // Search for customers
  searchForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const customerId = customerIdInput.value.trim();
    console.log('Searching for customer ID:', customerId);
    
    if (customerId) {
      try {
        resultsContainer.innerHTML = '<p class="no-results">Searching...</p>';
        
        // Make API request to fetch customer by ID
        const response = await fetch(`/api/customers?customer_id=${customerId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        console.log('API Response status:', response.status);
        
        if (!response.ok) {
          throw new Error(`Customer not found (Status: ${response.status})`);
        }
        
        const responseData = await response.json();
        console.log('API Response data:', responseData);
        
        // Check if we received data in the expected format
        let customers = [];
        
        if (responseData.data && Array.isArray(responseData.data)) {
          customers = responseData.data;
        } else if (Array.isArray(responseData)) {
          customers = responseData;
        } else if (responseData.data && !Array.isArray(responseData.data)) {
          // If it's a single object, wrap it in an array
          customers = [responseData.data];
        } else if (responseData && !Array.isArray(responseData)) {
          // If it's a single object, wrap it in an array
          customers = [responseData];
        }
        
        console.log('Processed customer data:', customers);
        
        if (!customers || customers.length === 0) {
          resultsContainer.innerHTML = '<p class="no-results">No customer found with that ID</p>';
          return;
        }
        
        displaySearchResults(customers);
        
      } catch (error) {
        console.error('Search error:', error);
        resultsContainer.innerHTML = `
          <div class="error-message">
            <i class="fas fa-exclamation-circle"></i> ${error.message}
          </div>
        `;
      }
    } else {
      // If no ID provided, show a message to enter a customer ID
      resultsContainer.innerHTML = '<p class="no-results">Please enter a customer ID to search</p>';
    }
  });

  // Clear search results
  clearSearchBtn.addEventListener('click', () => {
    customerIdInput.value = '';
    resultsContainer.innerHTML = '<p class="no-results">Enter a customer ID to search</p>';
  });

  // Show add customer modal
  addCustomerBtn.addEventListener('click', () => {
    addCustomerModal.style.display = 'block';
    
    // Clear any previous form data and errors
    addCustomerForm.reset();
    addCustomerError.textContent = '';
  });

  // Add new customer
  addCustomerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Clear previous error
    addCustomerError.textContent = '';
    
    // Get form data
    const formData = new FormData(addCustomerForm);
    const customerData = {};
    
    // Convert FormData to object and handle number types
    formData.forEach((value, key) => {
      // Convert numeric values to numbers
      if (['customer_id', 'loan_id', 'age', 'loan_amount', 'interest_rate', 'tenure', 'credit_score', 'salary_net_income'].includes(key) && value !== '') {
        customerData[key] = Number(value);
      } else if (value !== '') {
        customerData[key] = value;
      }
    });
    
    // Validate required fields
    if (!customerData.customer_id || !customerData.loan_id) {
      addCustomerError.textContent = 'Customer ID and Loan ID are required';
      return;
    }
    
    try {
      const response = await fetch('/api/customers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(customerData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add customer');
      }
      
      // Close modal
      addCustomerModal.style.display = 'none';
      
      // Show success message
      resultsContainer.innerHTML = `
        <div class="success-message">
          <i class="fas fa-check-circle"></i> Customer added successfully!
        </div>
      `;
      
      // Don't fetch all customers - just show a message to search for the newly added customer
      setTimeout(() => {
        resultsContainer.innerHTML = '<p class="no-results">Customer added! Enter a customer ID to search.</p>';
      }, 2000);
      
    } catch (error) {
      addCustomerError.textContent = error.message;
      console.error('Add customer error:', error);
    }
  });

  // Display search results
  function displaySearchResults(customers) {
    if (!customers || customers.length === 0) {
      resultsContainer.innerHTML = '<p class="no-results">No customers found</p>';
      return;
    }
    
    console.log('Displaying customers:', customers);
    let resultsHTML = '';
    
    customers.forEach((customer, index) => {
      // Skip invalid customer data
      if (!customer || !customer.customer_id) {
        console.warn('Invalid customer data:', customer);
        return;
      }
      
      resultsHTML += `
        <div class="result-card" data-customer-id="${customer.customer_id}">
          <div class="result-header">
            <h3><i class="fas fa-user"></i> Customer ID: ${customer.customer_id}</h3>
            <span>Loan ID: ${customer.loan_id || 'N/A'}</span>
          </div>
          <div class="result-body">
            <div class="result-field">
              <span class="result-label">Age</span>
              <div>${customer.age || 'N/A'}</div>
            </div>
            <div class="result-field">
              <span class="result-label">Income</span>
              <div>${formatCurrency(customer.salary_net_income)} (${customer.salary_frequency || 'Monthly'})</div>
            </div>
            <div class="result-field">
              <span class="result-label">Loan Amount</span>
              <div>${formatCurrency(customer.loan_amount)}</div>
            </div>
            <div class="result-field">
              <span class="result-label">Interest Rate</span>
              <div>${customer.interest_rate || 0}%</div>
            </div>
          </div>
        </div>
      `;
    });
    
    if (resultsHTML) {
      resultsContainer.innerHTML = resultsHTML;
      
      // Add click event to each result card
      const resultCards = document.querySelectorAll('.result-card');
      resultCards.forEach(card => {
        card.addEventListener('click', () => {
          const customerId = card.getAttribute('data-customer-id');
          showCustomerDetails(customerId);
        });
      });
    } else {
      resultsContainer.innerHTML = '<p class="no-results">No valid customer data found</p>';
    }
  }

  // Show customer details in modal
  async function showCustomerDetails(customerId) {
    try {
      const response = await fetch(`/api/customers?customer_id=${customerId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch customer details');
      }
      
      const responseData = await response.json();
      console.log('Customer details response:', responseData);
      
      // Handle different response formats
      let customer = null;
      
      if (responseData.data && Array.isArray(responseData.data) && responseData.data.length > 0) {
        customer = responseData.data[0];
      } else if (Array.isArray(responseData) && responseData.length > 0) {
        customer = responseData[0];
      } else if (responseData.data && !Array.isArray(responseData.data)) {
        customer = responseData.data;
      } else if (responseData && !Array.isArray(responseData)) {
        customer = responseData;
      }
      
      if (!customer) {
        throw new Error('No customer data found');
      }
      
      // Update modal title
      document.getElementById('modal-title').innerHTML = `
        <i class="fas fa-user"></i> Customer Details - ID: ${customer.customer_id}
      `;
      
      // Create HTML for customer details
      const detailsHTML = `
        <div class="customer-details-grid">
          <div class="detail-group">
            <span class="detail-label"><i class="fas fa-id-card"></i> Customer ID</span>
            <div class="detail-value">${customer.customer_id}</div>
          </div>
          <div class="detail-group">
            <span class="detail-label"><i class="fas fa-birthday-cake"></i> Age</span>
            <div class="detail-value">${customer.age || 'N/A'}</div>
          </div>
          <div class="detail-group">
            <span class="detail-label"><i class="fas fa-money-bill-wave"></i> Net Income</span>
            <div class="detail-value">${formatCurrency(customer.salary_net_income)}</div>
          </div>
          <div class="detail-group">
            <span class="detail-label"><i class="fas fa-calendar-alt"></i> Income Frequency</span>
            <div class="detail-value">${customer.salary_frequency || 'Monthly'}</div>
          </div>
          <div class="detail-group">
            <span class="detail-label"><i class="fas fa-file-invoice-dollar"></i> Loan ID</span>
            <div class="detail-value">${customer.loan_id}</div>
          </div>
          <div class="detail-group">
            <span class="detail-label"><i class="fas fa-dollar-sign"></i> Loan Amount</span>
            <div class="detail-value">${formatCurrency(customer.loan_amount)}</div>
          </div>
          <div class="detail-group">
            <span class="detail-label"><i class="fas fa-percentage"></i> Interest Rate</span>
            <div class="detail-value">${customer.interest_rate || 0}%</div>
          </div>
          <div class="detail-group">
            <span class="detail-label"><i class="fas fa-hourglass-half"></i> Tenure</span>
            <div class="detail-value">${customer.tenure || 'N/A'} ${customer.tenure_type || 'Months'}</div>
          </div>
          <div class="detail-group">
            <span class="detail-label"><i class="fas fa-chart-line"></i> Credit Score</span>
            <div class="detail-value">${customer.credit_score || 'N/A'}</div>
          </div>
        </div>
      `;
      
      document.getElementById('customer-details').innerHTML = detailsHTML;
      
      // Show modal
      customerModal.style.display = 'block';
      
    } catch (error) {
      console.error('Customer details error:', error);
      alert(`Error: ${error.message}`);
    }
  }

  // Helper function to format currency
  function formatCurrency(value) {
    if (value === undefined || value === null) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(value);
  }

  // Initialize with an empty search prompt instead of fetching all customers
  resultsContainer.innerHTML = '<p class="no-results">Enter a customer ID to search</p>';
}); 