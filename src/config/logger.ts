import winston, { format } from "winston";
const { combine, timestamp, json } = format;

const logger = winston.createLogger({
  level: "info",
  defaultMeta: {
    serviceName: "auth-service",
  },
  transports: [
    new winston.transports.File({
      level: "info",
      dirname: "logs",
      filename: "app.log",
      format: combine(timestamp(), json()),
    }),
    new winston.transports.File({
      level: "error",
      dirname: "logs",
      filename: "errors.log",
      format: combine(timestamp(), json()),
    }),
    new winston.transports.Console({
      level: "info",
      format: combine(timestamp(), json()),
    }),
  ],
});

export default logger;
