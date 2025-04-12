import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // <-- for redirect
import { jwtDecode } from "jwt-decode";
const Expense = () => {
  const [formData, setFormData] = useState({
    amount: "",
    category: "",
    message: "",
  });
  const [errors, setErrors] = useState({});
  const [expenses, setExpenses] = useState([]);
  const navigate = useNavigate(); // <-- init navigate
  const categories = [
    "Housing",
    "Transportation",
    "Food",
    "Health",
    "Entertainment",
    "Personal",
    "Debt & Finances",
    "Shopping",
    "Miscellaneous",
  ];
  const [user, setUser] = useState(null);
  useEffect(() => {
    const token = localStorage.getItem("token");
    console.log(token)
    if (token) {
      try {
        const decoded = jwtDecode(token);
        console.log("Decoded token:", decoded);
        setUser({ username: decoded.username, email: decoded.email }); // <--- set user info
      } catch (err) {
        console.error("Invalid token");
        navigate("/login");
      }
    }
    fetchExpenses();
  }, []);
  const fetchExpenses = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:3000/api/expense", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.status === 401) {
        alert("Session expired. Please log in again.");
        localStorage.removeItem("token");
        navigate("/login"); // <-- redirect to login
        return;
      }
      const data = await res.json();
      setExpenses(data);
    } catch (err) {
      console.error("Fetch error:", err.message);
    }
  };
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  const validate = () => {
    const newErrors = {};
    if (!formData.amount) {
      newErrors.amount = "Amount is required";
    } else if (isNaN(formData.amount)) {
      newErrors.amount = "Amount must be a number";
    } else if (+formData.amount <= 0) {
      newErrors.amount = "Amount must be greater than zero";
    } else if (+formData.amount > 1e9) {
      newErrors.amount = "Amount must be less than or equal to 1e9";
    }
    if (!formData.category) {
      newErrors.category = "Category is required";
    }
    return newErrors;
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:3000/api/expense", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.status === 401) {
        alert("Session expired. Please log in again.");
        localStorage.removeItem("token");
        navigate("/login");
        return;
      }
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to add expense");
      }
      alert("Expense added successfully!");
      setFormData({ amount: "", category: "", message: "" });
      setErrors({});
      fetchExpenses();
    } catch (error) {
      alert("Error: " + error.message);
    }
  };
  return (
    <>
      {user && (
        <div>
          <h2>Welcome, {user.username}</h2>
          <p>Email: {user.email}</p>
        </div>
      )}
  
      <form onSubmit={handleSubmit}>
        <div>
          <label>Amount</label>
          <input
            type="number"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
          />
          {errors.amount && <div style={{ color: "red" }}>{errors.amount}</div>}
        </div>
  
        <div>
          <label>Category</label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
          >
            <option value="">Select a category</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
          {errors.category && (
            <div style={{ color: "red" }}>{errors.category}</div>
          )}
        </div>
  
        <div>
          <label>Message</label>
          <textarea
            name="message"
            value={formData.message}
            onChange={handleChange}
            rows="3"
          />
        </div>
  
        <button type="submit">Submit</button>
      </form>
  
      <hr />
  
      <h2>Your Expenses</h2>
<ul>
  {expenses.length > 0 ? (
    expenses.map((expense) => {
      const date = new Date(expense.createdAt);
      const formattedDate = date.toLocaleString(); // or use toLocaleDateString() for just the date

      return (
        <li key={expense._id}>
          <strong>₹{expense.amount}</strong> - {expense.category}
          {expense.message && ` (${expense.message})`} <br />
          <small style={{ color: "gray" }}>on {formattedDate}</small>
        </li>
      );
    })
  ) : (
    <li>No expenses found.</li>
  )}
</ul>
    </>
  );  
};

export default Expense;
 // Logo | Category name
//  Amount
// Date and Time Created
// drop down to see the text