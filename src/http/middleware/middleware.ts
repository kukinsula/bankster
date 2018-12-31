import * as express from 'express';
import * as jsonwebtoken from 'jsonwebtoken';

import { logger } from '../../logger';
import { Config } from '../../config';
import { NewRandomUuid } from '../../uuid';
import * as http from '../http';
import * as time from '../../time';

export const
  MONGO_DUPLICATE_ERROR_CODE = 11000,

  ACCESS_TOKEN_HEADER = 'x-access-token',
  REQUEST_ID = 'x-request-id',
  MAX_BODY_LENGTH = 100,

  Options = {
    caseSensitive: true,
    strict: true
  };

export function Welcome(config: Config):
  (req: express.Request,
    resp: express.Response,
    next: express.NextFunction) => void {

  return (req: express.Request,
    resp: express.Response,
    next: express.NextFunction) => {

    req.start = process.hrtime();
    req.uuid = req.headers[REQUEST_ID] as string;

    if (req.uuid == undefined)
      req.uuid = NewRandomUuid();

    resp.header(REQUEST_ID, req.uuid);
    resp.header('x-powered-by', 'Bankster');

    if (req.headers['origin'] != undefined)
      resp.header('Access-Control-Allow-Origin', req.headers['origin'] as string);

    if (config.verbose)
      logger.debug(`[${req.uuid}] ${req.method} ${req.originalUrl}`);

    resp.on('finish', () => {
      if (config.verbose)
        if (resp.statusCode >= 200 && resp.statusCode < 400) {
          logger.debug(`[${req.uuid}] ${req.method} ${req.originalUrl} => [${resp.statusCode}] (${time.PrettySince(req.start)})`);
        }
    });

    next();
  };
}

export function ErrorHandler(config: Config):
  (err: any,
    req: express.Request,
    resp: express.Response,
    next: express.NextFunction) => void {

  return (err: any,
    req: express.Request,
    resp: express.Response,
    next: express.NextFunction) => {

    let error = new http.HttpError();

    if (err.stack != undefined)
      error.stack = err.stack;

    if (err instanceof http.HttpError)
      error = err;

    else if (err.status === 400 && 'body' in err && err instanceof SyntaxError)
      error = http.BadRequest({
        body: {
          errors: [{
            name: 'JSON_INVALID'
          }]
        }
      });

    else if (err.name == 'ValidationError' && err.isJoi == true)
      error = http.BadRequest({
        name: 'VALIDATION_ERROR',
        body: {
          errors: err.details.map((detail: any) => {
            return {
              name: 'VALIDATION_ERROR',
              message: detail.message
            };
          })
        }
      });

    else if (err.name == 'MongoError' && err.code == MONGO_DUPLICATE_ERROR_CODE)
      error = http.BadRequest({
        body: {
          errors: [{
            name: 'DUPPLICATE_KEY'
          }]
        }
      });

    else if (err instanceof jsonwebtoken.TokenExpiredError ||
      err instanceof jsonwebtoken.JsonWebTokenError ||
      err instanceof jsonwebtoken.NotBeforeError)
      error = http.Unauthorized({
        body: {
          errors: [{
            name: 'TOKEN_INVALID'
          }]
        }
      });

    else if (err instanceof Error)
      error.message = err.message;

    else
      error.message = `${err}`;

    if (error.body == undefined || Object.keys(error.body).length == 0)
      resp.status(error.code).end();

    else
      resp.status(error.code).json(error.body);

    let level = 'debug';
    let body = error.body == undefined ? '' : ' ' + JSON.stringify(error.body);
    let message = error.name == undefined || error.name == '' ? '' : ' ' + error.name;

    if (error.message != undefined && error.message != '')
      message += ' ' + error.message;

    let str = `[${req.uuid}] ${req.method} ${req.originalUrl} failed${message} => [${error.code}]${body} (${time.PrettySince(req.start)})`;

    if (error.code >= 400 && error.code < 500) level = 'warn';
    else if (error.code >= 500) level = 'error';

    if (config.log.stackError && error.stack != undefined)
      str += ` ${error.stack}`;

    logger.log(level, str);
  }
}

export function NotFound(
  req: express.Request,
  resp: express.Response,
  next: express.NextFunction) {

  next(http.NotFound({
    message: `Endpoint ${req.path} Not Found!`
  }));
}
