import * as express from 'express';

import { Config } from '../../config';
import { UserModel, UserDocument, AccountModel, AccountDocument } from '../../mongo/mongo';
import { NewRandomUuid } from '../../uuid';
import * as http from '../http';
import * as auth from './auth';
import * as joi from './joi';
import * as bcrypt from '../../bcrypt';
import * as jwt from '../../jwt';

export function Router(config: Config): express.Router {
  let router = express.Router();

  router.post('/signup', Signup(config));
  router.post('/signin', Signin(config));
  router.get('/me', auth.Auth(config), Me);

  return router;
}

function Signup(config: Config): express.RequestHandler {
  return (
    req: express.Request,
    resp: express.Response,
    next: express.NextFunction): void => {

    let user: UserDocument;

    joi.Signup.validate(req.body)
      .then(() => { return bcrypt.Hash(config.saltRounds, req.body.password); })
      .then((pwd: string) => {
        user = new UserModel.model({
          uuid: NewRandomUuid(),
          email: req.body.email,
          firstName: req.body.firstName,
          lastName: req.body.lastName,
          password: pwd,
          categories: []
        });

        return UserModel.save(req.uuid, user);
      })
      .then(() => {
        resp
          .status(201)
          .location(`/user/${user.uuid}`)
          .end();
      })
      .catch(next)
  };
}

function Signin(config: Config): express.RequestHandler {
  return (req: express.Request,
    resp: express.Response,
    next: express.NextFunction): void => {

    let user: UserDocument;
    let token: string;

    joi.Signin.validate(req.body)
      .then(() => { return UserModel.FindOneByEmail(req.uuid, req.body.email); })
      .then((doc: UserDocument | null) => {
        if (doc == null)
          throw http.Unauthorized();

        user = doc;

        return bcrypt.Compare(req.body.password, user.password);
      })
      .then((authenticated: boolean) => {
        if (!authenticated)
          throw http.Unauthorized();

        return jwt.Sign({ email: req.body.email }, config.secret, config.expiresIn);
      })
      .then((tok: string) => {
        token = tok;

        return UserModel.Signin(req.uuid, user._id, token);
      })
      .then(() => {
        resp
          .status(200)
          .json({ token: token });
      })
      .catch(next)
  };
}

function Me(
  req: express.Request,
  resp: express.Response,
  next: express.NextFunction): void {

  AccountModel.FindAccountsOf(req.uuid, req.requester)
    .then((accounts: AccountDocument[]) => {
      req.requester.accounts = accounts;

      resp
        .status(200)
        .json(req.requester.Public());
    })
    .catch(next);
}
