import pool from "../../../src/LIB/DB-Client.js";
import crypto from "crypto";

/**
 * @todo Do product ranking by order cancellation while getting all products
 */

const addUsers = async () => {
  try {
    const hashedPassword = "$2b$10$7nt2DfUVY5sAUhLdPjOTRu4RUBsom0/QM2iewPRyqBWtchMSK1KpG";
    for (let i = 1; i < 51; i++) {
      const randomBytes = crypto.randomBytes(11);
      // Convert the random bytes to a number within a specified range
      const minNumber = 0;
      const maxNumber = Math.pow(10, 11) - 1;
      const phone_number =
        minNumber + (parseInt(randomBytes.toString("hex"), 16) % (maxNumber - minNumber + 1));
      await pool.query(
        "INSERT INTO users (first_name, last_name, email, phone_number, password) VALUES ($1, $2, $3, $4, $5) RETURNING *",
        [`Paul${i}`, `Ojo${i}`, `tosinkoa${i}@gmail.com`, phone_number, hashedPassword]
      );
      console.log(`Added user: ${i}`);
    }
  } catch (error) {
    console.log("Something went wrong:");
    console.log(error);
  }
};

addUsers();
