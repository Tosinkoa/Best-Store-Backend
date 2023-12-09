import pool from "../../../LIB/DB-Client.js";

export const TransactionQueries = {
  selectSalesCount() {
    return pool.query("SELECT COUNT(*) AS total_sales_count FROM transactions");
  },
  selectTodaysSalesCount() {
    return pool.query(
      "SELECT COUNT(*) AS total_transactions FROM transactions WHERE DATE(created_at) = CURRENT_DATE"
    );
  },
  selectTransactionTotalAmount() {
    return pool.query("SELECT SUM(amount) AS total_transaction_amount FROM transactions");
  },
  selectTodaysTransactionTotalAmount() {
    return pool.query(
      "SELECT SUM(amount) AS total_transaction_amount FROM transactions WHERE DATE(created_at) = CURRENT_DATE"
    );
  },
};
