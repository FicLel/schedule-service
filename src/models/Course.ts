import { ObjectId } from 'mongodb';
export class Course {
  _id: ObjectId;
  name: string;
  code: string;
  hours: number;

  constructor(name: string, code: string, hours: number, id: ObjectId = null) {
    this._id = id;
    this.code = code;
    this.name = name;
    this.hours = hours;
  }
  setId(id: ObjectId) {
    this._id = id;
  }
}