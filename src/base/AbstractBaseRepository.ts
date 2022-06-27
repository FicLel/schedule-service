import { IWrite } from '../interfaces/IWrite';
import { IRead } from '../interfaces/IRead';

import { MongoClient, Db, Collection, InsertOneResult, ObjectId, WithId, Document} from 'mongodb';

export abstract class BaseRepository<T> implements IWrite<T>, IRead<T> {
  _collection: Collection;
  constructor(db: Db, collectionName: string) {
    this._collection = db.collection(collectionName);
  }
  async create(item: T): Promise<ObjectId> {
    const result: InsertOneResult = await this._collection.insertOne(item);
    return result.acknowledged ? result.insertedId : null;
  }
  async update(id: string, item: T): Promise<boolean> {
    const tempObject: ObjectId = new ObjectId(id);
    const result = await this._collection.findOneAndUpdate({'_id': tempObject}, {$set: item}, {returnDocument: 'after'});
    if (result.value) {
      return true;
    } 
    return false;
  }
  async delete(id: ObjectId): Promise<boolean> {
    const result = await this._collection.deleteOne({'_id': id});
    return result.deletedCount > 0;
  }
  async find(): Promise<WithId<Document>[]> {
    const result = await this._collection.find({}).toArray();
    return result;
  }
  async findOne(id: ObjectId): Promise<WithId<Document>> {
    const result = await this._collection.findOne({'_id': id});
    return result;
  }
  
}
