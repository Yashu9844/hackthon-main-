import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
// If your Prisma file is located elsewhere, you can change the path
import { db } from "@/lib/prisma-client";
import env from "@/utils/env";
import { organization } from "better-auth/plugins";

export const auth = betterAuth({
  baseURL: env.BETTER_AUTH_URL,
  secret: env.BETTER_AUTH_SECRET,
  database: prismaAdapter(db, {
    provider: "postgresql", // or "mysql", "postgresql", ...etc
  }),
  socialProviders: {
    google: {
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    },
  },
  trustedOrigins: [env.FRONTEND_URL],
  plugins: [
    organization({
      organizationHooks: {
        // beforeUpdateOrganization: async ({ organization, user, member }) => {
        //   return {
        //     data: {
        //       ...organization,
        //       name: organization.name?.toLowerCase(),
        //     },
        //   };
        // },
      },
    }),
  ],
});
