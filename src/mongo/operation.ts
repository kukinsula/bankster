import * as mongoose from 'mongoose';

import { Model } from './model';
import { Resource } from '../resource/resource';
import { Operation } from '../resource/operation';
import { Category } from '../resource/category';
import { AccountDocument } from './account';
import { CategoryDocument } from './category';

export interface OperationDocument extends Operation, mongoose.Document { }

export enum OperationGroupBy {
  Category = 'CATEGORY',

  Day = 'DAY',
  Month = 'MONTH',
  Year = 'YEAR',

  DayAndCategory = 'DAY_AND_CATEGORY',
  MonthAndCategory = 'MONTH_AND_CATEGORY',
  YearAndCategory = 'YEAR_AND_CATEGORY'
}

export interface Statistics {
  total: number
  count: number
  average: number
  min: number
  max: number
}

export interface SearchOperationParams {
  uuid: string
  account: AccountDocument
  categories: CategoryDocument[]
  from: Date
  to: Date
  size: number
  groupBy?: OperationGroupBy
}

export interface SearchOperationByCategoryResult extends Statistics {
  category: CategoryDocument
  operations: OperationDocument[]
}

export class SearchOperationsByCategoryResult implements Resource, Statistics {
  public results: SearchOperationByCategoryResult[]
  public total: number
  public count: number
  public average: number
  public min: number
  public max: number

  constructor(raw: any = {}) {
    this.results = raw.results;
    this.total = raw.total;
    this.count = raw.count;
    this.average = raw.average;
    this.min = raw.min;
    this.max = raw.max;
  }

  public Public(): any {
    return {
      results: this.results.map((result: SearchOperationByCategoryResult) => {
        return {
          category: result.category.Public(),
          operations: result.operations.map((operation: OperationDocument) => {
            return {
              uuid: operation.uuid,
              name: operation.name,
              date: operation.date,
              amount: parseFloat(operation.amount.toFixed(2))
            };
          }),
          total: parseFloat(result.total.toFixed(2)),
          count: result.count,
          average: parseFloat(result.average.toFixed(2)),
          min: parseFloat(result.min.toFixed(2)),
          max: parseFloat(result.max.toFixed(2))
        };
      }),
      total: parseFloat(this.total.toFixed(2)),
      count: this.count,
      average: parseFloat(this.average.toFixed(2)),
      min: parseFloat(this.min.toFixed(2)),
      max: parseFloat(this.max.toFixed(2))
    };
  }
};

export interface SearchOperationByDateResult extends Statistics {
  date: {
    day?: number
    month?: number
    year?: number
  }
  operations: OperationDocument[]
}

export class SearchOperationsByDateResult implements Resource, Statistics {
  public results: SearchOperationByDateResult[]
  public total: number
  public count: number
  public average: number
  public min: number
  public max: number

  constructor(raw: any = {}) {
    this.results = raw.results;
    this.total = raw.total;
    this.count = raw.count;
    this.average = raw.average;
    this.min = raw.min;
    this.max = raw.max;
  }

  public Public(): any {
    return {
      results: this.results.map((result: SearchOperationByDateResult) => {
        return {
          date: result.date,
          operations: result.operations.map((operation: OperationDocument) => {
            return operation.Public();
          }),
          total: parseFloat(result.total.toFixed(2)),
          count: result.count,
          average: parseFloat(result.average.toFixed(2)),
          min: parseFloat(result.min.toFixed(2)),
          max: parseFloat(result.max.toFixed(2))
        };
      }),
      total: parseFloat(this.total.toFixed(2)),
      count: this.count,
      average: parseFloat(this.average.toFixed(2)),
      min: parseFloat(this.min.toFixed(2)),
      max: parseFloat(this.max.toFixed(2))
    };
  }
}

export interface SearchOperationByDateAndCategorySubResult extends Statistics {
  category: CategoryDocument
  operations: OperationDocument[]
}

export interface SearchOperationByDateAndCategoryResult extends Statistics {
  date: Date
  results: SearchOperationByDateAndCategorySubResult[]
}

export class SearchOperationByDateAndCategoryResults implements Resource, Statistics {
  public results: SearchOperationByDateAndCategoryResult[]
  public total: number
  public count: number
  public average: number
  public min: number
  public max: number

  constructor(raw: any = {}) {
    this.results = raw.results;
    this.total = raw.total;
    this.count = raw.count;
    this.average = raw.average;
    this.min = raw.min;
    this.max = raw.max;
  }

  public Public(): any {
    return {
      results: this.results.map((result: SearchOperationByDateAndCategoryResult) => {
        return {
          date: result.date,

          results: result.results.map((res: SearchOperationByDateAndCategorySubResult) => {
            return {
              category: res.category.Public(),
              operations: res.operations.map((operation: Operation) => {
                return operation.Public()
              }),

              total: parseFloat(res.total.toFixed(2)),
              count: res.count,
              average: parseFloat(res.average.toFixed(2)),
              min: parseFloat(res.min.toFixed(2)),
              max: parseFloat(res.max.toFixed(2))
            };
          }),

          total: parseFloat(result.total.toFixed(2)),
          count: result.count,
          average: parseFloat(result.average.toFixed(2)),
          min: parseFloat(result.min.toFixed(2)),
          max: parseFloat(result.max.toFixed(2))
        };
      }),

      total: parseFloat(this.total.toFixed(2)),
      count: this.count,
      average: parseFloat(this.average.toFixed(2)),
      min: parseFloat(this.min.toFixed(2)),
      max: parseFloat(this.max.toFixed(2))
    };
  }
}

export const OperationSchema = new mongoose.Schema({
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

  date: {
    type: Date,
    required: true
  },

  amount: {
    type: Number,
    required: true
  },

  categories: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'categories'
  }],

  account: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'acounts'
  }
}, {
    versionKey: false
  });

OperationSchema.method('Public', Operation.prototype.Public);
OperationSchema.method('Kind', Operation.prototype.Kind);
OperationSchema.method('Equals', Operation.prototype.Equals);

export class operationModel extends Model<OperationDocument> {
  constructor(debug: boolean) {
    super('operations', OperationSchema, debug);
  }

  public FindOneBy(uuid: string, conditions: any): Promise<OperationDocument | null> {
    return this.findOne(uuid, conditions)
      .populate('categories')
      .exec();
  }

  public FindOperationsOf(
    uuid: string,
    account: AccountDocument): Promise<OperationDocument[]> {

    return this.find(uuid, { account: account._id })
      .populate('categories')
      .sort({ date: -1 })
      .exec()
      .then((operations: OperationDocument[] | null) => {
        if (operations == null)
          return [];

        return operations;
      })
      .catch((err: any) => { throw err; });
  }

  public SearchByCategory(params: SearchOperationParams): Promise<Resource | null> {
    let conditions: any = {
      account: params.account._id,
      date: {
        $gte: params.from,
        $lte: params.to
      }
    };

    if (params.categories.length != 0)
      conditions.categories = {
        $in: params.categories.map((category: CategoryDocument) => {
          return category._id;
        })
      };

    return this.aggregate(params.uuid,
      { $match: conditions },

      { $unwind: '$categories' },

      { $sort: { date: -1 } },

      { $limit: params.size },

      {
        $lookup: {
          from: 'categories',
          localField: 'categories',
          foreignField: '_id',
          as: 'category'
        }
      },

      {
        $group: {
          _id: { category: '$category' },
          operations: {
            $push: {
              _id: '$_id',
              uuid: '$uuid',
              name: '$name',
              date: '$date',
              amount: '$amount'
            }
          },
          total: { $sum: '$amount' },
          count: { $sum: 1 },
          average: { $avg: '$amount' },
          min: { $min: '$amount' },
          max: { $max: '$amount' }
        }
      },

      { $sort: { total: -1 } },

      {
        $project: {
          _id: 0,
          category: { $arrayElemAt: ['$_id.category', 0] },
          operations: 1,
          total: 1,
          count: 1,
          average: 1,
          min: 1,
          max: 1
        }
      },

      {
        $group: {
          _id: null,
          results: {
            $push: {
              category: "$category",
              operations: "$operations",
              total: "$total",
              count: "$count",
              average: "$average",
              min: "$min",
              max: "$max"
            }
          },
          total: { $sum: "$total" },
          count: { $sum: "$count" },
          average: { $avg: "$total" },
          min: { $min: "$min" },
          max: { $max: "$max" }
        }
      }
    )
      .exec()
      .then((results: any[]) => {
        if (results.length == 0)
          return null;

        return new SearchOperationsByCategoryResult({
          results: results[0].results.map((result: any) => {
            return {
              category: new Category(result.category),
              operations: result.operations.map((operation: any) => {
                return new Operation(operation);
              }),

              total: result.total,
              count: result.count,
              average: result.average,
              min: result.min,
              max: result.max
            };
          }),

          total: results[0].total,
          count: results[0].count,
          average: results[0].average,
          min: results[0].min,
          max: results[0].max
        });
      })
      .catch((err: any) => { throw err; });
  }

  public SearchByDate(params: SearchOperationParams): Promise<Resource | null> {
    let conditions: any = {
      account: params.account._id,
      date: {
        $gte: params.from,
        $lte: params.to
      }
    };

    if (params.categories.length != 0)
      conditions.categories = {
        $in: params.categories.map((category: CategoryDocument) => {
          return category._id;
        })
      };

    let groupBy: any = {};

    if (params.groupBy == OperationGroupBy.Day)
      groupBy = {
        'day': { $dayOfMonth: '$date' },
        'month': { $month: '$date' },
        'year': { $year: '$date' }
      };

    else if (params.groupBy == OperationGroupBy.Month)
      groupBy = {
        'month': { $month: '$date' },
        'year': { $year: '$date' }
      };

    else if (params.groupBy == OperationGroupBy.Year)
      groupBy = {
        'year': { $year: '$date' }
      };

    else
      throw new Error(`SearchByDate failed: invalid groupBy ${params.groupBy}`);

    return this.aggregate(params.uuid,
      { $match: conditions },

      { $unwind: '$categories' },

      { $sort: { date: 1 } },

      { $limit: 100 },

      {
        $lookup: {
          from: 'categories',
          localField: 'categories',
          foreignField: '_id',
          as: 'categories'
        }
      },

      {
        $group: {
          _id: { date: groupBy },
          operations: {
            $push: {
              _id: '$_id',
              uuid: '$uuid',
              name: '$name',
              date: '$date',
              amount: '$amount',
              categories: '$categories'
            },
          },
          total: { $sum: '$amount' },
          count: { $sum: 1 },
          average: { $avg: '$amount' },
          min: { $min: '$amount' },
          max: { $max: '$amount' }
        }
      },

      { $sort: { '_id.date.year': 1, '_id.date.month': 1, '_id.date.day': 1 } },

      {
        $group: {
          _id: null,
          results: {
            $push: {
              date: '$_id.date',
              category: '$category',
              operations: '$operations',
              total: '$total',
              count: '$count',
              average: '$average',
              min: '$min',
              max: '$max'
            }
          },
          total: { $sum: '$total' },
          count: { $sum: '$count' },
          average: { $avg: "$total" },
          min: { $min: '$min' },
          max: { $max: '$max' }
        }
      }

    )
      .exec()
      .then((results: any[]) => {
        if (results.length == 0)
          return null;

        return new SearchOperationsByDateResult({
          results: results[0].results.map((result: any) => {
            return {
              date: result.date,
              operations: result.operations.map((operation: any) => {
                return new Operation(Object.assign(operation, {
                  categories: operation.categories.map((category: any) => {
                    return new Category(category);
                  })
                }));
              }),

              total: result.total,
              count: result.count,
              average: result.average,
              min: result.min,
              max: result.max
            }
          }),

          total: results[0].total,
          count: results[0].count,
          average: results[0].average,
          min: results[0].min,
          max: results[0].max
        });
      })
      .catch((err: any) => { throw err; });
  }

  public SearchByDateAndCategory(params: SearchOperationParams): Promise<Resource | null> {
    let conditions: any = {
      account: params.account._id,
      date: {
        $gte: params.from,
        $lte: params.to
      }
    };

    if (params.categories.length != 0)
      conditions.categories = {
        $in: params.categories.map((category: CategoryDocument) => {
          return category._id;
        })
      };

    let groupBy: any = {};
    let dateFromParts: any = {};

    if (params.groupBy == OperationGroupBy.DayAndCategory) {
      groupBy = {
        'day': { $dayOfMonth: '$date' },
        'month': { $month: '$date' },
        'year': { $year: '$date' }
      };

      dateFromParts = {
        year: '$date.year',
        month: '$date.month',
        day: '$date.day'
      };
    }

    else if (params.groupBy == OperationGroupBy.MonthAndCategory) {
      groupBy = {
        'month': { $month: '$date' },
        'year': { $year: '$date' }
      };

      dateFromParts = {
        year: '$date.year',
        month: '$date.month'
      };
    }

    else if (params.groupBy == OperationGroupBy.YearAndCategory) {
      groupBy = {
        'year': { $year: '$date' }
      };

      dateFromParts = {
        year: '$date.year'
      };
    }

    else
      throw new Error(`SearchByDateAndCategory failed: invalid groupBy ${params.groupBy}`);

    return this.aggregate(params.uuid, [
      { $match: conditions },

      { $unwind: '$categories' },

      { $sort: { date: 1 } },
      { $limit: 100 },

      {
        $lookup: {
          from: 'categories',
          localField: 'categories',
          foreignField: '_id',
          as: 'categories'
        }
      },

      {
        $group: {
          _id: {
            category: '$categories',
            date: groupBy
          },
          operations: {
            $push: {
              _id: '$_id',
              uuid: '$uuid',
              name: '$name',
              date: '$date',
              amount: '$amount'
            }
          },
          total: { $sum: '$amount' },
          count: { $sum: 1 },
          average: { $avg: '$amount' },
          min: { $min: '$amount' },
          max: { $max: '$amount' }
        }
      },

      {
        $project: {
          _id: 0,
          date: '$_id.date',
          category: { $arrayElemAt: ['$_id.category', 0] },
          operations: '$operations',
          total: '$total',
          count: '$count',
          average: '$average',
          min: '$min',
          max: '$max'
        }
      },

      {
        $group: {
          _id: '$date',
          results: {
            $push: {
              category: '$category',
              operations: '$operations',
              total: '$total',
              count: '$count',
              average: '$average',
              min: '$min',
              max: '$max'
            }
          },
          total: { $sum: '$total' },
          count: { $sum: '$count' },
          average: { $avg: '$average' },
          min: { $min: '$min' },
          max: { $max: '$max' },
          date: { $first: { $dateFromParts: dateFromParts } }
        }
      },

      { $sort: { date: 1 } },

      {
        $group: {
          _id: null,
          results: {
            $push: {
              date: "$date",
              results: "$results",
              total: "$total",
              count: "$count",
              average: "$average",
              min: "$min",
              max: "$max"
            }
          },
          total: { $sum: "$total" },
          count: { $sum: "$count" },
          average: { $avg: "$total" },
          min: { $min: "$min" },
          max: { $max: "$max" }
        }
      }

    ]).exec()
      .then((results: any[]) => {
        if (results.length == 0)
          return null;

        return new SearchOperationByDateAndCategoryResults({
          results: results[0].results.map((result: any) => {
            return {
              date: result.date,
              results: result.results.map((res: any) => {
                return {
                  category: new Category(res.category),
                  operations: res.operations.map((operation: any) => {
                    return new Operation(operation);
                  }),

                  total: res.total,
                  count: res.count,
                  average: res.average,
                  min: res.min,
                  max: res.max
                };
              }),

              total: result.total,
              count: result.count,
              average: result.average,
              min: result.min,
              max: result.max
            };
          }),

          total: results[0].total,
          count: results[0].count,
          average: results[0].average,
          min: results[0].min,
          max: results[0].max
        });
      })
      .catch((err: any) => { throw err; });
  }
}
