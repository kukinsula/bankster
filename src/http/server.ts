import * as http from 'http';

import * as express from 'express';

import { logger } from '../logger';
import { Config } from '../config';
import * as middleware from './middleware/middleware';
import * as cors from './middleware/cors';
import * as user from './middleware/user';
import * as account from './middleware/account';
import * as operation from './middleware/operation';
import * as category from './middleware/category';

const
  bodyParser = require('body-parser'),
  expressEndpoints = require('express-list-endpoints');

export class Server {
  public config: Config;
  public app: express.Application;
  public listener: http.Server | undefined;

  constructor(config: Config) {
    this.config = config;

    this.app = express();

    this.app.set('env', 'production');
    this.app.set('verbose', config.verbose);

    this.app.use(bodyParser.json({}));
    this.app.use(middleware.Welcome(config));

    this.app.options('*', cors.CorsOptions);
    this.app.use(cors.Cors('http://localhost:8080'));

    this.app.use('/login', user.Router(config));
    this.app.use('/account', account.Router(config));
    this.app.use('/operation', operation.Router(config));
    this.app.use('/category', category.Router(config));

    this.app.use('*', middleware.NotFound);
    this.app.use(middleware.ErrorHandler(config));
  }

  public Start(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.listener = this.app.listen(this.config.port, this.config.host);

      this.listener.on('listening', () => {
        resolve();
      });
    });
  }

  public Stop(uuid: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      if (this.listener == undefined)
        return reject(new Error("Server: cannot Stop because it's not started"));

      // Waits for pending connections
      this.listener.on('close', () => {
        logger.debug(`[${uuid}] No more clients!`);

        resolve();
      });

      // Stops accepting incoming connections
      this.listener.close((err: Error) => {
        logger.debug(`[${uuid}] HTTP listener closed!`);

        if (err != undefined)
          return reject(err);
      });
    });
  }

  public ListEndpoints(): void {
    interface Endpoint {
      path: string
      methods: string[]
    }

    let endpoints = expressEndpoints(this.app) as Endpoint[];
    let maxMethodsLen = 0;

    let dict: { [path: string]: string[] } = endpoints
      .filter((endpoint: Endpoint) => { return endpoint.path != '*'; })
      .sort((e: Endpoint, f: Endpoint) => { return e.path > f.path ? 1 : -1; })
      .reduce((acc: { [path: string]: string[] }, endpoint: Endpoint) => {
        if (acc[endpoint.path] == undefined)
          acc[endpoint.path] = endpoint.methods;

        else
          acc[endpoint.path] = acc[endpoint.path].concat(endpoint.methods);

        let len = acc[endpoint.path].join(',').length;
        if (len > maxMethodsLen)
          maxMethodsLen = len;

        return acc;
      }, {});

    let str = Object.keys(dict).reduce((acc: string, path: string) => {
      let spaces = maxMethodsLen - dict[path].join(',').length;
      return `${acc}  ${dict[path]} ${' '.repeat(spaces)} ${path}\n`;
    }, '');

    logger.debug(`Endpoints:\n${str}`);
  }
}
