const mongoose = require('mongoose');

const CustomerSchema = new mongoose.Schema({
  customer_id: {
    type: Number,
    required: true,
    unique: true
  },
  age: Number,
  number_of_references: Number,
  salary_net_income: Number,
  salary_frequency: String,
  self_employed_net_income: Number,
  social_security_income: Number,
  months_at_job: Number,
  total_exp_months: Number,
  ever_bankrupt: Boolean,
  current_bankruptcy_status: Boolean,
  loan_id: Number,
  loan_amount: Number,
  interest_rate: Number,
  fee: Number,
  tenure: Number,
  tenure_type: String,
  recurring_payment_amount: Number,
  total_due: Number,
  loan_status: String,
  current_due: Number,
  past_due_amount: Number,
  past_due_days: Number,
  last_payment_amount: Number,
  num_days_since_last_payment: Number,
  ever_delinquent: Boolean,
  ever_default: Boolean,
  past_delinquencies: Number,
  num_missed_payments: Number,
  num_payments_ontime: Number,
  past_collection_success: Boolean,
  past_collection_amount: Number,
  past_total_due_amount_for_collection: Number,
  credit_score: Number,
  refinance: Boolean,
  extended_payment_plan: Boolean,
  settlement_plans_with_waive_off: Boolean,
  is_option_accepted: Boolean,
  accepted_option: String,
  promised_to_pay: String,
  promised_to_pay_status: String
}, {
  timestamps: true
});

// Create index for faster search
CustomerSchema.index({ customer_id: 1 });

module.exports = mongoose.model('Customer', CustomerSchema); 