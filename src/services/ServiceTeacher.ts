import { RepositoryTeacher } from '../repositories/RepositoryTeacher';
import { Teacher } from '../models/Teacher';
import { IDaysHours } from '../interfaces/IDaysHours';
import { DbInstance } from '../config/db-connector';
import { DB_CREDENTIALS } from '../environment/variables';
import { ObjectId, MongoError,Db } from 'mongodb';

export class ServiceTeacher {

  async create(name: string, daysHours: IDaysHours[]): Promise<Teacher> {
    const db: Db  = (await DbInstance.getInstance(DB_CREDENTIALS)).db;
    const tempDaysHours: IDaysHours[] = [];
    if (daysHours.length > 0) {
      daysHours.forEach((days) => {
        days.start = this.convertHourToMinutes(days.start.toString());
        days.end = this.convertHourToMinutes(days.end.toString());
        tempDaysHours.push(days);
      });
    }
    
    const reposotiry: RepositoryTeacher = new RepositoryTeacher(db, 'Teacher');
    const teacher: Teacher = new Teacher(name, tempDaysHours);
    const id: ObjectId = await reposotiry.create(teacher);
    
    teacher.setId(id);
    teacher.changeHoursFromBusyDays(this.transformmMinutesToHours)
    return teacher;
  }

  async update(id: string, name: string, daysHours: IDaysHours[]): Promise<Teacher> {
    const tempDaysHours: IDaysHours[] = [];
    if (daysHours.length > 0) {
      daysHours.forEach((days) => {
        days.start = this.convertHourToMinutes(days.start.toString());
        days.end = this.convertHourToMinutes(days.end.toString());
        tempDaysHours.push(days);
      });
    }
    const teacher: Teacher = new Teacher(name, tempDaysHours, new ObjectId(id));
    const db: Db  = (await DbInstance.getInstance(DB_CREDENTIALS)).db; 
    const reposotiry: RepositoryTeacher = new RepositoryTeacher(db, 'Teacher');
    const response: boolean = await reposotiry.update(id, teacher);
    if (response) {
      teacher.changeHoursFromBusyDays(this.transformmMinutesToHours)
      return teacher;
    }
    return null;
  }

  async delete(id: string): Promise<boolean> {
    const tempObject: ObjectId = new ObjectId(id);
    const db: Db  = (await DbInstance.getInstance(DB_CREDENTIALS)).db;
    const repository: RepositoryTeacher = new RepositoryTeacher(db, 'Teacher');
    const response = await repository.delete(tempObject);
    
    return response;
  }

  async find(): Promise<Teacher[]> {
    const tempTeacher: Teacher[] = [];
    const db: Db  = (await DbInstance.getInstance(DB_CREDENTIALS)).db;
    const repository: RepositoryTeacher = new RepositoryTeacher(db, 'Teacher');
    const response = await repository.find();
    let tempDaysHours: IDaysHours[] = [];
    let tempT: Teacher = null;
    response.forEach((teacher) => {
      tempDaysHours = [];
      if (teacher?.busyDays&& teacher?.busyDays.length > 0) {
        teacher.busyDays.forEach((days) => {
          tempDaysHours.push(days)
        });
      }
      tempT = new Teacher(teacher?.name, tempDaysHours, teacher?._id);
      tempT.changeHoursFromBusyDays(this.transformmMinutesToHours);
      tempTeacher.push(tempT);
    });
    return tempTeacher;
  }

  async findOne(id: string): Promise<Teacher> {
    const tempObject: ObjectId = new ObjectId(id);
    const db: Db  = (await DbInstance.getInstance(DB_CREDENTIALS)).db;
    const repository: RepositoryTeacher = new RepositoryTeacher(db, 'Teacher');
    const response = await repository.findOne(tempObject);
    
    if (!response?._id || response?.id === null) {
      return null;
    }
    const tempDaysHours: IDaysHours[] = [];
    if (response?.busyDays && response?.busyDays.length > 0) {
      response.busyDays.forEach((days) => {
        tempDaysHours.push(days)
      });
    }
    const tempTeacher = new Teacher(response?.name, tempDaysHours ,response?._id);
    
    return tempTeacher;
  }

  convertHourToMinutes(hour: string): number {
    const splitHours: string[] = hour.split(':');
    if (splitHours.length < 2 || splitHours.length > 2) return -1;
    const hours: number = parseInt(splitHours[0], 10);
    const minutes: number = parseInt(splitHours[1], 10);
    if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
      return -1;
    }
    return (hours * 60) + minutes; 
  }

  transformmMinutesToHours(time: number): string {
    
    const tempHours: number  = time / 60;
    const tempMinutes: number = time % 60;
     
    const hours: number = parseInt(tempHours.toString(), 10);
    const minutes: number = parseInt(tempMinutes.toString(), 10);
    if (hours < 0 || hours > 23 || minutes > 59 || minutes < 0) {
      return 'Hora invalida';
    } 
  
    return ''+hours+':'+minutes;
  };

}