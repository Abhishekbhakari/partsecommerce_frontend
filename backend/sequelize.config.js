/* Plain CommonJS config for sequelize-cli only (the CLI can't reliably load .ts config files
   across all Node/sequelize-cli versions). The app itself still uses
   src/Common/database/config/database.ts + sequelize.ts at runtime. Keep both in sync. */
require('dotenv').config({ path: require('path').resolve(__dirname, '.env') });

const commonConfig = {
    username: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
    host: process.env.DATABASE_HOST,
    port: process.env.DATABASE_PORT ? Number(process.env.DATABASE_PORT) : 5432,
    dialect: process.env.DATABASE_DIALECT || 'postgres',
    migrationStorageTableName: 'SequelizeMeta',
    dialectOptions: {
        connectTimeout: 40000
    }
};

module.exports = {
    development: commonConfig,
    test: commonConfig,
    uat: commonConfig,
    production: commonConfig
};
