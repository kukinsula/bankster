import * as express from 'express';

import { Config } from '../../config';
import { UserModel, UserDocument } from '../../mongo/mongo';
import * as middleware from './middleware';
import * as http from '../http';
import * as jwt from '../../jwt';

export function Auth(config: Config): express.RequestHandler {
  return (
    req: express.Request,
    resp: express.Response,
    next: express.NextFunction): void => {

    let token = req.headers[middleware.ACCESS_TOKEN_HEADER] as string;

    if (token == undefined)
      throw http.Unauthorized({
        message: 'Auth failed: access token missing'
      });

    jwt.Verify(token, config.secret)
      .then(() => { return UserModel.FindOneByToken(req.uuid, token); })
      .then((user: UserDocument | null) => {
        if (user == null)
          throw http.Unauthorized({
            message: 'Auth failed: user not found'
          });

        req.requester = user;

        next();
      })
      .catch(next);
  };
}
