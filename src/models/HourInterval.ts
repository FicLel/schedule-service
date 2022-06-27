import { ObjectId } from 'mongodb';
export class HourInterval {
  _id: ObjectId;
  start: number | string;
  end: number | string;

  constructor(start: number | string, end: number | string, id: ObjectId = null) {
    this._id = id;
    this.start = start;
    this.end = end;
  }
  setId(id: ObjectId) {
    this._id = id;
  }
}