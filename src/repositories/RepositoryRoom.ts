import { Db, ObjectId, WithId } from 'mongodb';
import {BaseRepository} from '../base/AbstractBaseRepository';
import { Room } from '../models/Room';

export class RepositoryRoom extends BaseRepository<Room> {
  async getAvailableRooms(ids: ObjectId[], capacity: number): Promise<any[]> {
    const response = await this._collection.find({
      $and: [
        {_id: {'$nin': ids}},
        {capacity: {'$gte': capacity}}
      ]
    }).toArray();
    return response;
  }
}