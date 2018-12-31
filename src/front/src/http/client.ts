import * as axios from 'axios';

export class Client {
  protected instance: axios.AxiosInstance;

  constructor(url: string) {
    this.instance = axios.default.create({
      baseURL: url,
    });
  }

  public request(config: axios.AxiosRequestConfig): axios.AxiosPromise {
    if (config.headers === undefined) {
      config.headers = {};
    }

    // config.headers['x-request-id'] = uuid;
    config.headers['origin'] = 'http://localhost:8080';

    return this.instance.request(config);
  }

  public get(url: string, config: axios.AxiosRequestConfig = {}): axios.AxiosPromise {
    config.url = url;
    config.method = 'GET';

    return this.request(config);
  }

  public post(url: string, config: axios.AxiosRequestConfig): axios.AxiosPromise {
    config.url = url;
    config.method = 'POST';

    return this.request(config);
  }

  public put(url: string, config: axios.AxiosRequestConfig): axios.AxiosPromise {
    config.url = url;
    config.method = 'PUT';

    return this.request(config);
  }

  public delete(url: string, config: axios.AxiosRequestConfig): axios.AxiosPromise {
    config.url = url;
    config.method = 'DELETE';

    return this.request(config);
  }
}

export { AxiosResponse, AxiosPromise } from 'axios';
