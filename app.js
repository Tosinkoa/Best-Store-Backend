import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import session from "express-session";
import dotenv from "dotenv";
import connection from "./knex/knex.js";
dotenv.config();
// import { db } from "./dbConnection.js";
// db();
const app = express();

// const PgStore = connectPgSimple(session);
// const store = new PgStore({ conString: connection, schemaName: "hidden", createTableIfMissing: true });

app.use(
  session({
    // store: store,
    secret: process.env.SESSION_SECRET,
    saveUninitialized: false,
    resave: true,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24,
      httpOnly: true,
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      secure: process.env.NODE_ENV === "production" ? true : false,
    },
  })
);

app.use(
  cors({
    origin: ["http://localhost:3000", "..."],
    credentials: true,
    methods: ["GET, PUT, POST, DELETE"],
    optionsSuccessStatus: 200,
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.get("/", async (req, res) => {
  const knexAdd = await connection("users").insert({ email: "hi@example.com" });
  console.log(knexAdd);
  return res.json(knexAdd);
});

app.use(express.json());
app.use(cookieParser());
app.set("trust proxy", 1);
// rootRoute(app);
export default app;
