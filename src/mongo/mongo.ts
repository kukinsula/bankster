import * as mongoose from 'mongoose';

import { logger } from '../logger';
import { Config } from '../config';
import { Model } from './model';
import { userModel } from './user';
import { accountModel } from './account';
import { operationModel } from './operation';
import { categoryModel } from './category';

export function Connect(uuid: string, config: Config): Promise<void> {
  let options = {
    autoReconnect: true,
    reconnectTries: Number.MAX_VALUE,
    reconnectInterval: 500,
    keepAlive: 30000,
    socketTimeoutMS: 30000
  };

  return mongoose.createConnection(config.mongo.uri, options)
    .then((conn: mongoose.Connection) => {
      if (config.mongo.verbose != undefined && config.mongo.verbose) {
        conn.on('open', () => { logger.debug(`[${uuid}] Mongoose opened!`); });
        conn.on('connected', () => { logger.debug(`[${uuid}] Mongoose connected!`); });
        conn.on('disconnected', () => { logger.debug(`[${uuid}] Mongoose disconnected!`); });
        conn.on('reconnected', () => { logger.debug(`[${uuid}] Mongoose reconnected!`); });
        conn.on('close', () => { logger.debug(`[${uuid}] Mongoose closed!`); });
        conn.on('error', (err: any) => { logger.error(`Mongoose error: ${err}`); });
      }

      return initModels(uuid, conn, config.mongo.verbose);
    })
    .catch((err: any) => {
      throw new Error(`Mongo connect to '${config.mongo.uri}' failed: ${err.stack}`);
    });
}

export let
  UserModel: userModel,
  AccountModel: accountModel,
  OperationModel: operationModel,
  CategoryModel: categoryModel;

function initModels(uuid: string, conn: mongoose.Connection, debug: boolean = false): Promise<void> {
  Model.SetConnection(conn);

  UserModel = new userModel(debug);
  AccountModel = new accountModel(debug);
  OperationModel = new operationModel(debug);
  CategoryModel = new categoryModel(debug);

  let models: Model<any>[] = [
    UserModel,
    AccountModel,
    OperationModel,
    CategoryModel,
  ];

  return Promise.all(Object.values(models).map((model: Model<any>) => {
    return model.createIndexes(uuid);
  }))
    .then(() => { })
    .catch((err: any) => { throw err; });
}

export function Close(): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    mongoose.connection.close((err: Error) => {
      if (err != undefined)
        return reject(err);

      resolve();
    });
  });
}

export * from './model';
export * from './user';
export * from './account';
export * from './operation';
export * from './category';
