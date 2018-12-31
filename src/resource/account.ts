import { Resource, Equaler } from './resource';
import { User } from './user';
import { Operation } from './operation';
import { NewRandomUuid } from '../uuid';

export class Account implements Resource, Equaler<string> {
  public uuid: string;
  public name: string;
  public owner: User;
  public operations: Operation[];

  constructor(raw: any = {}) {
    this.uuid = raw.uuid || NewRandomUuid();
    this.name = raw.name || '';
    this.owner = raw.owner;
    this.operations = raw.operations || [];
  }

  public Public(): any {
    return {
      uuid: this.uuid,
      name: this.name,
      operations: this.operations == undefined ? [] :
        this.operations.map((operation: Operation) => {
          return operation.Public();
        })
    };
  }

  public Equals(id: string): boolean {
    return this.name == id || this.uuid == id;
  }
}
