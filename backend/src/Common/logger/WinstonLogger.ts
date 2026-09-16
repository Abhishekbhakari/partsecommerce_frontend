import 'winston-daily-rotate-file';
import winston from 'winston';

winston.addColors({
    error: 'red',
    warn: 'yellow',
    info: 'cyan',
    debug: 'green'
});

const timezoned = () => {
    return new Date().toLocaleString('en-US', {
        timeZone: 'Asia/Kolkata'
    });
};

/** Logger used across the entire application. */
class WinstonLogger {
    public static logger = winston.createLogger({
        format: winston.format.combine(winston.format.timestamp({ format: timezoned })),
        /* info also tracks error/warn levels so a separate error-only transport isn't required */
        transports: [
            new winston.transports.Console({
                level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
                format: winston.format.combine(winston.format.colorize(), winston.format.simple())
            }),
            new winston.transports.DailyRotateFile({
                dirname: 'logs',
                filename: 'application-%DATE%.log',
                datePattern: 'YYYY-MM-DD',
                maxFiles: '14d',
                level: 'info'
            })
        ]
    });
}

export default WinstonLogger;
