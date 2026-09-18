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
    /* Listen FIRST, independent of the DB. A hosting platform's health check (and every request)
       needs a port that's actually open to know the deploy is alive at all — if `listen()` only
       ran after a successful DB connection, one bad DB credential/SSL setting would leave the
       process silently never listening: no port, no error page, nothing — every request just
       hangs forever at the platform's edge with zero bytes back, which is exactly the failure
       mode that is impossible to debug from outside. Better: the server is always reachable, and
       DB connectivity is reported on /health (see health.controller.ts) and in the boot log. */
    server.listen(PORT, () => {
        WinstonLogger.logger.log({
            message: `${NAMESPACE} Server started on port ${PORT}`,
            level: 'info'
        });
    });

    (async () => {
        try {
            await sequelize.authenticate();
            WinstonLogger.logger.log({ message: `${NAMESPACE} Database connected.`, level: 'info' });
            /* Schema is owned by src/database/migrations, run via sequelize-cli — never synced here. */
            await AuthService.seedDefaultSuperAdmin();
        } catch (error: unknown) {
            /* Loud and specific: this is the #1 cause of a deployed backend "not working" — log
               enough that it's diagnosable from the platform's log stream alone, without needing
               a debugger attached. Common causes: DATABASE_URL/DATABASE_* env vars not set on the
               host, DB requires SSL (see Common/database/config/database.ts), or the DB itself
               isn't reachable from this service (wrong region/network). */
            WinstonLogger.logger.log({
                message: `${NAMESPACE} DATABASE CONNECTION FAILED — the server is listening on port ${PORT} but every DB-backed request will fail until this is fixed. Error: ${String(error)}`,
                level: 'error'
            });
        }
    })();
}

export default server;
