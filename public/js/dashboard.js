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
  const customerIdInput = document.getElementById('customerId');
  const resultsContainer = document.getElementById('results-container');
  const customerModal = document.getElementById('customer-modal');
  const addCustomerBtn = document.getElementById('add-customer-btn');
  const addCustomerModal = document.getElementById('add-customer-modal');
  const addCustomerForm = document.getElementById('add-customer-form');
  const addCustomerError = document.getElementById('add-customer-error');
  const showDelinquentBtn = document.getElementById('show-delinquent');

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
        
        const response = await fetch(`/api/customers/${customerId}`, {
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
        
        if (!responseData.success) {
          throw new Error(responseData.message || 'Failed to fetch customer');
        }

        displaySearchResults([responseData.customer]);
        
      } catch (error) {
        console.error('Search error:', error);
        resultsContainer.innerHTML = `
          <div class="error-message">
            <i class="fas fa-exclamation-circle"></i> ${error.message}
          </div>
        `;
      }
    } else {
      resultsContainer.innerHTML = '<p class="no-results">Please enter a customer ID to search</p>';
    }
    reinitializeAnimations();
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
    reinitializeAnimations();
  });

  // Display search results
  function displaySearchResults(customers) {
    if (!customers || customers.length === 0) {
        resultsContainer.innerHTML = '<p class="no-results">No customers found</p>';
        return;
    }
    
    console.log('Displaying customers:', customers);
    
    let resultsHTML = `
        <div class="search-results">
            <div class="results-header">
                <div class="header-icon">
                    <i class="fas fa-users"></i>
                    Search Results
                </div>
                <div class="total-results">
                    Total: ${customers.length} customers found
                </div>
            </div>
            <div class="results-container">
                <div class="customer-list">
                    <div class="list-header">
                        <div class="list-cell">CUSTOMER ID</div>
                        <div class="list-cell">CURRENT DELINQUENT</div>
                        <div class="list-cell">CURRENT DEFAULT</div>
                        <div class="list-cell">COLLECTIBILITY SCORE</div>
                        <div class="list-cell">DAYS SINCE LAST PAYMENT</div>
                    </div>
                    <div class="list-body">
    `;
    
    customers.forEach(customer => {
        resultsHTML += `
            <div class="list-row" data-customer-id="${customer.customer_id}">
                <div class="list-cell customer-id">${customer.customer_id}</div>
                <div class="list-cell">${customer.current_delinquent === true ? 'Yes' : customer.current_delinquent === false ? 'No' : 'N/A'}</div>
                <div class="list-cell">${customer.current_default === true ? 'Yes' : customer.current_default === false ? 'No' : 'N/A'}</div>
                <div class="list-cell highlight">${typeof customer.collectibility_score === 'number' ? customer.collectibility_score.toFixed(2) : (customer.collectibility_score || 'N/A')}</div>
                <div class="list-cell days">${customer.no_of_days_since_last_payment !== undefined ? customer.no_of_days_since_last_payment : 'N/A'}</div>
            </div>
        `;
    });
    
    resultsHTML += `
                    </div>
                </div>
                <div class="customer-details-panel">
                    <div class="details-placeholder">
                        <i class="fas fa-user-circle"></i>
                        <p>Select a customer to view details</p>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    resultsContainer.innerHTML = resultsHTML;
    
    // Add click event to each row
    const listRows = document.querySelectorAll('.list-row');
    listRows.forEach(row => {
        row.addEventListener('click', async () => {
            // Remove active class from all rows
            listRows.forEach(r => r.classList.remove('active'));
            // Add active class to clicked row
            row.classList.add('active');
            
            const customerId = row.getAttribute('data-customer-id');
            await showCustomerDetails(customerId);
        });
    });
  }

  // Function to show customer details in modal
  async function showCustomerDetails(customerId) {
    try {
      const response = await fetch(`/api/customers/${customerId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch customer details');
      }
      
      const responseData = await response.json();
      if (!responseData.success || !responseData.customer) {
        throw new Error('No customer data found');
      }

      const customer = responseData.customer;
      // Only show fields present in the CSV, in the same order
      const csvFields = [
        'customer_id','age','salary_net_income','social_security_net_income','self_employed_net_income','salary_frequency','months_current_job','total_experience_months','current_bankruptcy_status','ever_bankrupt','loan_id','loan_amount','interest_rate','tenure','tenure_type','fee','recurring_payment_amount','total_due','no_of_days_since_last_payment','missed_payments','on_time_payments','penalty','current_due','current_delinquent','current_default','past_collection_success','past_delinquencies','credit_score','past_to_be_collected','past_collection_amount','collectibility_score','refinance','extended_payment_plan','settlement_plans_with_waive_off','accepted_option','promised_to_pay','promised_to_pay_status','expected_collection_amount'
      ];
      const highlightFields = [
        'customer_id',
        'collectibility_score',
        'accepted_option',
        'promised_to_pay',
        'promised_to_pay_status',
        'is_option_accepted'
      ];
      const fieldLabels = {
        customer_id: 'Customer ID',
        age: 'Age',
        salary_net_income: 'Salary Net Income',
        social_security_net_income: 'Social Security Net Income',
        self_employed_net_income: 'Self Employed Net Income',
        salary_frequency: 'Salary Frequency',
        months_current_job: 'Months Current Job',
        total_experience_months: 'Total Experience Months',
        current_bankruptcy_status: 'Current Bankruptcy Status',
        ever_bankrupt: 'Ever Bankrupt',
        loan_id: 'Loan ID',
        loan_amount: 'Loan Amount',
        interest_rate: 'Interest Rate',
        tenure: 'Tenure',
        tenure_type: 'Tenure Type',
        fee: 'Fee',
        recurring_payment_amount: 'Recurring Payment Amount',
        total_due: 'Total Due',
        no_of_days_since_last_payment: 'No. of Days Since Last Payment',
        missed_payments: 'Missed Payments',
        on_time_payments: 'On Time Payments',
        penalty: 'Penalty',
        current_due: 'Current Due',
        current_delinquent: 'Current Delinquent',
        current_default: 'Current Default',
        past_collection_success: 'Past Collection Success',
        past_delinquencies: 'Past Delinquencies',
        credit_score: 'Credit Score',
        past_to_be_collected: 'Past To Be Collected',
        past_collection_amount: 'Past Collection Amount',
        collectibility_score: 'Collectibility Score',
        refinance: 'Refinance',
        extended_payment_plan: 'Extended Payment Plan',
        settlement_plans_with_waive_off: 'Settlement Plans With Waive Off',
        accepted_option: 'Accepted Option',
        promised_to_pay: 'Promised To Pay',
        promised_to_pay_status: 'Promised To Pay Status',
        expected_collection_amount: 'Expected Collection Amount'
      };
      let detailsHTML = '<div class="customer-details-grid">';
      for (const key of csvFields) {
        if (!(key in customer)) continue;
        const value = customer[key];
        const label = fieldLabels[key] || key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        const highlight = highlightFields.includes(key) ? ' highlight' : '';
        detailsHTML += `
          <div class="detail-group${highlight}">
            <span class="detail-label">${label}</span>
            <div class="detail-value">${value !== undefined && value !== null && value !== '' ? value : 'N/A'}</div>
          </div>
        `;
      }
      detailsHTML += '</div>';
      document.getElementById('customer-details').innerHTML = detailsHTML;
      document.getElementById('modal-title').innerHTML = `<i class='fas fa-user'></i> Customer Details - ID: ${customer.customer_id}`;
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

  // Show delinquent customers
  showDelinquentBtn.addEventListener('click', async () => {
    try {
        console.log('Fetching delinquent customers...');
        resultsContainer.innerHTML = '<p class="no-results">Loading delinquent customers...</p>';
        
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('No authentication token found. Please log in again.');
        }

        const response = await fetch('/api/customers/delinquent', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to fetch delinquent customers');
        }
        
        const responseData = await response.json();
        
        if (!responseData.success) {
            throw new Error(responseData.message || 'Failed to fetch delinquent customers');
        }

        if (!responseData.customers || responseData.customers.length === 0) {
            resultsContainer.innerHTML = '<p class="no-results">No delinquent customers found</p>';
            return;
        }

        let resultsHTML = `
            <div class="search-results">
                <div class="results-header">
                    <div class="header-icon">
                        <i class="fas fa-exclamation-triangle"></i>
                        Search Results
                    </div>
                    <div class="total-results">
                        Total: ${responseData.pagination.total} customers (Sorted by Collectibility Score)
                    </div>
                </div>

                <div class="results-container">
                    <div class="customer-list">
                        <div class="list-header">
                            <div class="list-cell">CUSTOMER ID</div>
                            <div class="list-cell">CURRENT DELINQUENT</div>
                            <div class="list-cell">CURRENT DEFAULT</div>
                            <div class="list-cell">COLLECTIBILITY SCORE</div>
                            <div class="list-cell">DAYS SINCE LAST PAYMENT</div>
                        </div>
                        <div class="list-body">
        `;

        responseData.customers.forEach(customer => {
            resultsHTML += `
                <div class="list-row" data-customer-id="${customer.customer_id}">
                    <div class="list-cell customer-id">${customer.customer_id}</div>
                    <div class="list-cell">${customer.current_delinquent === true ? 'Yes' : customer.current_delinquent === false ? 'No' : 'N/A'}</div>
                    <div class="list-cell">${customer.current_default === true ? 'Yes' : customer.current_default === false ? 'No' : 'N/A'}</div>
                    <div class="list-cell highlight">${typeof customer.collectibility_score === 'number' ? customer.collectibility_score.toFixed(2) : (customer.collectibility_score || 'N/A')}</div>
                    <div class="list-cell days">${customer.no_of_days_since_last_payment !== undefined ? customer.no_of_days_since_last_payment : 'N/A'}</div>
                </div>
            `;
        });

        resultsHTML += `
                        </div>
                    </div>
                </div>
        `;

        // Pagination controls
        const { page, pages } = responseData.pagination;
        if (pages > 1) {
            resultsHTML += `<div class="pagination"><div class="page-controls">`;
            // First page button
            resultsHTML += `<button class="btn page-number" data-page="1"${page === 1 ? ' disabled' : ''}>&laquo;</button>`;
            // Page numbers with ellipsis
            const pageNumbers = generatePaginationNumbers(page, pages);
            pageNumbers.forEach(p => {
                if (p === '...') {
                    resultsHTML += `<span class="page-ellipsis">...</span>`;
                } else {
                    resultsHTML += `<button class="btn page-number${p === page ? ' active' : ''}" data-page="${p}"${p === page ? ' disabled' : ''}>${p}</button>`;
                }
            });
            // Last page button
            resultsHTML += `<button class="btn page-number" data-page="${pages}"${page === pages ? ' disabled' : ''}>&raquo;</button>`;
            resultsHTML += `</div></div>`;
        }

        resultsContainer.innerHTML = resultsHTML;

        // Add click event to each row
        const listRows = document.querySelectorAll('.list-row');
        listRows.forEach(row => {
            row.addEventListener('click', async () => {
                // Remove active class from all rows
                listRows.forEach(r => r.classList.remove('active'));
                // Add active class to clicked row
                row.classList.add('active');

                const customerId = row.getAttribute('data-customer-id');
                try {
                    const response = await fetch(`/api/customers/${customerId}`, {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });

                    if (!response.ok) {
                        throw new Error('Failed to fetch customer details');
                    }

                    const data = await response.json();
                    const customer = data.customer;

                    // Show details in modal (reuse the same logic as showCustomerDetails)
                    const highlightFields = [
                        'customer_id',
                        'collectibility_score',
                        'accepted_option',
                        'promised_to_pay',
                        'promised_to_pay_status',
                        'is_option_accepted'
                    ];
                    const fieldLabels = {
                        customer_id: 'Customer ID',
                        collectibility_score: 'Collectibility Score',
                        accepted_option: 'Accepted Option',
                        promised_to_pay: 'Promised To Pay',
                        promised_to_pay_status: 'Promised To Pay Status',
                        is_option_accepted: 'Is Option Accepted',
                    };
                    let detailsHTML = '<div class="customer-details-grid">';
                    for (const [key, value] of Object.entries(customer)) {
                        if (key === '__v' || key === '_id' || key === 'createdAt' || key === 'updatedAt') continue;
                        const label = fieldLabels[key] || key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                        const highlight = highlightFields.includes(key) ? ' highlight' : '';
                        detailsHTML += `
                            <div class="detail-group${highlight}">
                                <span class="detail-label">${label}</span>
                                <div class="detail-value">${value !== undefined && value !== null && value !== '' ? value : 'N/A'}</div>
                            </div>
                        `;
                    }
                    detailsHTML += '</div>';
                    document.getElementById('customer-details').innerHTML = detailsHTML;
                    document.getElementById('modal-title').innerHTML = `<i class='fas fa-user'></i> Customer Details - ID: ${customer.customer_id}`;
                    customerModal.style.display = 'block';
                } catch (error) {
                    console.error('Error fetching customer details:', error);
                    document.getElementById('customer-details').innerHTML = `
                        <div class="error-message">
                            <i class="fas fa-exclamation-circle"></i>
                            Failed to load customer details
                        </div>
                    `;
                    customerModal.style.display = 'block';
                }
            });
        });

        // Add click event to pagination buttons
        const pageButtons = document.querySelectorAll('.page-number');
        pageButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const page = parseInt(btn.getAttribute('data-page'));
                if (!btn.disabled && page > 0 && page <= pages) {
                    changePage(page);
                }
            });
        });

    } catch (error) {
        console.error('Error fetching delinquent customers:', error);
        resultsContainer.innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-circle"></i> ${error.message}
            </div>
        `
    }
    reinitializeAnimations();
  });

  // Function to change page for delinquent customers
  window.changePage = async (page) => {
    try {
        resultsContainer.innerHTML = '<p class="no-results">Loading...</p>';
        
        const response = await fetch(`/api/customers/delinquent?page=${page}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to fetch delinquent customers');
        }
        
        const responseData = await response.json();
        
        if (!responseData.success) {
            throw new Error(responseData.message || 'Failed to fetch delinquent customers');
        }

        // Render the results directly instead of triggering button click
        let resultsHTML = `
            <div class="search-results">
                <div class="results-header">
                    <div class="header-icon">
                        <i class="fas fa-exclamation-triangle"></i>
                        Search Results
                    </div>
                    <div class="total-results">
                        Total: ${responseData.pagination.total} customers (Sorted by Collectibility Score)
                    </div>
                </div>

                <div class="results-container">
                    <div class="customer-list">
                        <div class="list-header">
                            <div class="list-cell">CUSTOMER ID</div>
                            <div class="list-cell">CURRENT DELINQUENT</div>
                            <div class="list-cell">CURRENT DEFAULT</div>
                            <div class="list-cell">COLLECTIBILITY SCORE</div>
                            <div class="list-cell">DAYS SINCE LAST PAYMENT</div>
                        </div>
                        <div class="list-body">
        `;

        responseData.customers.forEach(customer => {
            resultsHTML += `
                <div class="list-row" data-customer-id="${customer.customer_id}">
                    <div class="list-cell customer-id">${customer.customer_id}</div>
                    <div class="list-cell">${customer.current_delinquent === true ? 'Yes' : customer.current_delinquent === false ? 'No' : 'N/A'}</div>
                    <div class="list-cell">${customer.current_default === true ? 'Yes' : customer.current_default === false ? 'No' : 'N/A'}</div>
                    <div class="list-cell highlight">${typeof customer.collectibility_score === 'number' ? customer.collectibility_score.toFixed(2) : (customer.collectibility_score || 'N/A')}</div>
                    <div class="list-cell days">${customer.no_of_days_since_last_payment !== undefined ? customer.no_of_days_since_last_payment : 'N/A'}</div>
                </div>
            `;
        });

        resultsHTML += `
                        </div>
                    </div>
                </div>
        `;

        // Pagination controls
        const { page: currentPage, pages } = responseData.pagination;
        if (pages > 1) {
            resultsHTML += `<div class="pagination"><div class="page-controls">`;
            // First page button
            resultsHTML += `<button class="btn page-number" data-page="1"${currentPage === 1 ? ' disabled' : ''}>&laquo;</button>`;
            // Page numbers with ellipsis
            const pageNumbers = generatePaginationNumbers(currentPage, pages);
            pageNumbers.forEach(p => {
                if (p === '...') {
                    resultsHTML += `<span class="page-ellipsis">...</span>`;
                } else {
                    resultsHTML += `<button class="btn page-number${p === currentPage ? ' active' : ''}" data-page="${p}"${p === currentPage ? ' disabled' : ''}>${p}</button>`;
                }
            });
            // Last page button
            resultsHTML += `<button class="btn page-number" data-page="${pages}"${currentPage === pages ? ' disabled' : ''}>&raquo;</button>`;
            resultsHTML += `</div></div>`;
        }

        resultsContainer.innerHTML = resultsHTML;

        // Add click event to each row
        const listRows = document.querySelectorAll('.list-row');
        listRows.forEach(row => {
            row.addEventListener('click', async () => {
                // Remove active class from all rows
                listRows.forEach(r => r.classList.remove('active'));
                // Add active class to clicked row
                row.classList.add('active');

                const customerId = row.getAttribute('data-customer-id');
                try {
                    const response = await fetch(`/api/customers/${customerId}`, {
                        headers: {
                            'Authorization': `Bearer ${localStorage.getItem('token')}`
                        }
                    });

                    if (!response.ok) {
                        throw new Error('Failed to fetch customer details');
                    }

                    const data = await response.json();
                    const customer = data.customer;

                    // Show details in modal (reuse the same logic as showCustomerDetails)
                    const highlightFields = [
                        'customer_id',
                        'collectibility_score',
                        'accepted_option',
                        'promised_to_pay',
                        'promised_to_pay_status',
                        'is_option_accepted'
                    ];
                    const fieldLabels = {
                        customer_id: 'Customer ID',
                        collectibility_score: 'Collectibility Score',
                        accepted_option: 'Accepted Option',
                        promised_to_pay: 'Promised To Pay',
                        promised_to_pay_status: 'Promised To Pay Status',
                        is_option_accepted: 'Is Option Accepted',
                    };
                    let detailsHTML = '<div class="customer-details-grid">';
                    for (const [key, value] of Object.entries(customer)) {
                        if (key === '__v' || key === '_id' || key === 'createdAt' || key === 'updatedAt') continue;
                        const label = fieldLabels[key] || key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                        const highlight = highlightFields.includes(key) ? ' highlight' : '';
                        detailsHTML += `
                            <div class="detail-group${highlight}">
                                <span class="detail-label">${label}</span>
                                <div class="detail-value">${value !== undefined && value !== null && value !== '' ? value : 'N/A'}</div>
                            </div>
                        `;
                    }
                    detailsHTML += '</div>';
                    document.getElementById('customer-details').innerHTML = detailsHTML;
                    document.getElementById('modal-title').innerHTML = `<i class='fas fa-user'></i> Customer Details - ID: ${customer.customer_id}`;
                    customerModal.style.display = 'block';
                } catch (error) {
                    console.error('Error fetching customer details:', error);
                    document.getElementById('customer-details').innerHTML = `
                        <div class="error-message">
                            <i class="fas fa-exclamation-circle"></i>
                            Failed to load customer details
                        </div>
                    `;
                    customerModal.style.display = 'block';
                }
            });
        });

        // Add click event to pagination buttons
        const pageButtons = document.querySelectorAll('.page-number');
        pageButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const page = parseInt(btn.getAttribute('data-page'));
                if (!btn.disabled && page > 0 && page <= pages) {
                    changePage(page);
                }
            });
        });

    } catch (error) {
        console.error('Error changing page:', error);
        resultsContainer.innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-circle"></i> ${error.message}
            </div>
        `;
    }
  };

  // Function to generate pagination numbers with ellipsis
  function generatePaginationNumbers(currentPage, totalPages) {
    const delta = 2; // Number of pages to show before and after current page
    const range = [];
    const rangeWithDots = [];
    let l;

    // Always show first page
    range.push(1);

    for (let i = currentPage - delta; i <= currentPage + delta; i++) {
        if (i > 1 && i < totalPages) {
            range.push(i);
        }
    }

    // Always show last page
    if (totalPages > 1) {
        range.push(totalPages);
    }

    // Add the page numbers to final array with dots
    for (let i of range) {
        if (l) {
            if (i - l === 2) {
                rangeWithDots.push(l + 1);
            } else if (i - l !== 1) {
                rangeWithDots.push('...');
            }
        }
        rangeWithDots.push(i);
        l = i;
    }

    return rangeWithDots;
  }

  // Add scroll-based animations
  const addScrollAnimations = () => {
    const listHeader = document.querySelector('.list-header');
    const detailGroups = document.querySelectorAll('.detail-group');
    
    // Intersection Observer for fade-in animations
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1
    });

    // Observe detail groups for fade-in
    detailGroups.forEach(group => {
      group.classList.add('page-transition');
      observer.observe(group);
    });

    // Handle sticky header animation
    if (listHeader) {
      window.addEventListener('scroll', () => {
        const scrolled = window.scrollY > 100;
        listHeader.classList.toggle('scrolled', scrolled);
      });
    }
  };

  // Add loading animations
  const showLoading = (container) => {
    container.innerHTML = `
      <div class="loading">
        <div class="loading-spinner"></div>
      </div>
    `;
  };

  // Add shimmer effect to loading elements
  const addShimmerEffect = () => {
    const shimmerElements = document.querySelectorAll('.shimmer-effect');
    shimmerElements.forEach(element => {
      element.classList.add('shimmer');
    });
  };

  // Enhance button click feedback
  const addButtonEffects = () => {
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(button => {
      button.addEventListener('click', function(e) {
        if (!this.disabled) {
          // Create ripple effect
          const ripple = document.createElement('div');
          ripple.classList.add('ripple');
          this.appendChild(ripple);

          // Position the ripple
          const rect = this.getBoundingClientRect();
          const size = Math.max(rect.width, rect.height);
          ripple.style.width = ripple.style.height = `${size}px`;
          ripple.style.left = `${e.clientX - rect.left - size/2}px`;
          ripple.style.top = `${e.clientY - rect.top - size/2}px`;

          // Remove ripple after animation
          ripple.addEventListener('animationend', () => {
            ripple.remove();
          });
        }
      });
    });
  };

  // Add status badge animations
  const addStatusAnimations = () => {
    const statusBadges = document.querySelectorAll('.status');
    statusBadges.forEach(badge => {
      badge.classList.add('animated');
    });
  };

  // Initialize all animations
  const initializeAnimations = () => {
    addScrollAnimations();
    addButtonEffects();
    addStatusAnimations();
    
    // Add animation classes to sections
    document.querySelectorAll('.search-section, .add-customer-section, .results-section').forEach((section, index) => {
      section.style.animationDelay = `${index * 0.2}s`;
      section.classList.add('animate-in');
    });
  };

  // Call animation initialization after DOM content is loaded
  document.addEventListener('DOMContentLoaded', initializeAnimations);

  // Reinitialize animations when content changes
  const reinitializeAnimations = () => {
    setTimeout(initializeAnimations, 100);
  };
});