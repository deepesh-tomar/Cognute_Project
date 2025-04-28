const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');

class MLService {
    constructor() {
        this.pythonServiceUrl = null;
        this.portFile = path.join(__dirname, '../ml/.python_service_port');
    }

    async initialize() {
        try {
            // Read the port from the file
            const port = await this.getPythonServicePort();
            this.pythonServiceUrl = `http://localhost:${port}`;
            console.log(`Python service URL: ${this.pythonServiceUrl}`);
        } catch (error) {
            console.error('Error initializing ML service:', error);
            throw error;
        }
    }

    async getPythonServicePort() {
        try {
            const data = await fs.readFile(this.portFile, 'utf8');
            return parseInt(data.trim());
        } catch (error) {
            console.error('Error reading Python service port:', error);
            throw new Error('Python service port not found. Make sure the Python service is running.');
        }
    }

    async predict(customerData) {
        if (!this.pythonServiceUrl) {
            await this.initialize();
        }

        try {
            const response = await axios.post(`${this.pythonServiceUrl}/predict`, {
                customerData
            });

            if (response.data.error) {
                throw new Error(response.data.error);
            }

            return response.data;
        } catch (error) {
            console.error('Prediction error:', error.message);
            throw error;
        }
    }
}

module.exports = new MLService(); 