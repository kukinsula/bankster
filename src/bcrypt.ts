import * as bcrypt from 'bcrypt';

export function Hash(rounds: number, pwd: string): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    bcrypt.genSalt(rounds, (err: Error, salt: string) => {
      if (err != undefined)
        return reject(err);

      bcrypt.hash(pwd, salt, (err: Error, encrypted: string) => {
        if (err != undefined)
          return reject(err);

        resolve(encrypted);
      });
    });
  });
}

export function Compare(clear: string, hash: string): Promise<boolean> {
  return new Promise<boolean>((resolve, reject) => {
    bcrypt.compare(clear, hash, (err: Error, result: boolean) => {
      if (err != undefined)
        return reject(err);

      resolve(result);
    });
  });
}
