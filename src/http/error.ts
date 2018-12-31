export interface RawHttpError {
  // For logs
  name?: string
  message?: string

  // For HTTP client
  code?: number
  body?: HttpErrorBody
}

export interface HttpErrorBody {
  name?: string,
  message?: string,
  errors: [{
    name?: string,
    message?: string
  }]
}

export class HttpError extends Error {
  public code: number;
  public body?: any;

  constructor(raw: RawHttpError = {}) {
    super(raw.message || '');

    Object.setPrototypeOf(this, HttpError.prototype);

    this.name = raw.name || 'HttpError';
    this.code = raw.code || 500;
    this.body = raw.body;
  }

  public toString(): string {
    return JSON.stringify(this);
  }
}

export function BadRequest(raw: RawHttpError = {}): HttpError {
  return new HttpError({
    name: 'BadRequest',
    message: raw.message,
    code: 400,
    body: raw.body
  });
}

export function Unauthorized(raw: RawHttpError = {}): HttpError {
  return new HttpError({
    name: 'Unauthorized',
    message: raw.message,
    code: 401,
    body: raw.body
  });
}

export function Forbidden(raw: RawHttpError = {}): HttpError {
  return new HttpError({
    name: 'Forbidden',
    message: raw.message,
    code: 403,
    body: raw.body
  });
}

export function NotFound(raw: RawHttpError = {}): HttpError {
  return new HttpError({
    name: 'NotFound',
    message: raw.message,
    code: 404,
    body: raw.body
  });
}

export function InternalServerError(raw: RawHttpError = {}): HttpError {
  return new HttpError({
    name: 'InternalServerError',
    message: raw.message,
    code: 500,
    body: raw.body
  });
}
