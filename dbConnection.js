import knex from "knex";
import dotenv from "dotenv";
dotenv.config();

const connection = {
  client: "pg",
  connection: process.env.PG_CONNECTION_STRING,
};

export const db = knex(connection);
