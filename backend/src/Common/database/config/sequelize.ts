import { Options, Sequelize } from 'sequelize';
import database from './database';
import { ApplicationModeConstants } from '../../constants/ApplicationModeConstants';

const env = process.env.NODE_ENV ? process.env.NODE_ENV : ApplicationModeConstants.DEVELOPMENT;
const config = database[env as keyof typeof database];

const sequelizeOptions = {
    ...config,
    dialect: 'postgres',
    logging: false,
    pool: {
        max: 15,
        min: 1,
        evict: 30_000
    }
} as Options;

const sequelize = new Sequelize(sequelizeOptions);

export default sequelize;
