interface Config {
  BACKEND_URL: string;
  FRONTEND_URL: string;
}

const env: Config = {
  FRONTEND_URL: process.env.FRONTEND_URL || "http://localhost:3000",
  BACKEND_URL: process.env.BACKEND_URL || "http://localhost:8000",
};

export default env;
