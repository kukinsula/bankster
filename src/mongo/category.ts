import * as mongoose from 'mongoose';

import { Category } from '../resource/category';
import { Model } from './model';

export interface CategoryDocument extends Category, mongoose.Document { }

export const CategorySchema = new mongoose.Schema({
  uuid: {
    type: String,
    required: true,
    index: true,
    unique: true
  },

  name: {
    type: String,
    required: true,
    index: true,
    unique: true
  },

  color: {
    type: String,
    required: true
  }
}, {
    versionKey: false
  });

CategorySchema.method('Public', Category.prototype.Public);
CategorySchema.method('Equals', Category.prototype.Equals);

export class categoryModel extends Model<CategoryDocument> {
  constructor(debug: boolean) {
    super('categories', CategorySchema, debug);
  }

  public FindOne(uuid: string, id: string): Promise<CategoryDocument | null> {
    return this.findOne(uuid, {
      $or: [
        { _id: id },
        { uuid: id }
      ]
    }).exec();
  }

  public Find(uuid: string, ids: string[], fields: any = {}): Promise<CategoryDocument[]> {
    return this.find(uuid, {
      $or: [
        { uuid: { $in: ids } },
        { name: { $in: ids } },
      ]
    }, fields)
      .exec()
      .then((categories: CategoryDocument[] | null) => {
        if (categories == null)
          return [];

        return categories;
      })
      .catch((err: any) => { throw err; });
  }
}
