import { ObjectId} from 'mongodb'
export interface IWrite<T> {
    create(item: T): Promise<ObjectId | null>;
    update(id: string, item: T): Promise<boolean>;
    delete(id: ObjectId): Promise<boolean>;
}