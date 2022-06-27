import { RepositoryHourInterval } from '../repositories/RepositoryHourInterval';
import { HourInterval } from '../models/HourInterval';
import { DbInstance } from '../config/db-connector';
import { DB_CREDENTIALS } from '../environment/variables';
import { ObjectId, MongoError,Db } from 'mongodb';
import { ServiceSchedule } from './ServiceSchedule';

export class ServiceHourInterval {

  async create(start: string, end: string): Promise<HourInterval> {

    const tempStart: number = this.convertHourToMinues(start);
    const tempEnd: number = this.convertHourToMinues(end);

    if (tempStart < 0 || tempEnd < 0) return null;

    const db: Db  = (await DbInstance.getInstance(DB_CREDENTIALS)).db;

    const reposotiry: RepositoryHourInterval = new RepositoryHourInterval(db, 'HourInterval');
    
    if (await reposotiry.validateHourInterval(tempStart, tempEnd)) return null;
    
    const hourinterval: HourInterval = new HourInterval(tempStart, tempEnd);
    const id: ObjectId = await reposotiry.create(hourinterval);
    
    hourinterval.setId(id);
    
    return hourinterval;
  }

  async update(id: string, start: string, end: string): Promise<HourInterval> {

    const tempStart: number = this.convertHourToMinues(start);
    const tempEnd: number = this.convertHourToMinues(end);

    if (tempStart < 0 || tempEnd < 0) return null;

    const hourinterval: HourInterval = new HourInterval(tempStart, tempEnd, new ObjectId(id));
    const db: Db  = (await DbInstance.getInstance(DB_CREDENTIALS)).db;
    const reposotiry: RepositoryHourInterval = new RepositoryHourInterval(db, 'HourInterval');
    if (await reposotiry.validateHourInterval(tempStart, tempEnd)) return null;
    const response: boolean = await reposotiry.update(id, hourinterval);
    
    if (response) return hourinterval;
    return null;
  }

  async delete(id: string): Promise<boolean> {
    const tempObject: ObjectId = new ObjectId(id);
    const db: Db  = (await DbInstance.getInstance(DB_CREDENTIALS)).db;
    const repository: RepositoryHourInterval = new RepositoryHourInterval(db, 'HourInterval');
    const response = await repository.delete(tempObject);
    
    return response;
  }

  async find(): Promise<HourInterval[]> {
    const tempHourInterval: HourInterval[] = [];
    const db: Db  = (await DbInstance.getInstance(DB_CREDENTIALS)).db;
    const repository: RepositoryHourInterval = new RepositoryHourInterval(db, 'HourInterval');
    const response = await repository.findAsc();
    response.forEach((hourinterval) => {
      tempHourInterval.push(new HourInterval(this.transformMinutesToHours(hourinterval?.start), this.transformMinutesToHours(hourinterval?.end), hourinterval?._id));
    });
    return tempHourInterval;
  }

  async findOne(id: string): Promise<HourInterval> {
    const tempObject: ObjectId = new ObjectId(id);
    const db: Db  = (await DbInstance.getInstance(DB_CREDENTIALS)).db;
    const repository: RepositoryHourInterval = new RepositoryHourInterval(db, 'HourInterval');
    const response = await repository.findOne(tempObject);
    
    if (!response?._id || response?.id === null) {
      return null;
    }
    const tempHourInterval = new HourInterval(this.transformMinutesToHours(response?.start), this.transformMinutesToHours(response?.end) ,response?._id);
    
    return tempHourInterval;
  }
  
  

  convertHourToMinues(hour: string): number {
    const splitHours: string[] = hour.split(':');
    if (splitHours.length < 2 || splitHours.length > 2) return -1;
    const hours: number = parseInt(splitHours[0], 10);
    const minutes: number = parseInt(splitHours[1], 10);
    if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
      return -1;
    }
    return (hours * 60) + minutes; 
  }

  transformMinutesToHours(time: number): string {
    
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