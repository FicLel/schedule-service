import { ObjectId } from 'mongodb';
export class SchoolYear {
  _id: ObjectId;
  startDate: Date;
  endDate: Date;
  isActive: boolean;

  constructor(startDate: Date, endDate: Date, isActive: boolean, id: ObjectId = null) {
    this._id = id;
    this.startDate = startDate;
    this.endDate = endDate;
    this.isActive = isActive;
  }
  setId(id: ObjectId) {
    this._id = id;
  }
}