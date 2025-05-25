# SplitEase2

**SplitEase2** is a full-stack web application designed to simplify group expense tracking and settlement. Whether you're managing trip expenses, shared household costs, or any group-related finances, SplitEase2 provides an intuitive platform to keep everything organized.

## 🌐 Live Demo

Experience the application live: [https://splitease2-1-qxag.onrender.com/](https://splitease2-1-qxag.onrender.com/)

## 📸 Screenshots

*Include relevant screenshots here to showcase the application's interface and features.*

## 🚀 Features

- **User Authentication**: Secure sign-up and login functionalities to protect user data.
- **Group Management**: Create and manage groups with unique join codes for collaborative expense tracking.
- **Expense Tracking**: Add, edit, and categorize expenses within groups for clear financial oversight.
- **Settlement Calculations**: Automated calculations to determine who owes whom, simplifying the settlement process.
- **Responsive Design**: Optimized for various devices, ensuring a seamless experience on desktops, tablets, and mobile phones.

## 🛠️ Tech Stack

- **Frontend**: React.js
- **Backend**: Node.js, Express.js
- **Database**: MongoDB
- **Authentication**: JWT (JSON Web Tokens)
- **Deployment**: Render

## 📂 Project Structure

\`\`\`
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
\`\`\`

## 🧰 Prerequisites

Ensure you have the following installed:

- [Node.js](https://nodejs.org/)
- [MongoDB](https://www.mongodb.com/)

## ⚙️ Installation

1. **Clone the repository:**

   \`\`\`bash
   git clone https://github.com/relan1997/SplitEase2.git
   cd SplitEase2
   \`\`\`

2. **Set up the backend:**

   \`\`\`bash
   cd backend
   npm install
   \`\`\`

3. **Set up the frontend:**

   \`\`\`bash
   cd ../frontend
   npm install
   \`\`\`

## 🧪 Running the Application Locally

1. **Start the backend server:**

   \`\`\`bash
   cd backend
   npm start
   \`\`\`

2. **Start the frontend development server:**

   \`\`\`bash
   cd ../frontend
   npm start
   \`\`\`

3. **Access the application:**

   Open your browser and navigate to \`http://localhost:3000\`.

## 🛡️ Environment Variables

Create a \`.env\` file in the \`backend\` directory and add the following:

\`\`\`
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
\`\`\`

Replace \`your_mongodb_connection_string\` and \`your_jwt_secret_key\` with your actual MongoDB URI and a secret key for JWT.

## 🧾 API Endpoints

- **Authentication:**
  - \`POST /api/auth/register\` – Register a new user.
  - \`POST /api/auth/login\` – Login with existing credentials.
- **Groups:**
  - \`POST /api/groups\` – Create a new group.
  - \`GET /api/groups\` – Retrieve all groups for the authenticated user.
  - \`GET /api/groups/:id\` – Retrieve a specific group by ID.
  - \`PUT /api/groups/:id\` – Update group details.
  - \`DELETE /api/groups/:id\` – Delete a group.
- **Expenses:**
  - \`POST /api/groups/:groupId/expenses\` – Add a new expense to a group.
  - \`GET /api/groups/:groupId/expenses\` – Retrieve all expenses for a group.
  - \`PUT /api/expenses/:id\` – Update an expense.
  - \`DELETE /api/expenses/:id\` – Delete an expense.


## 📄 License

This project is licensed under the [MIT License](LICENSE).
EOF
