import { ObjectId } from 'mongodb';
import { Degree } from './Degree';
export class Group {
  _id: ObjectId;
  father: Group | null | ObjectId;
  code: string;
  quantity: number;
  degree: Degree | ObjectId;

  constructor(code: string, quantity: number, degree: Degree | ObjectId, father: Group | ObjectId = null, id: ObjectId = null) {
    this._id = id;
    this.code = code;
    this.father = father;
    this.quantity = quantity;
    this.degree = degree;
  }
  setId(id: ObjectId) {
    this._id = id;
  }
  setFather(father: Group) {
    this.father = father;
  }
  setDegree(degree: Degree) {
    this.degree = degree;
  }
}