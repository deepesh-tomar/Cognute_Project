const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// User Schema
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/, 'Please provide a valid email']
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [6, 'Password must be at least 6 characters']
    }
}, {
    timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) {
        return next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Method to check password
userSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Customer Schema
const customerSchema = new mongoose.Schema({
    customer_id: {
        type: Number,
        required: true,
        unique: true
    },
    age: Number,
    salary_net_income: Number,
    social_security_income: Number,
    self_employed_net_income: Number,
    salary_frequency: String,
    months_at_job: Number,
    total_exp_months: Number,
    ever_bankrupt: Boolean,
    loan_id: Number,
    loan_amount: Number,
    interest_rate: Number,
    fee: Number,
    tenure: Number,
    recurring_payment_amount: Number,
    total_due: Number,
    loan_status: String,
    credit_score: Number,
    past_collection_amount: Number,
    refinance: Boolean,
    extended_payment_plan: Boolean,
    settlement_plans_with_waive_off: Boolean
}, {
    timestamps: true
});

// Create index for faster search
customerSchema.index({ customer_id: 1 });

const User = mongoose.model('User', userSchema);
const Customer = mongoose.model('Customer', customerSchema);

module.exports = { User, Customer }; 