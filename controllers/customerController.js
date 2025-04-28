const Customer = require('../models/customerModel');

// @desc    Get all customers with pagination
// @route   GET /api/customers
// @access  Private
const getCustomers = async (req, res) => {
    try {
        console.log('Fetching customers...');
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        console.log('Query parameters:', { page, limit, skip });

        const customers = await Customer.find()
            .sort({ customer_id: 1 })
            .skip(skip)
            .limit(limit);

        console.log('Found customers:', customers.length);
        
        const total = await Customer.countDocuments();
        console.log('Total customers in database:', total);

        res.json({
            success: true,
            customers,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Error fetching customers:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch customers',
            error: error.message
        });
    }
};

// @desc    Get single customer by ID
// @route   GET /api/customers/:id
// @access  Private
const getCustomerById = async (req, res) => {
    try {
        console.log('Fetching customer by ID:', req.params.id);
        const customerId = parseInt(req.params.id);
        console.log('Parsed customer ID:', customerId);

        const customer = await Customer.findOne({ customer_id: customerId });
        console.log('Found customer:', customer ? 'Yes' : 'No');
        
        if (!customer) {
            console.log('Customer not found');
            return res.status(404).json({
                success: false,
                message: `Customer with ID ${req.params.id} not found`
            });
        }

        console.log('Returning customer data');
        res.json({
            success: true,
            customer
        });
    } catch (error) {
        console.error('Error fetching customer:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch customer',
            error: error.message
        });
    }
};

// @desc    Create new customer
// @route   POST /api/customers
// @access  Private
const createCustomer = async (req, res) => {
    try {
        const customer = await Customer.create(req.body);
        res.status(201).json({
            success: true,
            customer
        });
    } catch (error) {
        console.error('Error creating customer:', error);
        res.status(400).json({
            success: false,
            message: 'Failed to create customer',
            error: error.message
        });
    }
};

// @desc    Update customer
// @route   PUT /api/customers/:id
// @access  Private
const updateCustomer = async (req, res) => {
    try {
        const customer = await Customer.findOneAndUpdate(
            { customer_id: parseInt(req.params.id) },
            req.body,
            { new: true, runValidators: true }
        );

        if (!customer) {
            return res.status(404).json({
                success: false,
                message: `Customer with ID ${req.params.id} not found`
            });
        }

        res.json({
            success: true,
            customer
        });
    } catch (error) {
        console.error('Error updating customer:', error);
        res.status(400).json({
            success: false,
            message: 'Failed to update customer',
            error: error.message
        });
    }
};

// @desc    Delete customer
// @route   DELETE /api/customers/:id
// @access  Private
const deleteCustomer = async (req, res) => {
    try {
        const customer = await Customer.findOneAndDelete({ customer_id: parseInt(req.params.id) });

        if (!customer) {
            return res.status(404).json({
                success: false,
                message: `Customer with ID ${req.params.id} not found`
            });
        }

        res.json({
            success: true,
            message: `Customer with ID ${req.params.id} deleted successfully`
        });
    } catch (error) {
        console.error('Error deleting customer:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete customer',
            error: error.message
        });
    }
};

// @desc    Get delinquent customers
// @route   GET /api/customers/delinquent
// @access  Private
const getDelinquentCustomers = async (req, res) => {
    try {
        console.log('Fetching delinquent customers...');
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        console.log('Query parameters:', { page, limit, skip });

        // Find delinquent customers by current_delinquent field
        const query = {
            current_delinquent: true
        };

        console.log('Query:', JSON.stringify(query, null, 2));

        const delinquentCustomers = await Customer.find(query)
            .sort({ collectibility_score: -1 })
            .skip(skip)
            .limit(limit);

        console.log(`Found ${delinquentCustomers.length} delinquent customers`);

        // Get total count
        const total = await Customer.countDocuments(query);

        console.log('Total delinquent customers:', total);

        res.json({
            success: true,
            customers: delinquentCustomers,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Error in getDelinquentCustomers:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch delinquent customers',
            error: error.message
        });
    }
};

module.exports = {
    getCustomers,
    getCustomerById,
    createCustomer,
    updateCustomer,
    deleteCustomer,
    getDelinquentCustomers
}; 