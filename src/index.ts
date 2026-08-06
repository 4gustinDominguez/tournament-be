import express, { Express, Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import tournamentRoutes from "./tournaments/infrastructure/tournament.routes";
import playerRoutes from "./players/infrastructure/player.routes";
import teamRoutes from "./teams/infrastructure/team.routes";
import matchRoutes from "./matches/infrastructure/match.routes";
import roundRoutes from "./rounds/infrastructure/round.routes";
import placeRoutes from "./places/infrastructure/place.routes";
import refereeRoutes from "./referees/infrastructure/referee.routes";
import standingsRoutes from "./standings/infrastructure/standings.routes";
import fixtureRoutes from "./fixtures/infrastructure/fixture.routes";
import authRoutes from "./auth/infrastructure/auth.routes";
import scenarioRoutes from "./scenarios/infrastructure/generator.routes";
import dashboardRoutes from "./dashboard/infrastructure/dashboard.routes";
import { usingPostgres } from "./shared/infrastructure/repository.factory";
import { getPool, initDatabase } from "./shared/infrastructure/db";

const app: Express = express();
const port = process.env.PORT || 3000;

const corsOptions = process.env.CORS_ORIGIN
  ? { origin: process.env.CORS_ORIGIN.split(",").map((origin) => origin.trim()) }
  : {};
app.use(cors(corsOptions));
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use(tournamentRoutes);
app.use(playerRoutes);
app.use(teamRoutes);
app.use(matchRoutes);
app.use(roundRoutes);
app.use(placeRoutes);
app.use("/referees", refereeRoutes);
app.use(standingsRoutes);
app.use(fixtureRoutes);
app.use(scenarioRoutes);
app.use(dashboardRoutes);
app.use("/auth", authRoutes);

app.get("/", (req: Request, res: Response) => {
  res.send("Hello, world!");
});

async function start(): Promise<void> {
  if (usingPostgres) {
    await initDatabase(getPool());
  }

  app.listen(port, () => {
    console.log(`[server]: Server is running at http://localhost:${port}`);
  });
}

start().catch((error) => {
  console.error("[server]: Failed to start", error);
  process.exit(1);
});