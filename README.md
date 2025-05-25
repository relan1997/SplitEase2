# SplitEase2

**SplitEase2** is a full-stack web application designed to simplify group expense tracking and settlement. Whether you're managing trip expenses, shared household costs, or any group-related finances, SplitEase2 provides an intuitive platform to keep everything organized.

## 🌐 Live Demo

Experience the application live: [https://splitease2-1-qxag.onrender.com/](https://splitease2-1-qxag.onrender.com/)

## 🚀 Features

- **User Authentication**: Secure sign-up and login functionalities to protect user data
- **Group Management**: Create and manage groups with unique join codes for collaborative expense tracking
- **Expense Tracking**: Add, edit, and categorize expenses within groups for clear financial oversight
- **Settlement Calculations**: Automated calculations to determine who owes whom, simplifying the settlement process
- **Responsive Design**: Optimized for various devices, ensuring a seamless experience on desktops, tablets, and mobile phones

## 🛠️ Tech Stack

- **Frontend**: React.js
- **Backend**: Node.js, Express.js
- **Database**: MongoDB
- **Authentication**: JWT (JSON Web Tokens)
- **Deployment**: Render

## 📂 Project Structure

```
SplitEase2/
├── backend/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   └── server.js
├── frontend/
│   ├── public/
│   └── src/
│       ├── components/
│       ├── pages/
│       ├── services/
│       └── App.js
├── .gitignore
├── package.json
└── README.md
```

## 🧰 Prerequisites

Ensure you have the following installed:

- [Node.js](https://nodejs.org/) (v14 or higher)
- [MongoDB](https://www.mongodb.com/) (local installation or MongoDB Atlas)
- [Git](https://git-scm.com/)

## ⚙️ Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/relan1997/SplitEase2.git
   cd SplitEase2
   ```

2. **Set up the backend:**

   ```bash
   cd backend
   npm install
   ```

3. **Set up the frontend:**

   ```bash
   cd ../frontend
   npm install
   ```

## 🔧 Environment Configuration

Create a `.env` file in the `backend` directory and add the following:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
NODE_ENV=development
```

Replace `your_mongodb_connection_string` and `your_jwt_secret_key` with your actual values:
- For local MongoDB: `mongodb://localhost:27017/splitease2`
- For MongoDB Atlas: Use your cluster connection string
- Generate a secure JWT secret (32+ characters recommended)

## 🚀 Running the Application

### Development Mode

1. **Start the backend server:**

   ```bash
   cd backend
   npm run dev
   ```
   
   The backend will run on `http://localhost:5000`

2. **Start the frontend development server:**

   ```bash
   cd frontend
   npm start
   ```
   
   The frontend will run on `http://localhost:3000`

3. **Access the application:**

   Open your browser and navigate to `http://localhost:3000`

### Production Mode

1. **Build the frontend:**

   ```bash
   cd frontend
   npm run build
   ```

2. **Start the production server:**

   ```bash
   cd backend
   npm start
   ```

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` – Register a new user
- `POST /api/auth/login` – Login with existing credentials
- `POST /api/auth/logout` – Logout user
- `GET /api/auth/me` – Get current user profile

### Groups
- `POST /api/groups` – Create a new group
- `GET /api/groups` – Retrieve all groups for the authenticated user
- `GET /api/groups/:id` – Retrieve a specific group by ID
- `PUT /api/groups/:id` – Update group details
- `DELETE /api/groups/:id` – Delete a group
- `POST /api/groups/:id/join` – Join a group using join code

### Expenses
- `POST /api/groups/:groupId/expenses` – Add a new expense to a group
- `GET /api/groups/:groupId/expenses` – Retrieve all expenses for a group
- `PUT /api/expenses/:id` – Update an expense
- `DELETE /api/expenses/:id` – Delete an expense
- `GET /api/groups/:groupId/settlements` – Get settlement calculations for a group

## 🎯 Usage

1. **Create an Account**: Sign up with your email and password
2. **Create or Join Groups**: Start a new group or join existing ones using join codes
3. **Add Expenses**: Record shared expenses with details like amount, description, and participants
4. **Track Settlements**: View automated calculations showing who owes whom
5. **Settle Up**: Mark settlements as complete when payments are made

## 🧪 Testing

Run tests for both frontend and backend:

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

## 🚢 Deployment

The application is configured for deployment on Render. For other platforms:

1. Build the frontend: `npm run build` in the frontend directory
2. Set environment variables on your hosting platform
3. Deploy the backend with the built frontend assets

## 🐛 Troubleshooting

**Common Issues:**

- **MongoDB Connection Error**: Ensure MongoDB is running and the connection string is correct
- **Port Already in Use**: Change the PORT in your `.env` file or kill the process using the port
- **JWT Authentication Fails**: Verify your JWT_SECRET is set correctly
- **CORS Issues**: Check that frontend and backend URLs match your configuration

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch:**
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Make your changes and commit:**
   ```bash
   git commit -m 'Add: your feature description'
   ```
4. **Push to your branch:**
   ```bash
   git push origin feature/your-feature-name
   ```
5. **Open a Pull Request**

### Development Guidelines

- Follow the existing code style and conventions
- Write clear commit messages
- Add tests for new features
- Update documentation as needed
- Ensure all tests pass before submitting

## 📄 License

This project is licensed under the [MIT License](LICENSE).

**Made with ❤️ for easier expense sharing**
