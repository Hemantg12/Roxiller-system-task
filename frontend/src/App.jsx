import { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import axios from "axios";
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
} from "chart.js";

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale
);
const App = () => {
  const [month, setMonth] = useState("march");
  const [transactions, setTransactions] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statistics, setStatistics] = useState({
    totalAmount: 0,
    totalSoldItems: 0,
    totalNotSoldItems: 0,
  });
  const [priceRanges, setPriceRanges] = useState([]);
  async function fetchCombinedData() {
    try {
      const response = await axios.get("/api/combined", {
        params: { month },
      });
      console.log(response.data.barChartData);
      setStatistics({
        totalAmount: response.data.statistics.totalSaleAmount,
        totalSoldItems: response.data.statistics.totalSoldItems,
        totalNotSoldItems: response.data.statistics.totalNotSoldItems,
      });

      setPriceRanges(response.data.barChartData);
    } catch (error) {
      if (error.response) {
        console.error("Error:", error.response.data);
      } else {
        console.error("Unexpected Error:", error.message);
      }
    }
  }

  const fetchTransactions = async () => {
    try {
      const response = await axios.get("/api/transactions", {
        params: { month, search: searchText, page },
      });
      console.log(response.data.data);
      setTransactions(response.data.data);
      setTotalPages(Math.ceil(response.data.data.length / 10));
    } catch (error) {
      if (error.response) {
        console.error("Error:", error.response.data);
      } else {
        console.error("Unexpected Error:", error.message);
      }
    }
  };

  useEffect(() => {
    fetchCombinedData();
    fetchTransactions();
  }, [month, searchText, page]);
  const clearSearch = () => {
    setSearchText("");
    setPage(1);
  };

  const chartData = {
    labels: priceRanges.map((range) => range.range),
    datasets: [
      {
        label: "Number of Items",
        data: priceRanges.map((range) => range.count),
        backgroundColor: "rgba(54, 162, 235, 0.5)",
        borderColor: "rgba(54, 162, 235, 1)",
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: `Transactions by Price Range in ${
          month.charAt(0).toUpperCase() + month.slice(1)
        }`,
      },
    },
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Transactions Table</h1>

      <label htmlFor="month">Select Month:</label>
      <select
        id="month"
        onChange={(e) => {
          setMonth(e.target.value);
          setPage(1);
        }}
        value={month}
      >
        <option value="january">January</option>
        <option value="february">February</option>
        <option value="march">March</option>
        <option value="april">April</option>
        <option value="may">May</option>
        <option value="june">June</option>
        <option value="july">July</option>
        <option value="august">August</option>
        <option value="september">September</option>
        <option value="october">October</option>
        <option value="november">November</option>
        <option value="december">December</option>
      </select>

      <div style={{ margin: "20px 0" }}>
        <input
          type="text"
          placeholder="Search transactions"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
        <button onClick={clearSearch}>Clear</button>
      </div>

      <table border="1" style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th>Title</th>
            <th>category</th>
            <th>Description</th>
            <th>Price</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {transactions.length > 0 ? (
            transactions.map((transaction) => (
              <tr key={transaction.id}>
                <td>{transaction.title}</td>
                <td>{transaction.category}</td>
                <td>{transaction.description}</td>
                <td>{transaction.price}</td>

                <td>
                  {transaction.dateOfSale
                    ? new Date(transaction.dateOfSale).toLocaleDateString()
                    : "N/A"}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" style={{ textAlign: "center" }}>
                No transactions found
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <div style={{ marginTop: "20px" }}>
        <button
          onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
          disabled={page === 1}
        >
          Previous
        </button>
        <span style={{ margin: "0 10px" }}>
          Page {page} of {totalPages}
        </span>
        <button
          onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
          disabled={page === totalPages}
        >
          Next
        </button>
      </div>

      <div
        style={{
          marginTop: "20px",
          padding: "15px",
          border: "1px solid #ddd",
          borderRadius: "5px",
          backgroundColor: "#f7f7f7",
        }}
      >
        <h3>
          Transaction Statistics for{" "}
          {month.charAt(0).toUpperCase() + month.slice(1)}
        </h3>
        <p>
          <strong>Total Amount of Sale:</strong> ${statistics.totalAmount}
        </p>
        <p>
          <strong>Total Sold Items:</strong> {statistics.totalSoldItems}
        </p>
        <p>
          <strong>Total Not Sold Items:</strong> {statistics.totalNotSoldItems}
        </p>
      </div>

      <div className="mt-8">
        <Bar data={chartData} options={chartOptions} />
      </div>
    </div>
  );
};

export default App;
