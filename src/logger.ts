import * as winston from 'winston';

import { Config } from './config';

const
  dailyRotateFile = require('winston-daily-rotate-file');

export let logger: winston.Logger;

export function InitLogger(config: Config) {
  logger = winston.createLogger({});

  if (config.log.file != undefined)
    logger.add(new dailyRotateFile({
      level: config.log.file.level,
      filename: config.log.file.name,
      dirname: config.log.file.directory,
      datePattern: config.log.file.datePattern,
      createTree: true,
      maxSize: config.log.file.maxSize,
      maxFiles: config.log.file.maxFiles,

      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.printf((info: any) => {
          return JSON.stringify({
            timestamp: info.timestamp,
            level: info.level,
            message: info.message
          });
        })
      )
    }));

  if (config.log.console != undefined)
    logger.add(new winston.transports.Console({
      level: config.log.console.level,
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.timestamp(),
        winston.format.printf((info: any) => {
          return `${info.timestamp} [${info.level}]: ${info.message}`;
        })
      )
    }));
}
