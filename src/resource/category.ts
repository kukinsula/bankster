import { Resource, Equaler } from './resource';
import { NewRandomUuid } from '../uuid';

export class Category implements Resource, Equaler<string> {
  public uuid: string;
  public name: string;
  public color: string;

  constructor(raw: any = {}) {
    this.uuid = raw.uuid || NewRandomUuid();
    this.name = raw.name || '';
    this.color = raw.color || '';
  }

  public Public(): any {
    return {
      uuid: this.uuid,
      name: this.name,
      color: this.color
    };
  }

  public Equals(id: string): boolean {
    return this.name == id || this.uuid == id;
  }
}
