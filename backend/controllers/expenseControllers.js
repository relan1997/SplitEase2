import Expense from "../models/expenseModel.js";

export const getExpenses = async (req, res) => {
  try {
    const expenses = await Expense.find({ user: req.user.id }).sort({
      createdAt: -1,
    });
    res.status(200).json(expenses);
  } catch (err) {
    console.error("Error fetching expenses:", err);
    res.status(500).json({ error: "Failed to fetch expenses." });
  }
};

export const createExpense = async (req, res) => {
  const { amount, category, message } = req.body;
  console.log(req.user);

  if (!amount || !category) {
    return res.status(400).json({ error: "Amount and category are required." });
  }

  if (amount <= 0 || amount > 1e9) {
    return res
      .status(400)
      .json({ error: "Amount must be between 1 and 1e9." });
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
};
