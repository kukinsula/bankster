import { UserDocument } from '../mongo/user';

declare global {
  namespace Express {
    export interface Request {
      uuid: string
      start: [number, number]

      token: string
      requester: UserDocument
    }
  }
}
