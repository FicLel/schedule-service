import { ObjectId } from 'mongodb';
export class Room {
  _id: ObjectId;
  name: string;
  capacity: number;

  constructor(name: string, capacity: number, id: ObjectId = null) {
    this._id = id;
    this.name = name;
    this.capacity = capacity;
  }
  setId(id: ObjectId) {
    this._id = id;
  }
}