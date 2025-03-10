import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import siloRoutes from './routes/vaults'
import tokenRoutes from './routes/tokensRoute'
import poolsRoutes from './routes/poolsRotes'
import marketsRoutes from './routes/marketsRoute'
import vaultsRoutes from './routes/vaults'
import testRoutes from './routes/testRote'

import cors from "cors";
import cron from "node-cron"
import { cronOnchainUpdates } from "./controller/cron-controller";
dotenv.config();

const app: Express = express();
const port = process.env.PORT || 5000;

// ✅ Enable CORS for all routes
app.use(cors())
app.get("/", (req: Request, res: Response) => {
  res.status(200).send("Hello world kabuguuuu");
});

app.use("/api/v1", siloRoutes)
app.use("/api/v1/tokens", tokenRoutes)
app.use("/api/v1/pools", poolsRoutes)
app.use("/api/v1/markets", marketsRoutes)
app.use("/api/v1/vaults", vaultsRoutes)
app.use("/api/v1/cron", cronOnchainUpdates)
app.use("/api/v1/test", testRoutes)



  // Schedule the cron job to run every 15 minutes
cron.schedule('*/15 * * * *', () => {
  console.log("I invoked at", Date.now())
  cronOnchainUpdates();
});

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
})