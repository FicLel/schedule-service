import { WithId, Document, ObjectId } from 'mongodb';
export interface IRead<T> {
    find(): Promise<WithId<Document>[]>;
    findOne(id: ObjectId): Promise<WithId<Document>>;
}