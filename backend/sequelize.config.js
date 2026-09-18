/* Plain CommonJS config for sequelize-cli only (the CLI can't reliably load .ts config files
   across all Node/sequelize-cli versions). The app itself still uses
   src/Common/database/config/database.ts + sequelize.ts at runtime. Keep both in sync. */
require('dotenv').config({ path: require('path').resolve(__dirname, '.env') });

const useSsl = process.env.DATABASE_SSL
    ? process.env.DATABASE_SSL === 'true'
    : process.env.NODE_ENV === 'production';

const dialectOptions = useSsl
    ? { connectTimeout: 40000, ssl: { require: true, rejectUnauthorized: false } }
    : { connectTimeout: 40000 };

/* Render (and most PaaS Postgres add-ons) hand you one DATABASE_URL, not discrete host/user/
   password fields — sequelize-cli's own `use_env_variable` convention picks that up directly. */
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

module.exports = {
    development: commonConfig,
    test: commonConfig,
    uat: commonConfig,
    production: commonConfig
};
