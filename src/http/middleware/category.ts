import * as express from 'express';

import { Config } from '../../config';
import { NewRandomUuid } from '../../uuid';
import { CategoryModel, UserModel } from '../../mongo/mongo';
import * as auth from './auth';

export function Router(config: Config): express.Router {
  let router = express.Router();

  router.use(auth.Auth(config));

  router.post('', CreateCategory);

  return router;
}

function CreateCategory(
  req: express.Request,
  resp: express.Response,
  next: express.NextFunction): void {

  let category = new CategoryModel.model({
    uuid: NewRandomUuid(),
    name: req.body.name,
    color: req.body.color
  });

  CategoryModel.save(req.uuid, category)
    .then(() => { return UserModel.AddCategory(req.uuid, req.requester, category); })
    .then(() => {
      resp
        .status(201)
        .end();
    })
    .catch(next);
}
