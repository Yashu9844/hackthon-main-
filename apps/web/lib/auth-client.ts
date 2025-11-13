import env from "@/utils/env";
import { createAuthClient } from "better-auth/react";
import { organizationClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  baseURL: env.BACKEND_URL,
  plugins: [organizationClient()],
});
