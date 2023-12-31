import { WebSocket } from "ws";

const HEARTBEAT_INTERVAL = 1000 * 5; // 5 seconds
const HEARTBEAT_VALUE = 1;

function ping(client) {
  client.send(HEARTBEAT_VALUE, { binary: true });
}

const WebsocketRootRoute = (wss) => {
  wss.on("connection", (ws, req) => {
    ws.isAlive = true;
    ws.on("error", console.error);

    ws.on("message", (msg, isBinary) => {
      if (isBinary) {
        const dataArray = new Uint8Array(msg);
        const value = dataArray[0];

        if (value === HEARTBEAT_VALUE) {
          console.log("pong");
          ws.isAlive = true;
        }
      }
    });
  });

  const interval = setInterval(() => {
    console.log("Firing interval");
    wss.clients.forEach((client) => {
      if (!client.isAlive) return client.terminate();

      client.isAlive = false;
      ping(client);
    });
  }, HEARTBEAT_INTERVAL);

  wss.on("close", function close() {
    clearInterval(interval);
  });
};

export default WebsocketRootRoute;
