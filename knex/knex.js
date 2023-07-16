import knex from "knex";
import configuration from "../knexfile.js";
import dotenv from "dotenv";

dotenv.config();

const knexConfig = process.env.NODE_ENV || "development";
const connection = knex(configuration[knexConfig]);
export default connection;
