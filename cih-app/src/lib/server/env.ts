export const ENV = {
  ORIGIN: process.env.ORIGIN ?? 'http://localhost:5173',
  SLACK_SIGNING_SECRET: process.env.SLACK_SIGNING_SECRET ?? '',
  SLACK_BOT_TOKEN: process.env.SLACK_BOT_TOKEN ?? '',
  DATABASE_URL: process.env.DATABASE_URL ?? 'sqlite.db'
};
