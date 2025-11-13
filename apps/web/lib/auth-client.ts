import env from "@/utils/env";
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: env.BACKEND_URL,
});
