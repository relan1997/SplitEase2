import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import axios from "axios";

const Results = () => {
  const navigate = useNavigate();
  const { groupId } = useParams();

  const [transactions, setTransactions] = useState([]);
  const [groupName, setGroupName] = useState("");
  const [loading, setLoading] = useState(true);

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
        return;
      }
    } catch (error) {
      console.error("Invalid token", error);
      navigate("/login");
      return;
    }

    const fetchGroupResults = async () => {
      try {
        const response = await axios.get(`http://localhost:3000/api/groups/${groupId}/res_transactions`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const group = response.data;
        console.log("Resultant transactions:", group);
        setGroupName(group.groupName || "Unnamed Group");
        setTransactions(group.transactions || []);
      } catch (err) {
        console.error("Error fetching group data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchGroupResults();
  }, [navigate, groupId]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h2>Results for Group: {groupName}</h2>
      {transactions.length === 0 ? (
        <p>No resultant transactions found.</p>
      ) : (
        <ul>
          {transactions.map((txn, index) => (
            <li key={index}>
              {txn.from} pays {txn.to} ₹{txn.amount.toFixed(2)}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Results;
