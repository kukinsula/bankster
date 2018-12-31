import { Client, AxiosResponse } from './client';

import {
  OperationGroupBy, Statistics, SearchOperationParams,
  SearchOperationByCategoryResult, SearchOperationsByCategoryResult
} from '../../../mongo/operation';

class Bankster extends Client {
  constructor() {
    super('http://127.0.0.1:9000');
  }

  // LOGIN

  public Signin(email: string, password: string): Promise<string> {
    return this.post('/login/signin', {
      data: {
        email,
        password,
      },
    })
      .then((resp: AxiosResponse) => {
        if (resp.status !== 200) {
          throw resp;
        }

        return resp.data.token;
      })
      .catch((err: any) => { throw err; });
  }

  public Me(token: string): Promise<any> {
    return this.get('/login/me', {
      headers: {
        'x-access-token': token
      }
    })
      .then((resp: AxiosResponse) => {
        if (resp.status !== 200)
          throw resp;

        return resp.data;
      })
      .catch((err: any) => { throw err; });
  }

  // ACCOUNT

  public GetAccount(token: string, id: string): Promise<any> {
    return this.get(`/account/${id}`, {
      headers: {
        'x-access-token': token
      }
    })
      .then((resp: AxiosResponse) => {
        if (resp.status !== 200)
          throw resp;

        return resp.data;
      })
      .catch((err: any) => { throw err; });
  }

  // OPERATION

  public GetOperation(token: string, id: string): Promise<any> {
    return this.get(`/operation/${id}`, {
      headers: {
        'x-access-token': token
      }
    })
      .then((resp: AxiosResponse) => {
        if (resp.status !== 200)
          throw resp;

        return resp.data;
      })
      .catch((err: any) => { throw err; });
  }

  public SearchByCategory(
    token: string,
    params: SearchOperationParams): Promise<SearchOperationsByCategoryResult> {

    return this.get(`/account/${params.account.uuid}/group`, {
      headers: {
        'x-access-token': token
      },
      params: {
        by: params.groupBy,
        from: params.from,
        to: params.to,
        size: params.size,
      }
    })
      .then((resp: AxiosResponse) => {
        if (resp.status !== 200) {
          throw resp;
        }

        return new SearchOperationsByCategoryResult(resp.data);
      })
      .catch((err: any) => { throw err; });
  }
}

export default new Bankster();
