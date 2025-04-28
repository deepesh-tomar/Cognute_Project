const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
    customer_id: { type: Number, unique: true, required: true },
    age: Number,
    salary_net_income: Number,
    social_security_net_income: Number,
    self_employed_net_income: Number,
    salary_frequency: String,
    months_current_job: Number,
    total_experience_months: Number,
    current_bankruptcy_status: Boolean,
    ever_bankrupt: Boolean,
    loan_id: Number,
    loan_amount: Number,
    interest_rate: Number,
    tenure: Number,
    tenure_type: String,
    fee: Number,
    recurring_payment_amount: Number,
    total_due: Number,
    no_of_days_since_last_payment: Number,
    missed_payments: Number,
    on_time_payments: Number,
    penalty: Number,
    current_due: Number,
    current_delinquent: Boolean,
    current_default: Boolean,
    past_collection_success: Boolean,
    past_delinquencies: Number,
    credit_score: Number,
    past_to_be_collected: Number,
    past_collection_amount: Number,
    collectibility_score: Number,
    refinance: Boolean,
    extended_payment_plan: Boolean,
    settlement_plans_with_waive_off: Boolean,
    accepted_option: String,
    promised_to_pay: String,
    promised_to_pay_status: String,
    expected_collection_amount: Number
}, {
    timestamps: true
});

// Create index for faster search
customerSchema.index({ customer_id: 1 });

module.exports = mongoose.model('Customer', customerSchema, 'customers'); 