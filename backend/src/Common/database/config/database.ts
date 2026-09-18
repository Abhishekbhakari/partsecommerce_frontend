import dotenv from 'dotenv';
import path from 'path';

/* .env lives at <backend root>/.env; this file compiles to the same relative depth under
   dist/ as it sits under src/, so __dirname resolves correctly for both ts-node and dist.
   In production (Render, etc.) there usually is no .env file — env vars come from the host's
   dashboard instead, and dotenv.config() silently no-ops if the file isn't found, which is fine. */
dotenv.config({ path: path.resolve(__dirname, '../../../../.env') });

/* Render's managed Postgres requires SSL on both its External and Internal connection URLs, and
   presents a certificate that isn't in Node's default trust store — `rejectUnauthorized: false`
   is the standard/expected setting for this class of managed DB (Render, Heroku, Supabase), not
   a security downgrade specific to us. Toggle explicitly via DATABASE_SSL if a host needs it off. */
const useSsl = process.env.DATABASE_SSL
    ? process.env.DATABASE_SSL === 'true'
    : process.env.NODE_ENV === 'production';

const dialectOptions = useSsl
    ? { connectTimeout: 40000, ssl: { require: true, rejectUnauthorized: false } }
    : { connectTimeout: 40000 };

/* Render (and most PaaS Postgres add-ons) hand you ONE connection string — DATABASE_URL — not
   five separate host/port/user/password/database values. Support both: prefer DATABASE_URL when
   set (via sequelize-cli's own `use_env_variable` convention, honoured in sequelize.ts and
   sequelize.config.js too), fall back to the discrete DATABASE_* vars for local dev. */
const commonConfig = process.env.DATABASE_URL
    ? {
          use_env_variable: 'DATABASE_URL',
          dialect: process.env.DATABASE_DIALECT || 'postgres',
          migrationStorageTableName: 'SequelizeMeta',
          dialectOptions
      }
    : {
          username: process.env.DATABASE_USER,
          password: process.env.DATABASE_PASSWORD,
          database: process.env.DATABASE_NAME,
          host: process.env.DATABASE_HOST,
          port: process.env.DATABASE_PORT ? Number(process.env.DATABASE_PORT) : 5432,
          dialect: process.env.DATABASE_DIALECT || 'postgres',
          migrationStorageTableName: 'SequelizeMeta',
          dialectOptions
      };

export = {
    development: commonConfig,
    test: commonConfig,
    uat: commonConfig,
    production: commonConfig
};
