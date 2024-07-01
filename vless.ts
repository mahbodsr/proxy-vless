import net from "net";
import { WebSocket, createWebSocketStream } from "ws";
import { TextDecoder } from "util";
import { createServer } from "http";

const uuid = "e6752ef9-4518-473f-a278-07c098878c56".replace(/-/g, "");
const port = 10000;

const server = createServer((req, res) => {
  res.statusCode = 200;
  res.end();
});

server.listen(port, () => {
  console.log("HTTP server is running");
});

const wss = new WebSocket.Server({ server });
wss.on("connection", (ws) => {
  ws.once("message", (msg) => {
    if (msg instanceof ArrayBuffer || Array.isArray(msg)) return;
    const [VERSION] = msg;
    const id = msg.subarray(1, 17);
    if (!id.every((v, i) => v == parseInt(uuid.substr(i * 2, 2), 16))) return;
    let i = msg.subarray(17, 18).readUInt8() + 19;
    const port = msg.subarray(i, (i += 2)).readUInt16BE(0);
    const ATYP = msg.subarray(i, (i += 1)).readUInt8();
    const host =
      ATYP == 1
        ? msg.subarray(i, (i += 4)).join(".") //IPV4
        : ATYP == 2
        ? new TextDecoder().decode(
            msg.subarray(i + 1, (i += 1 + msg.subarray(i, i + 1).readUInt8()))
          ) //domain
        : ATYP == 3
        ? msg
            .subarray(i, (i += 16))
            .reduce(
              // @ts-ignore
              (s, b, i, a) => (i % 2 ? s.concat(a.slice(i - 1, i + 1)) : s),
              []
            )
            // @ts-ignore
            .map((b) => b.readUInt16BE(0).toString(16))
            .join(":")
        : ""; //ipv6

    ws.send(new Uint8Array([VERSION, 0]));
    const duplex = createWebSocketStream(ws);
    const socket = net.connect({ host, port }, () => {
      socket.write(msg.subarray(i));
      duplex
        .on("error", () => {})
        .pipe(socket)
        .on("error", () => {})
        .pipe(duplex);
    });
    socket.on("error", () => {});
  }).on("error", () => {});
});
