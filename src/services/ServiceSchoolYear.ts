import { RepositorySchoolYear } from '../repositories/RepositorySchoolYear';
import { SchoolYear } from '../models/SchoolYear';
import { DbInstance } from '../config/db-connector';
import { DB_CREDENTIALS } from '../environment/variables';
import { ObjectId, MongoError,Db } from 'mongodb';

export class ServiceSchoolYear {

  async create(startDate: string, endDate: string, isActive: boolean): Promise<SchoolYear> {
    
    if (!startDate.trim().length && !endDate.trim().length) return null;
    const tempStart: Date = new Date(startDate);
    const tempEnd: Date = new Date(endDate);
    const db: Db  = (await DbInstance.getInstance(DB_CREDENTIALS)).db;
    const reposotiry: RepositorySchoolYear = new RepositorySchoolYear(db, 'SchoolYear');
    const schoolyear: SchoolYear = new SchoolYear(tempStart, tempEnd, isActive);
    const id: ObjectId = await reposotiry.create(schoolyear);
    
    schoolyear.setId(id);
    
    return schoolyear;
  }

  async update(id: string, startDate: string, endDate: string, isActive: boolean): Promise<SchoolYear> {
    if (!startDate.trim().length && !endDate.trim().length) return null;
    const tempStart: Date = new Date(startDate);
    const tempEnd: Date = new Date(endDate);
    const schoolyear: SchoolYear = new SchoolYear(tempStart, tempEnd, isActive, new ObjectId(id));
    const db: Db  = (await DbInstance.getInstance(DB_CREDENTIALS)).db;
    const reposotiry: RepositorySchoolYear = new RepositorySchoolYear(db, 'SchoolYear');
    const response: boolean = await reposotiry.update(id, schoolyear);
    if (response) return schoolyear;
    return null;
  }

  async delete(id: string): Promise<boolean> {
    const tempObject: ObjectId = new ObjectId(id);
    const db: Db  = (await DbInstance.getInstance(DB_CREDENTIALS)).db;
    const repository: RepositorySchoolYear = new RepositorySchoolYear(db, 'SchoolYear');
    const response = await repository.delete(tempObject);
    
    return response;
  }

  async find(): Promise<SchoolYear[]> {
    const tempSchoolYear: SchoolYear[] = [];
    const db: Db  = (await DbInstance.getInstance(DB_CREDENTIALS)).db;
    const repository: RepositorySchoolYear = new RepositorySchoolYear(db, 'SchoolYear');
    const response = await repository.find();
    response.forEach((schoolyear) => {
      tempSchoolYear.push(new SchoolYear(schoolyear?.startDate, schoolyear?.endDate, schoolyear?.isActive, schoolyear?._id));
    });
    return tempSchoolYear;
  }

  async findOne(id: string): Promise<SchoolYear> {
    const tempObject: ObjectId = new ObjectId(id);
    const db: Db  = (await DbInstance.getInstance(DB_CREDENTIALS)).db;
    const repository: RepositorySchoolYear = new RepositorySchoolYear(db, 'SchoolYear');
    const response = await repository.findOne(tempObject);
    if (!response?._id || response?.id === null) {
      return null;
    }
    const tempSchoolYear = new SchoolYear(response?.startDate, response?.endDate, response?.isActive, response?._id);
    
    return tempSchoolYear;
  }

  async findActiveYear(): Promise<SchoolYear> {
    const db: Db  = (await DbInstance.getInstance(DB_CREDENTIALS)).db;
    const repository: RepositorySchoolYear = new RepositorySchoolYear(db, 'SchoolYear');
    const response = await repository.getActiveSchoolYear();
    if (!response?._id || response?.id === null) {
      return null;
    }
    const tempSchoolYear = new SchoolYear(response?.startDate, response?.endDate, response?.isActive, response?._id);
    
    return tempSchoolYear;
  }

}