import React, { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";

const Home = () => {
  const [user, setUser] = useState(null);
  const [isCheckingToken, setIsCheckingToken] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        const currentTime = Date.now() / 1000;
        if (decoded.exp && decoded.exp < currentTime) {
          console.warn("Token has expired");
          setUser(null);
        } else {
          setUser(decoded);
        }
      } catch (err) {
        console.error("Invalid token:", err);
        setUser(null);
      }
    }
    setIsCheckingToken(false);
  }, []);

  if (isCheckingToken) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      {user ? (
        <>
          <h1>Welcome {user.username}</h1>
          <p>Email: {user.email}</p>
        </>
      ) : (
        <h1>Welcome to Splitease</h1>
      )}
    </div>
  );
};

export default Home;
