import * as jsonwebtoken from 'jsonwebtoken';

export function Sign(
  payload: string | Object | Buffer,
  secret: string,
  expiresIn: string = '1h'): Promise<string> {

  return new Promise<string>((resolve, reject) => {
    let options: any = {
      algorithm: 'HS512',
      expiresIn: expiresIn
    };

    jsonwebtoken.sign(payload, secret, options, (err: Error, token: string) => {
      if (err != undefined)
        return reject(err);

      resolve(token);
    });
  });
}

export function Verify(token: string, secret: string): Promise<any> {
  return new Promise<any>((resolve, reject) => {
    jsonwebtoken.verify(token, secret, ((err: Error, decoded: any) => {
      if (err != undefined)
        return reject(err);

      resolve(decoded);
    }));
  });
}
