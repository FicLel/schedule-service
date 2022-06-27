import { RepositoryCourse } from '../repositories/RepositoryCourse';
import { Course } from '../models/Course';
import { DbInstance } from '../config/db-connector';
import { DB_CREDENTIALS } from '../environment/variables';
import { ObjectId, MongoError,Db } from 'mongodb';

export class ServiceCourse {

  async create(name: string, code: string, hours: number): Promise<Course> {
    const db: Db  = (await DbInstance.getInstance(DB_CREDENTIALS)).db;
    const reposotiry: RepositoryCourse = new RepositoryCourse(db, 'Course');
    const course: Course = new Course(name, code, hours);
    const id: ObjectId = await reposotiry.create(course);
    
    course.setId(id);
    
    return course;
  }

  async update(id: string, name: string, code: string, hours: number): Promise<Course> {
    const course: Course = new Course(name, code, hours, new ObjectId(id));
    const db: Db  = (await DbInstance.getInstance(DB_CREDENTIALS)).db;
    const reposotiry: RepositoryCourse = new RepositoryCourse(db, 'Course');
    const response: boolean = await reposotiry.update(id, course);
    if (response) return course;
    return null;
  }

  async delete(id: string): Promise<boolean> {
    const tempObject: ObjectId = new ObjectId(id);
    const db: Db  = (await DbInstance.getInstance(DB_CREDENTIALS)).db;
    const repository: RepositoryCourse = new RepositoryCourse(db, 'Course');
    const response = await repository.delete(tempObject);
    
    return response;
  }

  async find(): Promise<Course[]> {
    const tempCourse: Course[] = [];
    const db: Db  = (await DbInstance.getInstance(DB_CREDENTIALS)).db;
    const repository: RepositoryCourse = new RepositoryCourse(db, 'Course');
    const response = await repository.find();
    response.forEach((course) => {
      tempCourse.push(new Course(course?.name, course?.code, course?.hours , course?._id));
    });
    return tempCourse;
  }

  async findOne(id: string): Promise<Course> {
    const tempObject: ObjectId = new ObjectId(id);
    const db: Db  = (await DbInstance.getInstance(DB_CREDENTIALS)).db;
    const repository: RepositoryCourse = new RepositoryCourse(db, 'Course');
    const response = await repository.findOne(tempObject);
    
    const tempCourse = new Course(response?.name, response?.code, response?.hours ,response?._id);
    
    return tempCourse;
  }

}