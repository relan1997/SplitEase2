import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import axios from "axios";

const Names = ({ groupId }) => {
  const navigate = useNavigate();
  //const { id: groupId } = useParams(); // get group ID from URL
  const [username, setUsername] = useState("");
  const [isValid, setIsValid] = useState(null);
  const [members, setMembers] = useState([]);
  const [showEmailInput, setShowEmailInput] = useState(false);
  const [email, setEmail] = useState("");
  const [isEmailValid, setIsEmailValid] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }
    try {
      const { exp } = jwtDecode(token);
      if (Date.now() >= exp * 1000) {
        localStorage.removeItem("token");
        navigate("/login");
      }
    } catch (error) {
      console.error("Invalid token", error);
      navigate("/login");
    }

    fetchMembers();
  }, [navigate, groupId]);

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  };
  

  const checkUsername = async () => {
    if (!username.trim()) return;
  
    const token = localStorage.getItem("token");
  
    try {
      const res = await axios.get(
        `http://localhost:3000/api/user-exists?username=${username}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setIsValid(res.data.exists);
      if (res.data.exists) {
        setShowEmailInput(false); // Hide invite section if username becomes valid
      }
    } catch (err) {
      console.error("Username check failed:", err);
      setIsValid(false);
    }
  };
  
  const handleInviteClick = () => {
    setShowEmailInput(true);
  };

  const handleEmailChange = (e) => {
    const newEmail = e.target.value;
    setEmail(newEmail);
    setIsEmailValid(validateEmail(newEmail));
  };
  

  const handleChange = (e) => {
    setUsername(e.target.value);
    setIsValid(null);
  };

  const handleAddMember = async () => {
    if (!isValid) {
      alert("Username is invalid.");
      return;
    }

    const token = localStorage.getItem("token");

    try {
      const res = await axios.post(
        `http://localhost:3000/api/groups/${groupId}/members`,
        { username },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert("Member added!");
      window.location.href = `/groups/${groupId}`; // full page reload
    } catch (err) {
      console.error("Error adding member:", err);
      alert("Failed to add member.");
    }
  };

  const fetchMembers = async () => {
    try {
      const res = await axios.get(
        `http://localhost:3000/api/groups/${groupId}/members`
      );
      setMembers(res.data);
    } catch (err) {
      console.error("Error fetching members:", err);
      setMembers([]);
    }
  };

  const inputStyle = () => {
    if (isValid === null) return {};
    return {
      border: `2px solid ${isValid ? "green" : "red"}`,
      outline: "none",
    };
  };

  return (
    <div style={{ padding: "1rem" }}>
      <h2>Add Member to Group</h2>
      <input
        type="text"
        value={username}
        onChange={handleChange}
        onBlur={checkUsername}
        style={inputStyle()}
        required
        placeholder="Enter username"
      />
      <button onClick={handleAddMember} disabled={!isValid}>
        Add Member
      </button>
  
      {/* Invite button (only shows if username is invalid and email input not shown) */}
      {isValid === false && !showEmailInput && (
        <button onClick={handleInviteClick} style={{ marginLeft: "0.5rem" }}>
          Invite
        </button>
      )}
  
      {/* Email input & Send Invite button */}
      {showEmailInput && (
        <div style={{ marginTop: "1rem" }}>
          <input
            type="email"
            value={email}
            onChange={handleEmailChange}
            placeholder="Enter email to invite"
            style={{
              border: `2px solid ${isEmailValid ? "green" : "red"}`,
              outline: "none",
              marginRight: "0.5rem",
            }}
          />
          <button disabled={!isEmailValid}>
            Send Invite
          </button>
        </div>
      )}
  
      <h3 style={{ marginTop: "2rem" }}>Group Members</h3>
      <ul>
        {members.map((member) => (
          <li key={member._id}>{member.username}</li>
        ))}
      </ul>
    </div>
  );
  
};

export default Names;
