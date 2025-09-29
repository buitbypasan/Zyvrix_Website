import express from "express";
import helmet from "helmet";
import cors from "cors";
import { config } from "./config.js";
import authRouter from "./routes/auth.js";

const app = express();

app.use(helmet());
if (config.cors.origins && config.cors.origins.length) {
  app.use(
    cors({
      origin: config.cors.origins,
      credentials: true,
    })
  );
} else {
  app.use(cors({ credentials: true }));
}
app.use(express.json({ limit: "16kb" }));

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/auth", authRouter);

app.use((req, res) => {
  res.status(404).json({ ok: false, error: "Not found" });
});

app.use((err, req, res, next) => {
  // eslint-disable-next-line no-console
  console.error(err);
  res.status(500).json({ ok: false, error: "Internal server error" });
});

if (process.env.NODE_ENV !== "test") {
  const port = Number(config.port || 4000);
  app.listen(port, () => {
    console.log(`Authentication server listening on port ${port}`);
  });
}

export default app;
