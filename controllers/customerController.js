const Customer = require('../models/Customer');

// @desc    Get customers with optional filtering
// @route   GET /api/customers
// @access  Private
const getCustomers = async (req, res) => {
  try {
    const { customer_id, loan_id, limit = 10, page = 1 } = req.query;
    
    // Build filter object
    const filter = {};
    if (customer_id) filter.customer_id = parseInt(customer_id);
    if (loan_id) filter.loan_id = parseInt(loan_id);
    
    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Execute query
    const customers = await Customer.find(filter)
      .limit(parseInt(limit))
      .skip(skip)
      .sort({ customer_id: 1 });
    
    // Get total count for pagination
    const total = await Customer.countDocuments(filter);
    
    res.json({
      success: true,
      count: customers.length,
      total,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit))
      },
      data: customers
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Get single customer by ID
// @route   GET /api/customers/:id
// @access  Private
const getCustomerById = async (req, res) => {
  try {
    const customer = await Customer.findOne({ customer_id: req.params.id });
    
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }
    
    res.json({
      success: true,
      data: customer
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Create new customer
// @route   POST /api/customers
// @access  Private
const createCustomer = async (req, res) => {
  try {
    // Check if customer already exists
    const existingCustomer = await Customer.findOne({ customer_id: req.body.customer_id });
    
    if (existingCustomer) {
      return res.status(400).json({ success: false, message: 'Customer ID already exists' });
    }
    
    const customer = await Customer.create(req.body);
    
    res.status(201).json({
      success: true,
      data: customer
    });
  } catch (error) {
    console.error(error);
    if (error.name === 'ValidationError') {
      // Extract validation error messages
      const messages = Object.values(error.errors).map(val => val.message);
      res.status(400).json({ success: false, message: messages.join(', ') });
    } else {
      res.status(500).json({ success: false, message: 'Server Error' });
    }
  }
};

// @desc    Update customer
// @route   PUT /api/customers/:id
// @access  Private
const updateCustomer = async (req, res) => {
  try {
    let customer = await Customer.findOne({ customer_id: req.params.id });
    
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }
    
    // Don't allow changing customer_id in updates
    if (req.body.customer_id && req.body.customer_id !== parseInt(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Cannot change customer_id' });
    }
    
    customer = await Customer.findOneAndUpdate(
      { customer_id: req.params.id },
      req.body,
      { new: true, runValidators: true }
    );
    
    res.json({
      success: true,
      data: customer
    });
  } catch (error) {
    console.error(error);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      res.status(400).json({ success: false, message: messages.join(', ') });
    } else {
      res.status(500).json({ success: false, message: 'Server Error' });
    }
  }
};

// @desc    Delete customer
// @route   DELETE /api/customers/:id
// @access  Private
const deleteCustomer = async (req, res) => {
  try {
    const customer = await Customer.findOne({ customer_id: req.params.id });
    
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }
    
    await Customer.deleteOne({ customer_id: req.params.id });
    
    res.json({
      success: true,
      data: {}
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

module.exports = {
  getCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer
}; 