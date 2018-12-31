import * as express from 'express';

import * as http from '../http';

export function CorsOptions(
  req: express.Request,
  resp: express.Response,
  next: express.NextFunction): void {

  resp.header('Access-Control-Allow-Origin', 'http://localhost:8080');
  resp.header('Access-Control-Allow-Methods', 'POST,GET');
  resp.header('Access-Control-Allow-Headers', 'content-type,x-access-token');

  resp.status(200).end();
}

export function Cors(from: string):
  (req: express.Request,
    resp: express.Response,
    next: express.NextFunction) => void {

  return (req: express.Request,
    resp: express.Response,
    next: express.NextFunction): void => {

    let origin = req.headers['origin'];

    if (from != origin)
      return next(http.Unauthorized({
        body: {
          errors: [{
            name: 'UNAUTHORIZED_CORS',
            message: `CORS: domain '${origin}' is not authorized`
          }]
        }
      }));

    next();
  };
}
