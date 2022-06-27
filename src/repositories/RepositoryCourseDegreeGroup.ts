import { ObjectId, WithId, Document } from 'mongodb';
import {BaseRepository} from '../base/AbstractBaseRepository';
import { CourseDegreeGroup } from '../models/CourseDegreeGroup';

export class RepositoryCourseDegreeGroup extends BaseRepository<CourseDegreeGroup> {
  async getCourseByGroup(id: ObjectId): Promise<WithId<Document>[]> {
    const data = await this._collection.find({'group': {'$in': [id]}}).toArray();
    return data;
  }
  
}