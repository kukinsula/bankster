import { Resource, Equaler } from './resource';
import { Account } from './account';
import { Category } from './category';
import { NewRandomUuid } from '../uuid';

export enum OperationKind {
  Debit = 'DEBIT',
  Credit = 'CREDIT'
}

export class Operation implements Resource, Equaler<string> {
  public uuid: string;
  public name: string;
  public account: Account;
  public date: Date;
  public amount: number;
  public categories: Category[];

  constructor(raw: any = {}) {
    this.uuid = raw.uuid || NewRandomUuid();
    this.name = raw.name || '';
    this.account = raw.account;
    this.date = raw.date || new Date();
    this.amount = raw.amount || 0;
    this.categories = raw.categories || [];
  }

  public Kind(): OperationKind {
    return this.amount > 0 ? OperationKind.Credit : OperationKind.Debit;
  }

  public Public(): any {
    return {
      uuid: this.uuid,
      name: this.name,
      date: this.date,
      amount: this.amount,
      categories: this.categories == undefined ? [] :
        this.categories.map((category: Category) => {
          return category.Public();
        })
    };
  }

  public Equals(id: string): boolean {
    return this.name == id || this.uuid == id;
  }
}
