import pool from "../../../LIB/DB-Client.js";

export const BargainQueries = {
  selectBargainByUserAndProductId(bagainIDs) {
    return pool.query(
      "SELECT p.id as product_id, s.user_id as seller_user_id, b.id as bargain_id, b.amount as bargain_amount FROM products p LEFT JOIN sellers s ON p.seller_id = s.id LEFT JOIN bargains b ON p.id = b.product_id AND b.user_id = $1 WHERE p.id = $2",
      [...bagainIDs]
    );
  },
  insertIntoBargain(bargainData) {
    return pool.query(
      "INSERT INTO bargains (product_id, user_id, amount) VALUES ($1, $2, $3)",
      [...bargainData]
    );
  },
  updateBargain(bargainData) {
    return pool.query(
      "UPDATE bargains SET amount = $1 WHERE user_id = $2 AND product_id = $3",
      [...bargainData]
    );
  },
  selectBargainByID(bargainId) {
    return pool.query(
      "SELECT b.id as bargain_id, b.product_id, s.user_id as seller_user_id FROM bargains b LEFT JOIN products p ON b.product_id = p.id LEFT JOIN sellers s ON p.seller_id = s.id WHERE b.id = $1",
      [bargainId]
    );
  },
  setBargainAcceptToTrue(bargainData) {
    return pool.query("UPDATE bargains SET accepted = $1 WHERE id = $2", [
      ...bargainData,
    ]);
  },
  deleteByProductAndBargainID(bargainData) {
    return pool.query("DELETE FROM bargains WHERE product_id = $1 AND id !=  $2", [
      ...bargainData,
    ]);
  },
};
