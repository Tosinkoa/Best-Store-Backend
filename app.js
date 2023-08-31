import connectPgSimple from "connect-pg-simple";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import session from "express-session";
import "./src/LIB/DB-Client.js";
import AdminRootRoute from "./src/Routes/AdminRootRoute.js";
import UserRootRoute from "./src/Routes/UserRootRoute.js";

dotenv.config();
const app = express();

const PgStore = connectPgSimple(session);
const store = new PgStore({
  conString: process.env.DATABASE_URL,
  schemaName: "hidden",
  createTableIfMissing: true,
});

app.use(express.json());
app.use(cookieParser());
app.set("trust proxy", 1);

app.use(
  session({
    store: store,
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

UserRootRoute(app);
AdminRootRoute(app);

export default app;
