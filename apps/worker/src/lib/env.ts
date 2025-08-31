import dotenv from "dotenv";
dotenv.config();

export const env = {
  PORT: process.env.PORT!,
  X_API_KEY: process.env.X_API_KEY!,
  X_API_SECRET: process.env.X_API_SECRET!,
};

for (const [key, value] of Object.entries(env)) {
  if (value === undefined) {
    throw new Error(`Missing environment variable: ${key}`);
  }
}
