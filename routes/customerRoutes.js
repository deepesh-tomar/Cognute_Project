const express = require('express');
const router = express.Router();
const {
  getCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer
} = require('../controllers/customerController');
const { protect } = require('../middleware/authMiddleware');

// Protect all routes
router.use(protect);

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