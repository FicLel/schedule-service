import { ObjectId, WithId, Document } from 'mongodb';
import {BaseRepository} from '../base/AbstractBaseRepository';
import { Group } from '../models/Group';

export class RepositoryGroup extends BaseRepository<Group> {
  async findManyGroup(groups: ObjectId[]): Promise<WithId<Document>[]> {
    const tempGroups: WithId<Document>[] = await this._collection.find({'_id': {'$in': groups}}).toArray();
    return tempGroups;
  }
}