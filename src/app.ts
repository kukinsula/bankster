require('source-map-support').install();

import { logger, InitLogger } from './logger';
import { Config } from './config';
import { Server } from './http/server';
import { NewRandomUuid } from './uuid';
import * as mongo from './mongo/mongo';

// TODO:
//
// * Paginer les comptes par utilisateur et les opérations par compte
//
// * Import de fichier CSV
//
// * Vue d'un compte :
//     - automatisation : operations réccurentes
//     - estimation pour une date future

function main(): void {
  let uuid = NewRandomUuid();
  let config: Config = {
    host: '127.0.0.1',
    port: 9000,

    verbose: true,

    mongo: {
      uri: 'mongodb://localhost:27017/bankster',
      verbose: true
    },

    log: {
      stackError: true,
      console: {
        level: 'debug'
      }
    },

    saltRounds: 10,
    secret: 'ThisIsMyTopSecret',
    expiresIn: '1h'
  };

  InitLogger(config);

  let server = new Server(config);
  let signals: NodeJS.Signals[] = ['SIGINT', 'SIGTERM'];

  signals.forEach((signal: NodeJS.Signals) => {
    process.on(signal, cleanup(uuid, server, signal));
  });

  server.ListEndpoints();

  mongo.Connect(uuid, config)
    .then(() => { return server.Start(); })
    .then(() => { logger.debug(`[${uuid}] Bankster is started!`); })
    .catch((err: any) => { exit(1, err); });
}

function cleanup(uuid: string, server: Server, signal: NodeJS.Signals) {
  return () => {
    logger.info(`[${uuid}] ${signal} signal received, stopping Bankster...`);

    server.Stop(uuid)
      .then(() => { return mongo.Close(); })
      .then(() => { exit(0); })
      .catch((err: Error) => { exit(2, err); });
  };
};

function exit(code: number, err?: Error): void {
  if (err != undefined)
    console.log(`${err.stack}`);

  process.exit(code);
}

main();
