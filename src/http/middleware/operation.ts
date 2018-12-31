import * as express from 'express';

import { Config } from '../../config';
import { OperationModel, OperationDocument } from '../../mongo/mongo';
import * as auth from './auth';
import * as joi from './joi';
import * as http from '../http';

export function Router(config: Config): express.Router {
  let router = express.Router();

  router.use(auth.Auth(config));

  router.get('/:id', ReadOperation);

  return router;
}

function ReadOperation(
  req: express.Request,
  resp: express.Response,
  next: express.NextFunction): void {

  joi.Uuid.validate(req.params.id)
    .then(() => {
      return OperationModel.FindOneBy(req.uuid, { uuid: req.params.id });
    })
    .then((operation: OperationDocument | null) => {
      if (operation == null)
        throw http.NotFound();

      resp
        .status(200)
        .json(operation.Public());
    })
    .catch(next);
}
