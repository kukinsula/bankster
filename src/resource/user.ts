import { Resource, Equaler } from './resource';
import { Account } from './account';
import { Category } from './category';
import { NewRandomUuid } from '../uuid';

export class User implements Resource, Equaler<string> {
  public uuid: string;
  public email: string;
  public firstName: string;
  public lastName: string;
  public password: string;
  public accounts: Account[]
  public categories: Category[]

  constructor(raw: any = {}) {
    this.uuid = raw.uuid || NewRandomUuid();
    this.email = raw.email || '';
    this.firstName = raw.firstName || '';
    this.lastName = raw.lastName || '';
    this.password = raw.password || '';
    this.accounts = raw.accounts || [];
    this.categories = raw.categories || [];
  }

  public Public(): any {
    return {
      uuid: this.uuid,
      email: this.email,
      firstName: this.firstName,
      lastName: this.lastName,
      accounts: this.accounts == undefined ? [] :
        this.accounts.map((account: Account) => {
          return account.Public();
        }),
      categories: this.categories.map((category: Category) => {
        return category.Public();
      })
    };
  }

  public Equals(id: string): boolean {
    return this.email == id || this.uuid == id;
  }
}
