import * as mongoose from 'mongoose';

import { Model } from './model';
import { Account } from '../resource/account';
import { UserDocument } from './user';

export interface AccountDocument extends Account, mongoose.Document { }

export const AccountSchema = new mongoose.Schema({
  uuid: {
    type: String,
    required: true,
    index: true,
    unique: true
  },

  name: {
    type: String,
    required: true
  },

  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users'
  },

  //   operations: [{
  //   type: mongoose.Schema.Types.ObjectId,
  //   ref: 'operations'
  // }]
}, {
    versionKey: false
  });

AccountSchema.method('Public', Account.prototype.Public);
AccountSchema.method('Equals', Account.prototype.Equals);

export class accountModel extends Model<AccountDocument> {
  constructor(debug: boolean) {
    super('accounts', AccountSchema, debug);
  }

  public FindOneOwnedBy(
    uuid: string,
    owner: UserDocument,
    conditions: any): Promise<AccountDocument | null> {

    return this
      .findOne(uuid, Object.assign(conditions, { owner: owner._id }))
      .exec();
  }

  public FindAccountsOf(uuid: string, user: UserDocument): Promise<AccountDocument[]> {
    return this.find(uuid, { owner: user._id })
      .exec()
      .then((accounts: AccountDocument[] | null) => {
        if (accounts == null)
          return [];

        return accounts;
      })
      .catch((err: any) => { throw err; });
  }
}
