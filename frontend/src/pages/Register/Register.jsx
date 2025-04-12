import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const Register = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate(); // 🔥 for redirection

  const handleRegister = () => {
    if (!username || !email || !password) {
      alert("Please fill in all fields.");
      return;
    }

    axios
      .post("http://localhost:3000/api/register", {
        username,
        email,
        password,
      })
      .then((res) => {
        console.log("Registration response:", res.data);
        alert("User registered successfully!");
        localStorage.setItem("token", res.data.token); // ✅ Save token
        navigate("/"); // 🔁 Redirect to home after register
      })
      .catch((err) => {
        console.error("Registration error:", err);
        alert(
          err.response?.data?.error || "Registration failed. Try again later."
        );
      });
  };

  return (
    <div>
      <h1>Register</h1>
      <input
        placeholder="Username"
        type="text"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <br />
      <input
        placeholder="Email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <br />
      <input
        placeholder="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <br />
      <button onClick={handleRegister}>Register</button>
      <br />
      <Link to="/login">Login</Link>
    </div>
  );
};

export default Register;
