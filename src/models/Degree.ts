import { ObjectId } from 'mongodb';

export class Degree {
  _id: ObjectId | null;
  name: string;
  code: string;
  constructor(name: string, code: string, id: ObjectId = null) {
    this._id = id;
    this.name = name;
    this.code = code;
  }
  setId(id: ObjectId) {
    this._id = id;
  }
}