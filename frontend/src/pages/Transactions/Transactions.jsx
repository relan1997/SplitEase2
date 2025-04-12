import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import axios from "axios";

const Transactions = ({ groupId }) => {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [members, setMembers] = useState([]);
  const [from, setFrom] = useState("");
  const [isValid, setIsValid] = useState(null); // null | true | false
  const [selectedToIds, setSelectedToIds] = useState([]);
  const [amount, setAmount] = useState("");
  const checkUsername = () => {
    if (!from.trim()) {
      setIsValid(null);
      return;
    }
    const found = members.find((m) => m.username === from.trim());
    setIsValid(!!found);
  };
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return navigate("/login");
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
    const headers = { Authorization: `Bearer ${token}` };
    console.log(token);
    const fetchTransactions = async () => {
      try {
        const res = await axios.get(
          `http://localhost:3000/api/groups/${groupId}/transactions`,
          {
            headers,
          }
        );
        setTransactions(Array.isArray(res.data) ? res.data : []);
      } catch (error) {
        console.error("Error fetching transactions:", error);
        setTransactions([]);
      }
    };
    const fetchMembers = async () => {
      try {
        const res = await axios.get(
          `http://localhost:3000/api/groups/${groupId}/members`
        );
        setMembers(res.data);
        console.log(res.data);
      } catch (err) {
        console.error("Error fetching members:", err);
        setMembers([]);
      }
    };
    fetchTransactions();
    fetchMembers();
  }, [navigate, groupId]);
  const handleCheckboxChange = (memberId) => {
    setSelectedToIds((prev) =>
      prev.includes(memberId)
        ? prev.filter((id) => id !== memberId)
        : [...prev, memberId]
    );
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!from || !isValid || selectedToIds.length === 0 || !amount) {
      alert("Please enter a valid username and select recipients.");
      return;
    }
    const fromUser = members.find((m) => m.username === from);
    if (!fromUser) {
      alert("This user is not a member of the group.");
      return;
    }
    const allInvolvedIds = [...new Set(selectedToIds)];

    if (allInvolvedIds.includes(fromUser._id)) {
      const splitCount = allInvolvedIds.length;
      var share = amount / splitCount;
    } else {
      var share = amount / allInvolvedIds.length;
    }
    const token = localStorage.getItem("token");
    try {
      const newTransactions = await Promise.all(
        allInvolvedIds
          .filter((toId) => toId !== fromUser._id) // skip self-transactions
          .map(async (toId) => {
            const res = await axios.post(
              `http://localhost:3000/api/groups/${groupId}/transactions`,
              {
                from: fromUser._id,
                to: toId,
                amount: share.toFixed(2),
              },
              {
                headers: { Authorization: `Bearer ${token}` },
              }
            );
            return res.data;
          })
      );
      setTransactions((prev) => [...prev, ...newTransactions]);
      setFrom("");
      setIsValid(null);
      setSelectedToIds([]);
      setAmount("");
    } catch (error) {
      console.error("Error submitting transactions:", error);
    }
  };
  const handleDelete = async (transactionId) => {
    const token = localStorage.getItem("token");
    try {
      await axios.delete(
        `http://localhost:3000/api/groups/${groupId}/transactions/${transactionId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setTransactions((prev) => prev.filter((tx) => tx._id !== transactionId));
    } catch (error) {
      console.error("Error deleting transaction:", error);
    }
  };

  const handleSendResults = async () => {
    const token = localStorage.getItem("token");
    try {
      console.log(transactions);
      const res = await axios.post(
        `http://localhost:3000/api/groups/${groupId}/results`,
        {
          names: members.map((m) => m.username),
          transactions,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      alert("Results successfully sent!");
      console.log("Result Response:", res.data);
      navigate(`/groups/${groupId}/results`); 
    } catch (error) {
      console.error("Error sending results:", error);
      alert("Failed to send results.");
    }
  };

  return (
    <div>
      <h2>Transactions</h2>
      {members.length > 0 ? (
        <form onSubmit={handleSubmit}>
          <div>
            <label>From Username: </label>
            <input
              type="text"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              onBlur={checkUsername}
              required
            />
            {isValid === true && (
              <span style={{ color: "green" }}>✔ Valid user</span>
            )}
            {isValid === false && (
              <span style={{ color: "red" }}>✘ Invalid user</span>
            )}
          </div>
          <div>
            <label>Select Members Involved:</label>
            <ul>
              {members.map((member) => (
                <li key={member._id}>
                  <label>
                    <input
                      type="checkbox"
                      value={member._id}
                      checked={selectedToIds.includes(member._id)}
                      onChange={() => handleCheckboxChange(member._id)}
                    />
                    {member.username}
                  </label>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <label>Total Amount: </label>
            <input
              type="number"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>

          <button type="submit" disabled={!isValid}>
            Split and Save
          </button>
        </form>
      ) : (
        <p>No members in this group.</p>
      )}
      <ul>
        {transactions.map((tx) => (
          <li key={tx._id}>
            {tx.from?.username || "Unknown"} paid {tx.to?.username || "Unknown"}{" "}
            ${tx.amount}
            <button
              onClick={() => handleDelete(tx._id)}
              style={{ marginLeft: "10px", color: "red" }}
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
      <button onClick={handleSendResults} style={{ marginTop: "20px" }}>
        Send All Transactions to Result Endpoint
      </button>
    </div>
  );
};
export default Transactions;
