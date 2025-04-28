const express = require('express');
const router = express.Router();
const {
  getCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  getDelinquentCustomers
} = require('../controllers/customerController');
const { protect } = require('../middleware/authMiddleware');
const Customer = require('../models/customerModel');

// Protect all routes
router.use(protect);

// Route for delinquent customers (must come before :id route)
router.get('/delinquent', getDelinquentCustomers);

// Routes for /api/customers
router.route('/')
  .get(getCustomers)
  .post(createCustomer);

// Routes for /api/customers/:id
router.route('/:id')
  .get(getCustomerById)
  .put(updateCustomer)
  .delete(deleteCustomer);

module.exports = router; 