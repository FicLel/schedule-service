import { WithId, Document } from 'mongodb';
import {BaseRepository} from '../base/AbstractBaseRepository';
import { SchoolYear } from '../models/SchoolYear';

export class RepositorySchoolYear extends BaseRepository<SchoolYear> {
  async getActiveSchoolYear(): Promise<WithId<Document>> {
    const response = await this._collection.findOne({'isActive': true});
    
    return response;
  }
}