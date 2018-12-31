import * as joi from 'joi';
import { OperationGroupBy } from '../../mongo/mongo';

const Options = { abortEarly: false };

function Compile(v: any, options: any = Options): joi.ObjectSchema {
  return joi.object(v).options(options);
}

export const
  Signup = Compile({
    email: joi.string().email().required(),
    firstName: joi.string().required(),
    lastName: joi.string().required(),
    password: joi.string().required()
  }),

  Signin = Compile({
    email: joi.string().email().required(),
    password: joi.string().required()
  }),

  CreateAccount = Compile({
    name: joi.string().required()
  }),

  AddOperation = Compile({
    name: joi.string().required(),
    date: joi.date().required(),
    amount: joi.number().required(),
    categories: joi.array().items(joi.string())
  }),

  GroupOperations = Compile({
    from: joi.date().required(),
    to: joi.date().required(),
    size: joi.number().required(),
    by: joi.string().allow(
      OperationGroupBy.Category,
      OperationGroupBy.Day,
      OperationGroupBy.Month,
      OperationGroupBy.Year,
      OperationGroupBy.DayAndCategory,
      OperationGroupBy.MonthAndCategory,
      OperationGroupBy.YearAndCategory
    ).required(),
    categories: joi.string().allow('').optional()
  }),

  SearchOperations = Compile({
    before: joi.date().optional(),
    after: joi.date().optional(),
    name: joi.string().disallow('').optional(),
    categories: joi.string().optional(),
    eq: joi.number().optional(),
    lte: joi.number().optional(),
    gte: joi.number().optional()
  }),

  Uuid = joi.string().uuid().options(Options);
