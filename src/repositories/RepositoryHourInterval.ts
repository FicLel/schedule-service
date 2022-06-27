import {BaseRepository} from '../base/AbstractBaseRepository';
import { HourInterval } from '../models/HourInterval';
import { WithId, Document} from 'mongodb';

export class RepositoryHourInterval extends BaseRepository<HourInterval> {
  /*
  * This method verifys if an hours starts out of and interval of time defined on the database, and if the interval does not includes another interval
  * inside of itself.
  * 
  * @params startHour: number - day hour converted to day minutes when interval starts
  * @paramas endHour: number - day hour converted to day minutes when interval end
  *
  * @return Promise<boolean> - return if the interval can be inserted in the database
  */
  async validateHourInterval(startHour: number, endHour: number): Promise<boolean> {
    
    if (startHour >= endHour) return false;
    
    // Compare if start hour its not the same as another start interval and does not start in between another interval 
    const startValidations = await this._collection.find({
      $or: [
        {start: { $eq: startHour }},
        {$and: [
          {start:{$lt:startHour}},
          {end: {$gt:startHour}}
        ]
      }]})
      .toArray();
    
    // Compare if interval does not finish between another interval or after, the start hour is for validate just the intervals after the starting hour
    const endValidation = await this._collection.find({
      $and: [
        {
          start: { $gt: startHour }
        },
        {
          start: {$lt:endHour}
        },
        {
          end: {$lt:endHour}
        }
        ]
      })
      .toArray();
     
    return (startValidations.length !== 0 || endValidation.length !== 0);
  }

  async findAsc(): Promise<WithId<Document>[]> {
    const result = await this._collection.find({}).sort('start', 1).toArray();
    return result;
  }
}