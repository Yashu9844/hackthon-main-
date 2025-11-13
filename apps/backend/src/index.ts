import express from "express";
import { toNodeHandler } from "better-auth/node";
import { auth } from "@/lib/auth";
import env from "@/utils/env";
import cors from "cors";

import * as trpcExpress from "@trpc/server/adapters/express";
import { appRouter } from "./trpc/index";
import credentialsRouter from "./routes/credentials-test";
import temporalRouter from "./routes/temporal";

const app = express();
const port = 8000;

app.use(express.json());
app.use(
  cors({
    origin: env.FRONTEND_URL,
    methods: ["GET", "POST", "PUT", "DELETE"], // Specify allowed HTTP methods
    credentials: true, // Allow credentials (cookies, authorization headers, etc.)
  })
);
app.all("/api/auth/*", toNodeHandler(auth));

const createContext = ({
  req,
  res,
}: trpcExpress.CreateExpressContextOptions) => ({});

app.use(
  "/trpc",
  trpcExpress.createExpressMiddleware({
    router: appRouter,
    createContext,
  })
);

// Credentials API routes
app.use("/api/credentials", credentialsRouter);

// Temporal API routes
app.use("/api/temporal", temporalRouter);

app.listen(port, () => {
  console.log(`Better Auth app listening on port ${port}`);
});
