import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = () => {
    if (!email || !password) {
      alert("Please fill in all fields.");
      return;
    }

    axios
      .post("http://localhost:3000/api/login", { email, password })
      .then((res) => {
        const { token } = res.data;
        localStorage.setItem("token", token); // store token
        navigate("/");
      })
      .catch((err) => {
        console.error("Login error:", err);
        alert("Invalid credentials");
      });
  };

  return (
    <div>
      <h1>Login</h1>
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
      <button onClick={handleLogin}>Login</button>
      <br />
      <Link to="/register">Register</Link>
    </div>
  );
};

export default Login;
