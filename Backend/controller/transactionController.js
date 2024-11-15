import axios from "axios";
import Transaction from "../model/Transaction.js";

export const initializeDatabase = async (req, res) => {
  try {
    const { data } = await axios.get(
      "https://s3.amazonaws.com/roxiler.com/product_transaction.json"
    );
    await Transaction.insertMany(data);
    res.status(201).send({
      success: true,
      data: data,
      message: "Database initialized with seed data",
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to initialize database", error: error.message });
  }
};

export const listTransactions = async (req, res) => {
  const { month, search, page = 1, perPage = 10 } = req.query;

  if (!month) {
    return res.status(400).json({ message: "Month is required." });
  }

  const skip = (page - 1) * perPage;

  const formattedMonth =
    month.charAt(0).toUpperCase() + month.slice(1).toLowerCase();
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const monthIndex = monthNames.indexOf(formattedMonth);

  if (monthIndex === -1) {
    return res.status(400).json({ message: "Invalid month provided." });
  }

  const filter = {
    $expr: { $eq: [{ $month: "$dateOfSale" }, monthIndex + 1] },
    ...(search && {
      $or: [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { price: parseFloat(search) || 0 },
      ],
    }),
  };

  try {
    const transactions = await Transaction.find(filter)
      .skip(skip)
      .limit(parseInt(perPage));
    res.json({ success: true, data: transactions });
  } catch (error) {
    res.status(500).json({
      success: false,
      data: null,
      message: "Error fetching transactions",
      error: error.message,
    });
  }
};
export const getStatistics = async (req) => {
  const { month } = req.query;

  if (!month) {
    throw new Error("Month is required.");
  }

  const formattedMonth =
    month.charAt(0).toUpperCase() + month.slice(1).toLowerCase();
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const monthIndex = monthNames.indexOf(formattedMonth);

  if (monthIndex === -1) {
    throw new Error("Invalid month provided.");
  }

  const filter = {
    $expr: { $eq: [{ $month: "$dateOfSale" }, monthIndex + 1] },
  };

  try {
    const totalSaleAmount = await Transaction.aggregate([
      { $match: filter },
      { $group: { _id: null, total: { $sum: "$price" } } },
    ]);

    const totalSoldItems = await Transaction.countDocuments({
      ...filter,
      sold: true,
    });

    const totalNotSoldItems = await Transaction.countDocuments({
      ...filter,
      sold: false,
    });

    return {
      totalSaleAmount: totalSaleAmount[0]?.total || 0,
      totalSoldItems,
      totalNotSoldItems,
    };
  } catch (error) {
    throw new Error(error.message);
  }
};

export const getBarChartData = async (req) => {
  const { month } = req.query;
  if (!month) {
    throw new Error("Month is required.");
  }

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const formattedMonth =
    month.charAt(0).toUpperCase() + month.slice(1).toLowerCase();
  const monthIndex = monthNames.indexOf(formattedMonth);

  if (monthIndex === -1) {
    throw new Error("Invalid month provided.");
  }

  const filter = {
    $expr: { $eq: [{ $month: "$dateOfSale" }, monthIndex + 1] },
  };

  const priceRanges = [
    { range: "0-100", min: 0, max: 100 },
    { range: "101-200", min: 101, max: 200 },
    { range: "201-300", min: 201, max: 300 },
    { range: "301-400", min: 301, max: 400 },
    { range: "401-500", min: 401, max: 500 },
    { range: "501-600", min: 501, max: 600 },
    { range: "601-700", min: 601, max: 700 },
    { range: "701-800", min: 701, max: 800 },
    { range: "801-900", min: 801, max: 900 },
    { range: "901-above", min: 901, max: Infinity },
  ];

  try {
    const data = await Promise.all(
      priceRanges.map(async ({ range, min, max }) => {
        const count = await Transaction.countDocuments({
          ...filter,
          price: { $gte: min, $lte: max },
        });
        return { range, count };
      })
    );

    return data;
  } catch (error) {
    throw new Error(error.message);
  }
};

export const getPieChartData = async (req) => {
  const { month } = req.query;

  if (!month) {
    throw new Error("Month is required.");
  }

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const formattedMonth =
    month.charAt(0).toUpperCase() + month.slice(1).toLowerCase();
  const monthIndex = monthNames.indexOf(formattedMonth);

  if (monthIndex === -1) {
    throw new Error("Invalid month provided.");
  }

  const filter = {
    $expr: { $eq: [{ $month: "$dateOfSale" }, monthIndex + 1] },
  };

  try {
    const data = await Transaction.aggregate([
      { $match: filter },
      { $group: { _id: "$category", count: { $sum: 1 } } },
    ]);

    return data.map(({ _id, count }) => ({ category: _id, count }));
  } catch (error) {
    throw new Error(error.message);
  }
};

export const getCombinedData = async (req, res) => {
  try {
    const results = await Promise.allSettled([
      getStatistics(req),
      getBarChartData(req),
      getPieChartData(req),
    ]);

    const errors = {};
    const data = {};

    if (results[0].status === "fulfilled") {
      data.statistics = results[0].value;
    } else {
      errors.statistics = results[0].reason.message;
    }

    if (results[1].status === "fulfilled") {
      data.barChartData = results[1].value;
    } else {
      errors.barChartData = results[1].reason.message;
    }

    if (results[2].status === "fulfilled") {
      data.pieChartData = results[2].value;
    } else {
      errors.pieChartData = results[2].reason.message;
    }

    if (Object.keys(errors).length > 0) {
      return res.status(500).json({
        success: false,
        message: "Error fetching combined data",
        errors,
      });
    }

    res.json({
      success: true,
      statistics: data.statistics,
      barChartData: data.barChartData,
      pieChartData: data.pieChartData,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Unexpected error occurred",
      error: error.message,
    });
  }
};
