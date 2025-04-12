import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

const Groups = () => {
  const [groupName, setGroupName] = useState("");
  const [groups, setGroups] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const validateTokenAndFetchGroups = async () => {
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
          return;
        }

        // fetch groups after validating token
        const res = await axios.get("http://localhost:3000/api/groups", {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log(res.data)
        setGroups(res.data);
      } catch (error) {
        console.error("Error during token validation or fetching groups", error);
        localStorage.removeItem("token");
        navigate("/login");
      }
    };

    validateTokenAndFetchGroups();
  }, [navigate]);

  const handleCreateGroup = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        "http://localhost:3000/api/groups",
        { name: groupName },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setGroups([...groups, res.data]);
      setGroupName("");
    } catch (err) {
      console.error("Error creating group:", err);
    }
  };

  const goToGroup = (groupId) => {
    navigate(`/groups/${groupId}`);
  };

  return (
    <div>
      <h2>Create a Group</h2>
      <input
        type="text"
        placeholder="Group name"
        value={groupName}
        onChange={(e) => setGroupName(e.target.value)}
      />
      <button onClick={handleCreateGroup}>Create</button>

      <div>
        <h3>Your Groups</h3>
        <ul>
          {groups.map((group) => (
            <li key={group._id} onClick={() => goToGroup(group._id)}>
              {group.groupName}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Groups;
