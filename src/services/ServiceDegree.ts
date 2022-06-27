import { RepositoryDegree } from '../repositories/RepositoryDegree';
import { Degree } from '../models/Degree';
import { DbInstance } from '../config/db-connector';
import { DB_CREDENTIALS } from '../environment/variables';
import { ObjectId, MongoError,Db } from 'mongodb';

export class ServiceDegree {

  async create(name: string, code: string): Promise<Degree> {
    const db: Db  = (await DbInstance.getInstance(DB_CREDENTIALS)).db;
    const reposotiry: RepositoryDegree = new RepositoryDegree(db, 'Degree');
    const degree: Degree = new Degree(name, code);
    const id: ObjectId = await reposotiry.create(degree);
    
    degree.setId(id);
    
    return degree;
  }

  async update(id: string, code: string, name: string): Promise<Degree> {
    const degree: Degree = new Degree(name, code, new ObjectId(id));
    const db: Db  = (await DbInstance.getInstance(DB_CREDENTIALS)).db;
    const reposotiry: RepositoryDegree = new RepositoryDegree(db, 'Degree');
    const response: boolean = await reposotiry.update(id, degree);
    if (response) return degree;
    return null;
  }

  async delete(id: string): Promise<boolean> {
    const tempObject: ObjectId = new ObjectId(id);
    const db: Db  = (await DbInstance.getInstance(DB_CREDENTIALS)).db;
    const repository: RepositoryDegree = new RepositoryDegree(db, 'Degree');
    const response = await repository.delete(tempObject);
    
    return response;
  }

  async find(): Promise<Degree[]> {
    const tempDegree: Degree[] = [];
    const db: Db  = (await DbInstance.getInstance(DB_CREDENTIALS)).db;
    const repository: RepositoryDegree = new RepositoryDegree(db, 'Degree');
    const response = await repository.find();
    response.forEach((degree) => {
      tempDegree.push(new Degree(degree?.name, degree?.code, degree?._id));
    });
    return tempDegree;
  }

  async findOne(id: string): Promise<Degree> {
    const tempObject: ObjectId = new ObjectId(id);
    const db: Db  = (await DbInstance.getInstance(DB_CREDENTIALS)).db;
    const repository: RepositoryDegree = new RepositoryDegree(db, 'Degree');
    const response = await repository.findOne(tempObject);
    if (!response?._id || response?.id === null) {
      return null;
    }
    const tempDegree = new Degree(response?.name, response?.code, response?._id);
    
    return tempDegree;
  }

}