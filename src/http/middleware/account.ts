import * as express from 'express';

import { Config } from '../../config';
import { Resource } from '../../resource/resource';
import {
  AccountModel, AccountDocument,
  OperationModel, OperationDocument,
  CategoryModel, CategoryDocument,
  OperationGroupBy
} from '../../mongo/mongo';
import { NewRandomUuid } from '../../uuid';
import * as http from '../http';
import * as middleware from './middleware';
import * as auth from './auth';
import * as joi from './joi';

export function Router(config: Config): express.Router {
  let router = express.Router();

  router.use(auth.Auth(config));

  router.post('', CreateAccount);
  router.get('/:id', ReadAccount);
  router.post('/:id/operation', AddOperation);
  router.get('/:id/operation/di', ReadOperation);
  router.get('/:id/group', GroupOperations);
  router.get('/:id/search', SearchOperations);
  router.post('/:id/import', ImportOperations);

  return router;
}

function CreateAccount(
  req: express.Request,
  resp: express.Response,
  next: express.NextFunction): void {

  let account: AccountDocument;

  joi.CreateAccount.validate(req.body)
    .then(() => {
      account = new AccountModel.model({
        uuid: NewRandomUuid(),
        owner: req.requester._id,
        name: req.body.name
      });

      return AccountModel.save(req.uuid, account);
    })
    .then(() => {
      resp
        .status(201)
        .location(`/account/${account.uuid}`)
        .end();
    })
    .catch(next);
}

function ReadAccount(
  req: express.Request,
  resp: express.Response,
  next: express.NextFunction): void {

  let account: AccountDocument;

  joi.Uuid.validate(req.params.id)
    .then(() => {
      return AccountModel.FindOneOwnedBy(req.uuid, req.requester, { uuid: req.params.id });
    })
    .then((doc: AccountDocument | null) => {
      if (doc == null)
        throw http.BadRequest({
          body: { errors: [{ name: 'INVALID_ACCOUNT' }] }
        });

      account = doc;

      return OperationModel.FindOperationsOf(req.uuid, account);
    })
    .then((operations: OperationDocument[]) => {
      account.operations = operations;

      resp
        .status(200)
        .json(account.Public());
    })
    .catch(next);
}

function AddOperation(
  req: express.Request,
  resp: express.Response,
  next: express.NextFunction): void {

  let account: AccountDocument;
  let operation: OperationDocument;

  joi.Uuid.validate(req.params.id)
    .then(() => { return joi.AddOperation.validate(req.body); })
    .then(() => {
      return AccountModel.FindOneOwnedBy(req.uuid, req.requester, { uuid: req.params.id });
    })
    .then((doc: AccountDocument | null) => {
      if (doc == null)
        throw http.BadRequest({
          body: { errors: [{ name: 'INVALID_ACCOUNT' }] }
        });

      account = doc;

      if (req.body.categories == undefined)
        return [];

      return CategoryModel.Find(req.uuid, req.body.categories, { _id: 1 });
    })
    .then((categories: CategoryDocument[]) => {
      operation = new OperationModel.model({
        uuid: NewRandomUuid(),
        name: req.body.name,
        date: new Date(req.body.date),
        amount: req.body.amount,
        categories: categories.map((category: CategoryDocument) => {
          return category._id
        }),
        account: account._id
      });

      return OperationModel.save(req.uuid, operation);
    })
    .then(() => {
      resp
        .status(201)
        .location(`/operation/${operation.uuid}`)
        .end();
    })
    .catch(next);
}

function ImportOperations(
  req: express.Request,
  resp: express.Response,
  next: express.NextFunction): void {

  // TODO: import CSV file
}

function GroupOperations(
  req: express.Request,
  resp: express.Response,
  next: express.NextFunction): void {

  let params: any = {};

  joi.Uuid.validate(req.params.id)
    .then(() => { return joi.GroupOperations.validate(req.query); })
    .then(() => {
      params = {
        uuid: req.uuid,
        from: req.query.from == undefined ? new Date() : new Date(req.query.from),
        to: req.query.to == undefined ? new Date() : new Date(req.query.to),
        size: req.query.size == undefined ? middleware.MAX_BODY_LENGTH : parseInt(req.query.size),
        groupBy: req.query.by
      };

      return AccountModel.FindOneOwnedBy(req.uuid, req.requester, { uuid: req.params.id });
    })
    .then((account: AccountDocument | null) => {
      if (account == null)
        throw http.BadRequest({
          body: { errors: [{ name: 'INVALID_ACCOUNT' }] }
        });

      params.account = account;

      if (req.query.categories == undefined)
        return [];

      return CategoryModel.Find(req.uuid, req.query.categories.split(','), { _id: 1 });
    })
    .then((categories: CategoryDocument[]) => {
      params.categories = categories;

      if (params.groupBy == OperationGroupBy.Category)
        return OperationModel.SearchByCategory(params);

      else if (params.groupBy == OperationGroupBy.Day ||
        params.groupBy == OperationGroupBy.Month ||
        params.groupBy == OperationGroupBy.Year)
        return OperationModel.SearchByDate(params);

      else if (params.groupBy == OperationGroupBy.DayAndCategory ||
        params.groupBy == OperationGroupBy.MonthAndCategory ||
        params.groupBy == OperationGroupBy.YearAndCategory)
        return OperationModel.SearchByDateAndCategory(params);

      else
        throw http.BadRequest({
          body: { errors: [{ name: 'INVALID_GROUP_BY' }] }
        });
    })
    .then((results: Resource | null) => {
      if (results == null)
        throw http.NotFound({
          body: { errors: [{ message: 'Operation not found' }] }
        });

      resp
        .status(200)
        .json(results.Public());
    })
    .catch(next);
}

function SearchOperations(
  req: express.Request,
  resp: express.Response,
  next: express.NextFunction): void {

  joi.Uuid.validate(req.params.id)
    .then(() => { return joi.SearchOperations.validate(req.query); })
    .then(() => {
      resp
        .status(501)
        .end();
    })
    .catch(next);
}

function ReadOperation(
  req: express.Request,
  resp: express.Response,
  next: express.NextFunction): void {

  joi.Uuid.validate(req.params.id)
    .then(() => { return joi.Uuid.validate(req.params.di); })
    .then(() => {
      return AccountModel.FindOneOwnedBy(req.uuid, req.requester, { uuid: req.params.id });
    })
    .then((doc: AccountDocument | null) => {
      if (doc == null)
        throw http.BadRequest({
          body: { errors: [{ name: 'INVALID_ACCOUNT' }] }
        });

      return OperationModel.FindOneBy(req.uuid, { uuid: req.params.di });
    })
    .then((operation: OperationDocument | null) => {
      if (operation == null)
        throw http.NotFound({
          message: `ReadOperation failed: operations not found`
        });

      resp
        .status(200)
        .json(operation.Public());
    })
    .catch(next);
}
