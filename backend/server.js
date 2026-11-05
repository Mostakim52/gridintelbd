const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" },
  transports: ["websocket", "polling"],
});

const PORT = process.env.PORT || 4000;

// --- Simulated region data ---
const REGIONS = [
  { id: "north", name: "North Grid", underground: 82, status: "ok", sensor: "N-01", baseDraw: 412 },
  { id: "central", name: "Central Grid", underground: 91, status: "ok", sensor: "C-03", baseDraw: 678 },
  { id: "east", name: "East Substation", underground: 45, status: "bad", sensor: "E-07", baseDraw: 523 },
  { id: "south", name: "South Grid", underground: 38, status: "bad", sensor: "S-12", baseDraw: 389 },
  { id: "west", name: "West Grid", underground: 73, status: "ok", sensor: "W-05", baseDraw: 294 },
  { id: "indust", name: "Industrial Zone", underground: 60, status: "bad", sensor: "I-09", baseDraw: 812 },
];

let state = {
  outages: 14,
  illegal: 23,
  underground: 68,
  efficiency: 89,
  drawA: 850,
  drawB: 720,
  theft: false,
  lastUpdated: new Date().toISOString(),
};

function clamp(v, min, max) { return Math.min(Math.max(v, min), max); }

function tick() {
  // random walk sensor readings
  REGIONS.forEach((r) => {
    r.draw = Math.round(r.baseDraw * (0.9 + Math.random() * 0.2));
    r.underground = clamp(r.underground + Math.round(Math.random() * 4) - 2, 0, 100);
    r.status =
      r.underground >= 75
        ? "underground"
        : Math.random() > 0.75
          ? "bad"
          : "ok";
  });

  state.drawA = Math.round(800 + Math.random() * 250);
  state.drawB = Math.round(state.drawA * (0.75 + Math.random() * 0.22));
  state.theft = Math.random() > 0.75;
  state.outages = clamp(state.outages + (Math.random() > 0.6 ? -1 : 1), 0, 30);
  state.illegal = clamp(state.illegal + (Math.random() > 0.7 ? -1 : 1), 0, 50);
  state.underground = clamp(state.underground + Math.round(Math.random() * 3) - 1, 0, 100);
  state.efficiency = clamp(state.efficiency + Math.round(Math.random() * 2) - 1, 50, 100);
  state.lastUpdated = new Date().toISOString();

  io.emit("sensor:update", { regions: REGIONS, state });
}

// --- REST endpoints ---
app.get("/api/health", (_req, res) => res.json({ ok: true, time: state.lastUpdated }));

app.get("/api/regions", (_req, res) => res.json(REGIONS));

app.get("/api/state", (_req, res) => res.json(state));

app.post("/api/simulate", (_req, res) => {
  tick();
  res.json({ ok: true, regions: REGIONS, state });
});

app.post("/api/reset", (_req, res) => {
  state = {
    outages: 14,
    illegal: 23,
    underground: 68,
    efficiency: 89,
    drawA: 850,
    drawB: 720,
    theft: false,
    lastUpdated: new Date().toISOString(),
  };
  REGIONS.forEach((r, i) => {
    const bases = [412, 678, 523, 389, 294, 812];
    const under = [82, 91, 45, 38, 73, 60];
    const st = ["ok", "ok", "bad", "bad", "ok", "bad"];
    r.draw = bases[i];
    r.underground = under[i];
    r.status = st[i];
  });
  state.lastUpdated = new Date().toISOString();
  io.emit("sensor:update", { regions: REGIONS, state });
  res.json({ ok: true, regions: REGIONS, state });
});

app.get("/api/export", (_req, res) => {
  const lines = ["Region,Underground %,Status,Draw kW"];
  REGIONS.forEach((r) => lines.push(`${r.name},${r.underground},${r.status},${r.draw || r.baseDraw}`));
  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", "attachment; filename=powerline-report.csv");
  res.send(lines.join("\n"));
});

// --- WebSocket ---
io.on("connection", (socket) => {
  console.log("sensor client connected", socket.id);
  socket.emit("sensor:update", { regions: REGIONS, state });
  socket.on("disconnect", () => console.log("sensor client disconnected", socket.id));
});

// simulate every 3 seconds
setInterval(tick, 3000);

server.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
