import { ObjectId, WithId, Document } from 'mongodb';
import {BaseRepository} from '../base/AbstractBaseRepository';
import { Teacher } from '../models/Teacher';

export class RepositoryTeacher extends BaseRepository<Teacher> {
  async findManyTeachers(teachers: ObjectId[]): Promise<WithId<Document>[]> {
    const tempTeachers: WithId<Document>[] = await this._collection.find({'_id': {'$in': teachers}}).toArray();
    return tempTeachers;
  }
}