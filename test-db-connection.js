const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load env vars
dotenv.config();

const testConnection = async () => {
  try {
    console.log('Attempting to connect to MongoDB with URI:', 
      process.env.MONGODB_URI.replace(/:([^:@]+)@/, ':****@')); // Hide password in logs
    
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    console.log('Connection successful!');
    
    // Create a test document to verify write access
    const TestModel = mongoose.model('Test', new mongoose.Schema({ 
      name: String, 
      date: { type: Date, default: Date.now } 
    }));
    
    const testDoc = await TestModel.create({ name: 'Connection Test' });
    console.log(`Test document created with ID: ${testDoc._id}`);
    
    // Clean up - delete the test document
    await TestModel.deleteOne({ _id: testDoc._id });
    console.log('Test document deleted');
    
    // Close the connection
    await mongoose.connection.close();
    console.log('Connection closed');
    
    return true;
  } catch (error) {
    console.error('MongoDB Connection Error:');
    console.error(error.message);
    
    if (error.message.includes('ENOTFOUND')) {
      console.log('\nPossible solution: Check that your cluster name in the MongoDB URI is correct');
    } else if (error.message.includes('Authentication failed')) {
      console.log('\nPossible solution: Verify your username and password in the MongoDB URI');
    } else if (error.message.includes('timed out')) {
      console.log('\nPossible solution: Check your network connection or MongoDB Atlas IP whitelist settings');
    }
    
    return false;
  }
};

// Run the test
testConnection().then((success) => {
  if (success) {
    console.log('\nYour MongoDB connection is working correctly!');
  } else {
    console.log('\nFailed to connect to MongoDB. Please check your configuration.');
  }
  process.exit(0);
}); 