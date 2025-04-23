import express from "express";
import { postResults, getResultsTransactions } from "../controllers/resultsController.js";
import { authenticateToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/api/groups/:groupId/results", authenticateToken, postResults);
router.get("/api/groups/:groupId/res_transactions", authenticateToken, getResultsTransactions);

export default router;
