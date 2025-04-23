import groupModel from "../models/groupModel.js";
import { calculateNetBalances } from "../helpers/calculateNetBalances.js";
import { createFlowGraphMatrix } from "../helpers/createFlowGraphMatrix.js";
import { maxFlowAlgo } from "../helpers/maxFlowAlgo.js";

export const postResults = async (req, res) => {
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

  const maxFlow = maxFlowAlgo(
    flowGraph,
    0,
    flowGraph.length - 1,
    paths,
    amtPending
  );

  try {
    const group = await groupModel
      .findById(groupId)
      .populate("members", "username");
    if (!group) return res.status(404).send("Group not found.");

    const usernameToId = new Map();
    group.members.forEach((member) => {
      usernameToId.set(member.username, member._id);
    });

    const resultPaths = paths.map((path, index) => {
      const fromUsername = names[path[1]];
      const toUsername = names[path[2]];

      const fromId = usernameToId.get(fromUsername);
      const toId = usernameToId.get(toUsername);

      if (!fromId || !toId) {
        throw new Error(
          `Missing user ID for ${fromUsername} or ${toUsername}`
        );
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
};

export const getResultsTransactions = async (req, res) => {
  try {
    const group = await groupModel
      .findById(req.params.groupId)
      .populate({ path: "resultantTransactions.from", select: "username" })
      .populate({ path: "resultantTransactions.to", select: "username" });

    if (!group) return res.status(404).send("Group not found");

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
};
