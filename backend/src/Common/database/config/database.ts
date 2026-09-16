import dotenv from 'dotenv';
import path from 'path';

/* .env lives at <backend root>/.env; this file compiles to the same relative depth under
   dist/ as it sits under src/, so __dirname resolves correctly for both ts-node and dist. */
dotenv.config({ path: path.resolve(__dirname, '../../../../.env') });

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

export = {
    development: commonConfig,
    test: commonConfig,
    uat: commonConfig,
    production: commonConfig
};
