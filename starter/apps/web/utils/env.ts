interface Config {
  BACKEND_URL: string;
}

const env: Config = {
  BACKEND_URL: process.env.BACKEND_URL || "http://localhost:8000",
};

export default env;
