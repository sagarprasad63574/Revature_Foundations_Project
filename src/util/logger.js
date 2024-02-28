const { createLogger, transports, format } = require("winston");

const logger = createLogger({
    level: "info",
    format: format.combine(
        format.timestamp(),
        format.printf(({ timestamp, level, message }) => {
            return `${timestamp} [${level}]: ${message}`;
        })
    ),
    transports: [
        new transports.File({ filename: "app.log" }),
    ],
});

module.exports = logger;