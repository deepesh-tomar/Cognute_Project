# User Authentication API Application

A simple API application with user authentication featuring:
- User registration
- User login
- Profile viewing
- MongoDB database storage

## Technologies Used
- Node.js
- Express.js
- MongoDB Atlas
- JWT for authentication
- bcrypt for password hashing
- Frontend with HTML, CSS, and JavaScript

## Setup

### Prerequisites
- Node.js installed on your machine
- MongoDB Atlas account (free tier available)

### MongoDB Atlas Setup
1. Create a free MongoDB Atlas account at [https://www.mongodb.com/cloud/atlas/register](https://www.mongodb.com/cloud/atlas/register)
2. Create a new cluster (the free tier is sufficient)
3. In the Security section, create a database user with read and write permissions
4. In the Network Access section, allow access from your IP address or from everywhere (for testing)
5. In the Database section, click "Connect" on your cluster, select "Connect your application", and copy the connection string

### Installation

1. Clone the repository
```
git clone <repository-url>
cd <repository-directory>
```

2. Install dependencies
```
npm install
```

3. Update the `.env` file in the root directory with your MongoDB Atlas connection string:
```
PORT=3000
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-name>.mongodb.net/user_auth_db?retryWrites=true&w=majority
JWT_SECRET=your_secret_key_here
```

Replace:
- `<username>` with your MongoDB Atlas database username
- `<password>` with your MongoDB Atlas database password
- `<cluster-name>` with your MongoDB Atlas cluster name
- `your_secret_key_here` with a strong secret key for JWT

### Running the Application

1. Start the development server:
```
npm run dev
```

2. Open your browser and navigate to:
```
http://localhost:3000
```

## API Endpoints

- `POST /api/users` - Register a new user
- `POST /api/users/login` - Login a user
- `GET /api/users/profile` - Get user profile (requires authentication)

## Troubleshooting

If you encounter a 403 Forbidden error:
1. Check that your MongoDB Atlas connection string is correct
2. Ensure your MongoDB Atlas IP whitelist includes your current IP address
3. Verify that the database user has the correct permissions

## License

This project is licensed under the ISC License. 