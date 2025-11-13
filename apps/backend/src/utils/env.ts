import dotenv from "dotenv";

dotenv.config();

interface Config {
  BETTER_AUTH_URL: string;
  BETTER_AUTH_SECRET: string;
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
  JWT_SECRET: string;
  FRONTEND_URL: string;
  NODE_ENV: string;
  // PRIVY_APP_ID: string;
  // PRIVY_APP_SECRET: string;
  PINATA_API_KEY: string;
  PINATA_API_SECRET: string;
  PINATA_JWT: string;
}

const env: Config = {
  BETTER_AUTH_URL: process.env.BETTER_AUTH_URL as string,
  BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET as string,
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID as string,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET as string,
  JWT_SECRET: process.env.JWT_SECRET as string,
  FRONTEND_URL: process.env.FRONTEND_URL || "http://localhost:3000",
  NODE_ENV: process.env.NODE_ENV || "development",
  // PRIVY_APP_ID: process.env.PRIVY_APP_ID as string,
  // PRIVY_APP_SECRET: process.env.PRIVY_APP_SECRET as string,
  PINATA_API_KEY: process.env.PINATA_API_KEY as string,
  PINATA_API_SECRET: process.env.PINATA_API_SECRET as string,
  PINATA_JWT: process.env.PINATA_JWT as string,
};

export default env;
