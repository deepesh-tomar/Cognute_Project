const fs = require('fs');
const csv = require('csv-parser');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Customer = require('../models/Customer');

// Load environment variables
dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('MongoDB connected');
    importData();
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Function to parse boolean values from string
const parseBoolean = (value) => {
  return value.toLowerCase() === 'true';
};

// Function to parse numeric values
const parseNumber = (value) => {
  if (value === '' || value === undefined || value === null) {
    return 0;
  }
  return parseFloat(value);
};

// Function to import data
const importData = async () => {
  try {
    // Check if we already have data
    const count = await Customer.countDocuments();
    if (count > 0) {
      console.log(`Database already has ${count} customer records.`);
      const continueImport = process.argv.includes('--force');
      if (!continueImport) {
        console.log('Use --force flag to reimport data');
        process.exit(0);
      }
      console.log('Force flag detected. Clearing existing data...');
      await Customer.deleteMany({});
    }

    const customers = [];
    
    // Read the CSV file
    fs.createReadStream('1000_loan_dataset_Mar20_v4.csv')
      .pipe(csv())
      .on('data', (row) => {
        // Transform data to match our schema
        const customer = {
          customer_id: parseNumber(row.customer_id),
          age: parseNumber(row.age),
          number_of_references: parseNumber(row.number_of_references),
          salary_net_income: parseNumber(row.salary_net_income),
          salary_frequency: row.salary_frequency,
          self_employed_net_income: parseNumber(row.self_employed_net_income),
          social_security_income: parseNumber(row.social_security_income),
          months_at_job: parseNumber(row.months_at_job),
          total_exp_months: parseNumber(row.total_exp_months),
          ever_bankrupt: parseBoolean(row.ever_bankrupt),
          current_bankruptcy_status: parseBoolean(row.current_bankruptcy_status),
          loan_id: parseNumber(row.loan_id),
          loan_amount: parseNumber(row.loan_amount),
          interest_rate: parseNumber(row.interest_rate),
          fee: parseNumber(row.fee),
          tenure: parseNumber(row.tenure),
          tenure_type: row.tenure_type,
          recurring_payment_amount: parseNumber(row.recurring_payment_amount),
          total_due: parseNumber(row.total_due),
          loan_status: row.loan_status,
          current_due: parseNumber(row.current_due),
          past_due_amount: parseNumber(row.past_due_amount),
          past_due_days: parseNumber(row.past_due_days),
          last_payment_amount: parseNumber(row.last_payment_amount),
          num_days_since_last_payment: parseNumber(row.num_days_since_last_payment),
          ever_delinquent: parseBoolean(row.ever_delinquent),
          ever_default: parseBoolean(row.ever_default),
          past_delinquencies: parseNumber(row.past_delinquencies),
          num_missed_payments: parseNumber(row.num_missed_payments),
          num_payments_ontime: parseNumber(row.num_payments_ontime),
          past_collection_success: parseBoolean(row.past_collection_success),
          past_collection_amount: parseNumber(row.past_collection_amount),
          past_total_due_amount_for_collection: parseNumber(row.past_total_due_amount_for_collection),
          credit_score: parseNumber(row.credit_score),
          refinance: parseBoolean(row.refinance),
          extended_payment_plan: parseBoolean(row.extended_payment_plan),
          settlement_plans_with_waive_off: parseBoolean(row.settlement_plans_with_waive_off),
          is_option_accepted: parseBoolean(row.is_option_accepted),
          accepted_option: row.accepted_option,
          promised_to_pay: row.promised_to_pay,
          promised_to_pay_status: row.promised_to_pay_status
        };
        
        customers.push(customer);
      })
      .on('end', async () => {
        console.log(`Parsed ${customers.length} customers from CSV`);
        
        // Import in batches to avoid overloading the database
        const batchSize = 100;
        for (let i = 0; i < customers.length; i += batchSize) {
          const batch = customers.slice(i, i + batchSize);
          await Customer.insertMany(batch, { ordered: false })
            .catch(err => {
              // Log errors but continue (some records might be duplicates)
              console.error(`Error in batch ${i/batchSize}:`, err.message);
            });
          console.log(`Imported batch ${i/batchSize + 1}/${Math.ceil(customers.length/batchSize)}`);
        }
        
        console.log('Import completed');
        process.exit(0);
      });
  } catch (error) {
    console.error('Import error:', error);
    process.exit(1);
  }
}; 