import { ObjectId } from 'mongodb';
import { IDaysHours } from '../interfaces/IDaysHours';

export class Teacher {
  _id: ObjectId;
  name: string;
  busyDays: IDaysHours[];

  constructor(name: string, busyDays: IDaysHours[] = [], id: ObjectId = null) {
    this.name = name;
    this.busyDays = busyDays;
    this._id = id;
  }
  setId(id: ObjectId) {
    this._id = id;
  }
  changeHoursFromBusyDays(converterFunction: (params: number) => string) {
    let tempStartHours: string = '';
    let tempEndHours: string = '';
    this.busyDays = this.busyDays.map((day) => {
      tempStartHours = converterFunction(Number(day.start));
      tempEndHours = converterFunction(Number(day.end));
      return <IDaysHours> {
        day: day.day,
        start: tempStartHours,
        end: tempEndHours,
      };
    });
    
  }
}