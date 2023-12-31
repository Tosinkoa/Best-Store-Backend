import connectPgSimple from "connect-pg-simple";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import session from "express-session";
import "./src/LIB/DB-Client.js";
import AdminRootRoute from "./src/Routes/AdminRootRoute.js";
import { WebSocketServer } from "ws";
import UserRootRoute from "./src/Routes/UserRootRoute.js";
import WebsocketRootRoute from "./src/Routes/WebsocketRootRoute.js";

import { createServer } from "http";

dotenv.config();
const app = express();

const server = createServer(app);
const wss = new WebSocketServer({ noServer: true });

const PgStore = connectPgSimple(session);
const store = new PgStore({
  conString: process.env.DATABASE_URL,
  schemaName: "hidden",
  createTableIfMissing: true,
});

app.use(express.json());
app.use(cookieParser());
app.set("trust proxy", 1);

const sessionMiddleware = session({
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
});

app.use(sessionMiddleware);

app.use(
  cors({
    origin: ["*", "http://localhost:3000", "http://localhost:3001"],
    credentials: true,
    methods: ["GET, PUT, POST, DELETE"],
    optionsSuccessStatus: 200,
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.get("/", (req, res) => {
  res.send("API running...");
});

UserRootRoute(app);
AdminRootRoute(app);

server.on("upgrade", (req, socket, head) => {
  socket.on("error", console.error);

  sessionMiddleware(req, {}, () => {
    wss.handleUpgrade(req, socket, head, (ws) => {
      socket.removeListener("error", console.error);
      wss.emit("connection", ws, req);
    });
  });
});

WebsocketRootRoute(wss);

export default server;
