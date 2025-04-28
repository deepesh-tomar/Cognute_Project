require('dotenv').config();
const mongoose = require('mongoose');
const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');
const Customer = require('../models/customerModel');

const csvFilePath = path.join(__dirname, '../../10000_loan_dataset_Apr24_v1.csv');
// Use the user_auth_db database explicitly
const mongoURI = 'mongodb+srv://Deepesh:Deepesh%40123@cluster0.0igal.mongodb.net/user_auth_db?retryWrites=true&w=majority';

function parseValue(key, value) {
    if (key === 'customer_id') {
        return parseInt(value.replace(/^C/, ''));
    }
    if (value === '') {
        return undefined; // leave empty fields as undefined
    }
    if (value === 'True') {
        return true;
    }
    if (value === 'False') {
        return false;
    }
    if (!isNaN(value) && value.trim() !== '') {
        // Check for numbers (int or float)
        return value.indexOf('.') !== -1 ? parseFloat(value) : parseInt(value);
    }
    return value;
}

async function importCustomers() {
    await mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Connected to MongoDB');

    // Remove all existing customers
    await Customer.deleteMany({});
    console.log('Cleared existing customers');

    const customers = [];
    let headers = null;
    let imported = 0;
    let failed = 0;

    fs.createReadStream(csvFilePath)
        .pipe(csv())
        .on('headers', (h) => {
            headers = h;
        })
        .on('data', (row) => {
            if (!headers) return;
            const customer = {};
            for (const key of headers) {
                const parsed = parseValue(key, row[key]);
                if (parsed !== undefined) {
                    customer[key] = parsed;
                }
            }
            if (customer.customer_id) {
                customers.push(customer);
            }
        })
        .on('end', async () => {
            for (const customer of customers) {
                try {
                    await Customer.create(customer);
                    imported++;
                } catch (err) {
                    failed++;
                }
            }
            console.log(`Import completed. Imported: ${imported}, Failed: ${failed}`);
            await mongoose.disconnect();
            process.exit(0);
        });
}

importCustomers().catch(err => {
    console.error('Error importing customers:', err);
    process.exit(1);
}); 