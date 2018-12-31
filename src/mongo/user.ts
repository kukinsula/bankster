import * as mongoose from 'mongoose';

import { Model } from './model';
import { User } from '../resource/user';
import { CategoryDocument } from './category';

export interface UserDocument extends User, mongoose.Document { }

export const UserSchema = new mongoose.Schema({
  uuid: {
    type: String,
    required: true,
    index: true,
    unique: true
  },

  email: {
    type: String,
    required: true,
    index: true,
    unique: true
  },

  password: {
    type: String,
    required: true
  },

  token: {
    type: String
  },

  firstName: {
    type: String,
    required: true,
  },

  lastName: {
    type: String,
    required: true,
  },

  categories: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'categories'
  }]
}, {
    versionKey: false
  });

UserSchema.method('Public', User.prototype.Public);
UserSchema.method('Equals', User.prototype.Equals);

export class userModel extends Model<UserDocument> {
  constructor(debug: boolean) {
    super('users', UserSchema, debug);
  }

  private findOneBy(uuid: string, condition: any): Promise<UserDocument | null> {
    return this.findOne(uuid, condition)
      .populate('categories')
      .exec();
  }

  public FindOneById(uuid: string, _id: string): Promise<UserDocument | null> {
    return this.findOneBy(uuid, { _id: _id });
  }

  public FindOneByUuid(uuid: string, id: string): Promise<UserDocument | null> {
    return this.findOneBy(uuid, { uuid: id });
  }

  public FindOneByEmail(uuid: string, email: string): Promise<UserDocument | null> {
    return this.findOneBy(uuid, { email: email });
  }

  public FindOneByToken(uuid: string, token: string): Promise<UserDocument | null> {
    return this.findOneBy(uuid, { token: token });
  }

  public Signin(uuid: string, _id: string, token: string): Promise<UserDocument | null> {
    return this.findOneAndUpdate(uuid, { _id: _id }, { $set: { token: token } }).exec();
  }

  public AddCategory(
    uuid: string,
    user: UserDocument,
    category: CategoryDocument): Promise<void> {

    return this.findOneAndUpdate(uuid,
      { _id: user._id },
      { $push: { categories: category._id } }
    )
      .exec()
      .then((user: UserDocument | null) => {
        if (user == null)
          throw new Error('UserModel.AddCategory failed: user not found');
      })
      .catch((err: any) => { throw err; });
  }
}
