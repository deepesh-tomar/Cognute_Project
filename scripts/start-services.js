const { spawn } = require('child_process');
const path = require('path');
const http = require('http');

// Function to check if a port is in use
function isPortInUse(port) {
    return new Promise((resolve) => {
        const server = http.createServer()
            .once('error', () => resolve(true))
            .once('listening', () => {
                server.close();
                resolve(false);
            })
            .listen(port);
    });
}

async function startServices() {
    try {
        // Check if ports are available
        const [pythonPortInUse, nodePortInUse] = await Promise.all([
            isPortInUse(5001),
            isPortInUse(3000)
        ]);

        if (pythonPortInUse) {
            console.error('Error: Port 5001 is already in use. Please free up this port.');
            process.exit(1);
        }

        if (nodePortInUse) {
            console.error('Error: Port 3000 is already in use. Please free up this port.');
            process.exit(1);
        }

        console.log('Starting Python ML service...');
        const pythonService = spawn('python', [path.join(__dirname, '../ml/prediction_service.py')], {
            stdio: 'inherit'  // This will show Python output directly in the console
        });

        pythonService.on('error', (err) => {
            console.error('Failed to start Python service:', err);
            process.exit(1);
        });

        // Wait a bit for Python service to start
        await new Promise(resolve => setTimeout(resolve, 2000));

        console.log('Starting Node.js API server...');
        const nodeService = spawn('node', [path.join(__dirname, '../server.js')], {
            stdio: 'inherit'  // This will show Node.js output directly in the console
        });

        nodeService.on('error', (err) => {
            console.error('Failed to start Node.js service:', err);
            pythonService.kill();
            process.exit(1);
        });

        // Handle process termination
        process.on('SIGINT', () => {
            console.log('Shutting down services...');
            pythonService.kill();
            nodeService.kill();
            process.exit();
        });

        // Check if services are running
        setTimeout(async () => {
            try {
                const response = await fetch('http://localhost:3000/api/customers/1');
                if (response.ok) {
                    console.log('\n✅ Services are running successfully!');
                    console.log('You can access the test page at: http://localhost:3000/test-prediction.html');
                }
            } catch (error) {
                console.error('\n❌ Services failed to start properly. Check the error messages above.');
            }
        }, 5000);

    } catch (error) {
        console.error('Error starting services:', error);
        process.exit(1);
    }
}

startServices(); 