const Customer = require('../models/customerModel');

// @desc    Get prediction for a customer
// @route   POST /api/predictions
// @access  Private
exports.getPrediction = async (req, res) => {
    try {
        const { customerId } = req.body;

        // Get customer data
        const customer = await Customer.findOne({ customer_id: customerId });
        if (!customer) {
            return res.status(404).json({ message: 'Customer not found' });
        }

        // Mock prediction response
        const mockPrediction = {
            collectibility_score: Math.floor(Math.random() * (100 - 50 + 1)) + 50, // Random score between 50-100
            timestamp: new Date()
        };

        // Update customer with mock prediction
        customer.collectibility_score = mockPrediction.collectibility_score;
        customer.last_prediction_date = mockPrediction.timestamp;
        await customer.save();

        res.json({
            success: true,
            data: {
                customer_id: customer.customer_id,
                collectibility_score: mockPrediction.collectibility_score,
                prediction_date: mockPrediction.timestamp
            }
        });
    } catch (error) {
        console.error('Prediction error:', error);
        res.status(500).json({
            success: false,
            message: 'Error making prediction',
            error: process.env.NODE_ENV === 'development' ? error.message : null
        });
    }
}; 