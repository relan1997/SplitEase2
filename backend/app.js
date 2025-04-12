import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import bcrypt from "bcrypt";
import userModel from "./models/userModel.js";
import jwt from "jsonwebtoken";
import { authenticateToken } from "./middleware/authMiddleware.js";
import Expense from "./models/expenseModel.js";
import transactionModel from "./models/transactionModel.js";
import groupModel from "./models/groupModel.js";
import { calculateNetBalances } from "./helpers/calculateNetBalances.js";
import { createFlowGraphMatrix } from "./helpers/createFlowGraphMatrix.js";
import { maxFlowAlgo } from "./helpers/maxFlowAlgo.js";
import transporter from "./utils/mailer.js";
const JWT_SECRET = "your-secret-key";
const app = express();
const PORT = 3000;
const SALT_ROUNDS = 10;

app.use(cors());
app.use(express.json());

mongoose
  .connect(
    "mongodb+srv://harshal:LtXwFJc0sH8O96GX@cluster0.u57rmde.mongodb.net/splitEase2?retryWrites=true&w=majority&appName=Cluster0"
  )
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

app.post("/api/register", async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ error: "Please fill in all fields." });
  }

  try {
    // Check if email or username already exists
    const existingEmail = await userModel.findOne({ email });
    const existingUsername = await userModel.findOne({ username });

    if (existingEmail) {
      return res.status(409).json({ error: "Email already exists." });
    }

    if (existingUsername) {
      return res.status(409).json({ error: "Username already exists." });
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    const newUser = new userModel({
      username,
      email,
      password: hashedPassword,
    });

    await newUser.save();

    const token = jwt.sign(
      {
        id: newUser._id.toString(),
        username: newUser.username,
        email: newUser.email,
      },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(201).json({
      message: "User registered successfully",
      token,
      user: {
        id: newUser._id.toString(),
        username: newUser.username,
        email: newUser.email,
      },
    });
  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).json({ error: "Internal server error." });
  }
});

app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Please fill in all fields." });
  }

  try {
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    const token = jwt.sign(
      {
        id: user._id.toString(),
        username: user.username,
        email: user.email,
      },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(200).json({
      message: "Login successful",
      token,
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Internal server error." });
  }
});

app.get("/api/expense", authenticateToken, async (req, res) => {
  try {
    const expenses = await Expense.find({ user: req.user.id }).sort({
      createdAt: -1,
    });
    res.status(200).json(expenses);
  } catch (err) {
    console.error("Error fetching expenses:", err);
    res.status(500).json({ error: "Failed to fetch expenses." });
  }
});

app.post("/api/expense", authenticateToken, async (req, res) => {
  const { amount, category, message } = req.body;

  if (!amount || !category) {
    return res.status(400).json({ error: "Amount and category are required." });
  }

  if (amount <= 0 || amount > 1e9) {
    return res.status(400).json({ error: "Amount must be between 1 and 1e9." });
  }

  try {
    const expense = new Expense({
      amount,
      category,
      message,
      user: req.user.id,
    });

    await expense.save();

    res.status(201).json({
      message: "Expense saved successfully",
      expense,
    });
  } catch (err) {
    console.error("Expense saving error:", err);
    res.status(500).json({ error: "Failed to save expense." });
  }
});

app.get("/api/user-exists", authenticateToken, async (req, res) => {
  const { username } = req.query;
  if (!username) {
    return res.status(400).json({ error: "Username is required." });
  }
  try {
    const user = await userModel.findOne({ username });
    res.json({ exists: !!user });
  } catch (error) {
    console.error("User check error:", error);
    res.status(500).json({ error: "Internal server error." });
  }
});

app.post("/api/groups/:id/transactions", async (req, res) => {
  const { id: groupId } = req.params;
  const { from, to, amount } = req.body;

  if (!from || !to || !amount) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    const transaction = new transactionModel({
      from,
      to,
      amount: parseFloat(amount),
      group: groupId,
    });

    await transaction.save();

    const savedTx = await transactionModel.findById(transaction._id)
      .populate("from", "username")
      .populate("to", "username");

    res.status(201).json(savedTx);
  } catch (err) {
    console.error("Error creating transaction:", err);
    res.status(500).json({ error: "Server error" });
  }
});



app.get("/api/groups/:id/transactions", authenticateToken, async (req, res) => {
  const { id } = req.params;
  if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
    return res.status(400).json({ error: "Invalid group ID format." });
  }
  try {
    const transactions = await transactionModel.find({ group: id })
      .populate("from", "username")
      .populate("to", "username")
      .sort({ createdAt: -1 });
    if (!transactions || transactions.length === 0) {
      console.log("No transactions found for this group.");
      //return empty array
      return res.status(200).json([]);
    }
    console.log(transactions)
    res.status(200).json(transactions);
  } catch (err) {
    console.error("Failed to fetch transactions:", err.message || err);
    res.status(500).json({ error: "Internal server error. Please try again later." });
  }
});


app.post("/api/groups", authenticateToken, async (req, res) => {
  const { name } = req.body;
  const newGroup = await groupModel.create({
    groupName: name,
    createdBy: req.user.id,
  });
  res.status(201).json(newGroup);
});

app.get("/api/groups", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const userGroups = await groupModel.find({ createdBy: userId });
    res.json(userGroups);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch groups" });
  }
});

app.post("/api/groups/:id/members", authenticateToken, async (req, res) => {
  const groupId = req.params.id;
  const { username } = req.body;
  console.log(groupId,username)
  try {
    const user = await userModel.findOne({ username });
    if (!user) return res.status(404).json({ error: "User not found" });
    const group = await groupModel.findById(groupId);
    if (!group) return res.status(404).json({ error: "Group not found" });
    if (group.members.includes(user._id)) {
      return res.status(400).json({ error: "User already in group" });
    }
    group.members.push(user._id);
    await group.save();
    res
      .status(200)
      .json({ message: "User added to group", member: user.username });
  } catch (error) {
    console.error("Error adding member:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
app.get("/api/groups/:id/members", async (req, res) => {
  const groupId = req.params.id;
  if (!mongoose.Types.ObjectId.isValid(groupId)) {
    return res.status(400).json({ error: "Invalid group ID format" });
  }
  try {
    const group = await groupModel
      .findById(groupId)
      .populate("members", "username");
    if (!group) {
      return res.status(404).json({ error: "Group not found" });
    }
    if (!group.members || group.members.length === 0) {
      return res.status(200).json([]);
    }
    res.status(200).json(group.members);
  } catch (error) {
    console.error("Error fetching group members:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.delete("/api/groups/:groupId/transactions/:transactionId", authenticateToken, async (req, res) => {
  const { groupId, transactionId } = req.params;
  console.log(groupId, transactionId);
  try {
    const transaction = await transactionModel.findOneAndDelete({
      _id: transactionId,
      group: groupId,
    });
    console.log(transaction)
    if (!transaction) {
      console.log("Transaction not found or already deleted.");
      return res.status(404).json({ message: "Transaction not found" });
    }
    console.log("Transaction deleted:", transaction);
    res.status(200).json({ message: "Transaction deleted" });
  } catch (err) {
    console.error("Delete error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

//import Group from "./models/SplitGroup.js"; // adjust path if needed

app.post("/api/groups/:groupId/results", authenticateToken, async (req, res) => {
  const { groupId } = req.params;
  const { names: users, transactions } = req.body;

  if (!Array.isArray(users) || users.length === 0) {
    return res.status(400).send("Invalid users array.");
  }

  if (!Array.isArray(transactions) || transactions.length === 0) {
    return res.status(400).send("Invalid transactions array.");
  }

  const groupTransactions = transactions.filter(
    (txn) => txn.group === groupId
  );

  if (groupTransactions.length === 0) {
    return res.status(404).send("No transactions found for this group.");
  }

  const names = [...users];
  names.unshift("source");
  names.push("destination");

  const nameToIndex = new Map();
  names.forEach((name, index) => {
    nameToIndex.set(name, index);
  });

  const simplifiedTransactions = groupTransactions.map((txn) => ({
    payer: txn.from.username,
    payee: txn.to.username,
    amount: txn.amount,
  }));

  const { creditors, debtors } = calculateNetBalances(
    names,
    simplifiedTransactions,
    nameToIndex
  );

  const flowGraph = createFlowGraphMatrix(
    names,
    creditors,
    debtors,
    nameToIndex
  );

  const paths = [];
  const amtPending = [];

  const maxFlow = maxFlowAlgo(flowGraph, 0, flowGraph.length - 1, paths, amtPending);

  try {
    const group = await groupModel.findById(groupId).populate("members", "username");
    if (!group) return res.status(404).send("Group not found.");

    // Create a map of username -> ObjectId
    const usernameToId = new Map();
    group.members.forEach((member) => {
      usernameToId.set(member.username, member._id);
    });

    // Create transactions with user ObjectIds
    const resultPaths = paths.map((path, index) => {
      const fromUsername = names[path[1]]; // 🔁 TO pays FROM
      const toUsername = names[path[2]];

      const fromId = usernameToId.get(fromUsername);
      const toId = usernameToId.get(toUsername);

      if (!fromId || !toId) {
        throw new Error(`Missing user ID for ${fromUsername} or ${toUsername}`);
      }

      return {
        from: fromId,
        to: toId,
        amount: amtPending[index],
      };
    });

    group.resultantTransactions = resultPaths;
    await group.save();

    res.json({
      maxFlow,
      transactions: resultPaths,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error while saving group result.");
  }
});

app.get("/api/groups/:groupId/res_transactions", authenticateToken, async (req, res) => {
  try {
    const group = await groupModel
      .findById(req.params.groupId)
      .populate({ path: "resultantTransactions.from", select: "username" })
      .populate({ path: "resultantTransactions.to", select: "username" });

    console.log("GROUP:", req.params.groupId, group);

    if (!group) return res.status(404).send("Group not found");

    // 🧠 Format the output using populated usernames
    const populatedResults = group.resultantTransactions.map((txn) => ({
      from: txn.from?.username || "Unknown",
      to: txn.to?.username || "Unknown",
      amount: txn.amount,
    }));

    res.json({
      groupId: group._id,
      transactions: populatedResults,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

app.post("/api/send-invite", async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }

  try {
    const mailOptions = {
      from: "harshalrelan99@gmail.com",
      to: email,
      subject: "You're invited to SplitEase!",
      text: `Hey there! 👋\n\nYou’ve been invited to join a group on SplitEase.\n\nhttp://localhost:5173/register\n\n- Team SplitEase`,
    };

    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: "Invite email sent successfully" });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({ error: "Failed to send email" });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
