import * as mongoose from 'mongoose';

// TODO: check for mongoose update if this is still necessary.
mongoose.set('useCreateIndex', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useNewUrlParser', true);

import { logger } from '../logger';

export class Model<T extends mongoose.Document> {
  private static conn?: mongoose.Connection;
  private collection: string;
  public model: mongoose.Model<T>;
  public debug: boolean;

  constructor(collection: string, schema: mongoose.Schema, debug: boolean = false) {
    if (Model.conn == undefined)
      throw new Error('Model: no connection set');

    this.model = Model.conn.model<T>(collection, schema);
    this.collection = collection;
    this.debug = debug;
  }

  public static SetConnection(conn: mongoose.Connection): void {
    Model.conn = conn;
  }

  private log(uuid: string, name: string, args: any[]): void {
    let str = args.reduce((acc: string, current: any) => {
      if (current == null || current == undefined)
        return acc;

      if (acc == '')
        return JSON.stringify(current);

      return `${acc}, ${JSON.stringify(current)}`;
    }, '');

    logger.debug(`[${uuid}] Mongoose: ${this.collection}.${name}(${str})`);
  }

  private exec(uuid: string, fn: Function, name: string, ...args: any[]): any {
    let result = fn.apply(this.model, args);

    if (this.debug)
      this.log(uuid, name, args);

    return result;
  }

  public findOne(
    uuid: string,
    conditions?: any,
    projections?: any,
    options?: any): mongoose.DocumentQuery<T | null, T> {

    return this.exec(uuid, this.model.findOne, 'findOne', conditions, projections, options);
  }

  public findOneAndRemove(
    uuid: string,
    conditions: any,
    options?: {
      sort?: any;
      maxTimeMS?: number;
      select?: any;
    }): mongoose.DocumentQuery<T | null, T> {

    return this.exec(uuid, this.model.findOneAndRemove, 'findOneAndRemove', conditions, options);
  }

  public findOneAndUpdate(
    uuid: string,
    conditions: any,
    update: any,
    options?: mongoose.ModelFindOneAndUpdateOptions): mongoose.DocumentQuery<T | null, T> {

    return this.exec(uuid, this.model.findOneAndUpdate, 'findOneAndUpdate', conditions, update, options);
  }

  public find(
    uuid: string,
    conditions: any = {},
    projections?: any,
    options?: any): mongoose.DocumentQuery<T[] | null, T> {

    return this.exec(uuid, this.model.find, 'find', conditions, projections, options);
  }

  public findById(
    uuid: string,
    id: any,
    projections?: any,
    options?: any): mongoose.DocumentQuery<T | null, T> {

    return this.exec(uuid, this.model.findById, 'findById', id, projections, options);
  }

  public findByIdAndRemove(
    uuid: string,
    id: any,
    options?: {
      sort?: any;
      select?: any;
    }): mongoose.DocumentQuery<T | null, T> {

    return this.exec(uuid, this.model.findByIdAndRemove, 'findByIdAndRemove', id, options);
  }

  public findByIdAndUpdate(uuid: string, id: any, update: any,
    options?: mongoose.ModelFindByIdAndUpdateOptions): mongoose.DocumentQuery<T | null, T> {

    return this.exec(uuid, this.model.findByIdAndUpdate, 'findByIdAndUpdate', id, update, options);
  }

  public estimatedDocumentCount(uuid: string, conditions: any): mongoose.Query<number> {
    return this.exec(uuid, this.model.estimatedDocumentCount, 'estimatedDocumentCount', conditions);
  }

  public UpdateMany(uuid: string, conditions: any, updates: any): mongoose.Query<any> {
    return this.exec(uuid, this.model.updateMany, 'updateMany', conditions, updates);
  }

  public UpdateOne(uuid: string, conditions: any, updates: any): mongoose.Query<any> {
    return this.exec(uuid, this.model.updateOne, 'updateOne', conditions, updates);
  }

  public deleteMany(uuid: string, conditions: any): mongoose.Query<void> {
    return this.exec(uuid, this.model.deleteMany, 'deleteMany', conditions);
  }

  public deleteOne(uuid: string, conditions: any): mongoose.Query<void> {
    return this.exec(uuid, this.model.deleteOne, 'deleteOne', conditions);
  }

  public aggregate(uuid: string, ...aggregations: any[]): mongoose.Aggregate<any[]> {
    return this.exec(uuid, this.model.aggregate, 'aggregate', aggregations);
  }

  public createIndexes(uuid: string): Promise<void> {
    return this.exec(uuid, this.model.createIndexes, 'createIndexes');
  }

  public save(uuid: string, document: T): Promise<T> {
    return this.exec(uuid, document.save.bind(document), 'save', document);
  }

  public insertMany(uuid: string, documents: T[]): Promise<T[]> {
    return this.exec(uuid, this.model.insertMany, 'insertMany', documents);
  }
}
