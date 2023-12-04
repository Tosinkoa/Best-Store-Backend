import pool from "../../../src/LIB/DB-Client.js";
import { v4 as uuidv4 } from "uuid";

const addSellers = async () => {
  try {
    for (let i = 1; i < 26; i++) {
      const business_logo =
        "https://thumbs.dreamstime.com/b/lets-shopping-logo-design-template-shop-icon-135610500.jpg";

      await pool.query("UPDATE users SET role = $1 WHERE id = $2", ["seller", i]);
      await pool.query(
        "INSERT INTO sellers (business_name, business_logo, business_logo_key, about, state, city, user_id) VALUES ($1, $2, $3, $4, $5, $6, $7)",
        [
          `Good store${i}`,
          business_logo,
          uuidv4(),
          `About good store ${i}`,
          "Osun state",
          "Ilesa",
          i,
        ]
      );
      console.log(`Seller ${i} added successfully!`);
    }
  } catch (error) {
    console.log("Something went wrong:");
    console.log(error);
  }
};

addSellers();
