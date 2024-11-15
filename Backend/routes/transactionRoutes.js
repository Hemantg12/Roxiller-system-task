import express from "express";
import {
  initializeDatabase,
  listTransactions,
  getStatistics,
  getBarChartData,
  getPieChartData,
  getCombinedData,
} from "../controller/transactionController.js";

const router = express.Router();

router.get("/initialize", initializeDatabase);
router.get("/transactions", listTransactions);
router.get("/statistics", getStatistics);
router.get("/barchart", getBarChartData);
router.get("/piechart", getPieChartData);
router.get("/combined", getCombinedData);

export default router;
