import sequelize from './Common/database/config/sequelize';
import app from './app';
import http from 'http';
import WinstonLogger from './Common/logger/WinstonLogger';
import AuthService from './FoundationalService/IdentityAccessManagement/api/auth/auth.service';
import './Common/database/models'; // registers all model associations before the app boots

const NAMESPACE = '[SERVER CONNECTION]:';
const PORT = process.env.PORT ?? 4000;

const server = http.createServer(app);

/* When writing tests we import the server from this file. We do not want to start another
   server, so server.listen() is guarded to run only when this file is executed directly. */
if (require.main === module) {
    (async () => {
        try {
            await sequelize.authenticate();
            /* Schema is owned by src/database/migrations, run via sequelize-cli — never synced here. */
            await AuthService.seedDefaultSuperAdmin();
            server.listen(PORT, () => {
                WinstonLogger.logger.log({
                    message: `${NAMESPACE} Server started on port ${PORT}`,
                    level: 'info'
                });
            });
        } catch (error: unknown) {
            WinstonLogger.logger.log({
                message: `${NAMESPACE} Unable to start the server: ${String(error)}`,
                level: 'error'
            });
        }
    })();
}

export default server;
