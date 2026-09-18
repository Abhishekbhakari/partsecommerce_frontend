import { Options, Sequelize } from 'sequelize';
import database from './database';
import { ApplicationModeConstants } from '../../constants/ApplicationModeConstants';

const env = process.env.NODE_ENV ? process.env.NODE_ENV : ApplicationModeConstants.DEVELOPMENT;
const config = database[env as keyof typeof database] as Record<string, unknown> & {
    use_env_variable?: string;
};

const { use_env_variable: useEnvVariable, ...restConfig } = config;

const sequelizeOptions = {
    ...restConfig,
    dialect: 'postgres',
    logging: false,
    pool: {
        max: 15,
        min: 1,
        evict: 30_000
    }
} as Options;

/* When the config carries `use_env_variable` (set in database.ts whenever DATABASE_URL is
   present — Render's connection-string style, vs discrete host/user/password for local dev),
   construct Sequelize from that single URL instead of the object form. */
const sequelize = useEnvVariable
    ? new Sequelize(process.env[useEnvVariable] as string, sequelizeOptions)
    : new Sequelize(sequelizeOptions);

export default sequelize;
